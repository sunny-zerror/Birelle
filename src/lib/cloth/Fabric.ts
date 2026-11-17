/*
 * Fabric — one garment as a 2.5D Verlet cloth.
 *
 * Simulation happens in screen pixels (x right, y DOWN) with a third depth
 * axis z. The cloth is drawn with an oblique projection:
 *
 *     screenY = min(floor, y + z * OBLIQUE)
 *
 * so fabric lying on the floor with depth reads as a thin, crumpled band —
 * exactly the "pile of clothes on the ground" look. Depth also lets the
 * fabric fold over itself without stretching the artwork.
 *
 * Constraints: structural (neighbours), shear (diagonals) and very soft bend
 * links (two apart) so garments flop and crumple.
 */
import type { Bag, Bounds, Grab, GarmentAsset, Grip } from "./types";

export const OBLIQUE = 0.55;
const GRAVITY = 0.28; // px per frame² (fixed 60 Hz step)
const MAX_SPEED = 16; // px per frame — safety net only
const AIR_DRAG = 0.988;
const REST_DRAG = 0.9; // extra damping once a piece lies on the floor
const K_STRUCT = 1;
const K_SHEAR = 0.6;
const K_BEND = 0.14;
const STATIC_FRICTION = 0.35; // px — slower slides than this stop dead on the floor
const KINETIC_FRICTION = 0.55;
const BAG_PUSH = 4; // px per solver pass — a piece overlapping the bag slides off it instead of jumping
const BAG_SHOVE = 0.6; // px per frame — brushing the bag's side tips a piece away, so none ends up leaning on it
const RIM_SLIDE = 4; // px per frame — a piece let go above the bag (not dropped in) slides off its top to the floor

interface FabricOptions {
  /** garment / look index */
  index: number;
  /** garment width in px */
  width: number;
  asset: GarmentAsset;
  viewW: number;
  viewH: number;
  /** horizontal centre to spawn at (random across the view if left out) */
  centerX?: number;
  /** spawn already on screen (reduced motion) */
  initial?: boolean;
}

export default class Fabric {
  readonly index: number;
  readonly asset: GarmentAsset;
  readonly cols: number;
  readonly rows: number;
  readonly n: number;

  w: number;
  h: number;
  sleeping = false;
  calm = 0;
  landedFrames = 0;
  entered = false;
  floor = Infinity;
  /** dropped into the bag: falls between its walls instead of bouncing off its body */
  bagged = false;
  /** which side of the bag this piece slides off when it lands on top: -1 left, 1 right */
  private rimSide = 1;
  /** bumps whenever the shape changes (for GPU upload) */
  version = 0;

  readonly x: Float32Array;
  readonly y: Float32Array;
  readonly z: Float32Array;
  readonly px: Float32Array;
  readonly py: Float32Array;
  readonly pz: Float32Array;
  readonly u: Float32Array;
  readonly v: Float32Array;
  readonly solid: Uint8Array;
  readonly contact: Uint8Array;

  readonly la: Int32Array;
  readonly lb: Int32Array;
  readonly lk: Float32Array;
  readonly rest: Float32Array;
  readonly triangles: Uint32Array;

  constructor({ index, width, asset, viewW, viewH, centerX, initial = false }: FabricOptions) {
    this.index = index;
    this.w = width;
    this.h = width * asset.aspect;
    this.asset = asset;
    this.cols = viewW < 650 ? 20 : 28;
    this.rows = this.cols;

    const C = this.cols + 1;
    const R = this.rows + 1;
    const n = C * R;
    this.n = n;
    this.x = new Float32Array(n);
    this.y = new Float32Array(n);
    this.z = new Float32Array(n);
    this.px = new Float32Array(n);
    this.py = new Float32Array(n);
    this.pz = new Float32Array(n);
    this.u = new Float32Array(n);
    this.v = new Float32Array(n);
    this.solid = new Uint8Array(n);
    this.contact = new Uint8Array(n);

    const center = centerX ?? width * 0.65 + Math.random() * (viewW - width * 1.3);
    const top = initial ? viewH * 0.68 : -this.h - 25;
    const angle = (Math.random() - 0.5) * 0.7;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const { alpha, maskW, maskH } = asset;

    for (let r = 0; r < R; r++) {
      for (let c = 0; c < C; c++) {
        const i = r * C + c;
        const u = c / this.cols;
        const v = r / this.rows;
        const dx = (u - 0.5) * this.w;
        const dy = (v - 0.5) * this.h;
        const x = center + dx * cos - dy * sin;
        const y = top + dy * cos + dx * sin;
        // a soft initial ripple so the fabric starts folding as it falls
        const z = Math.sin(u * Math.PI * 2 + 0.4) * this.w * 0.075 + Math.sin(v * Math.PI * 2) * this.w * 0.045;
        this.x[i] = x;
        this.y[i] = y;
        this.z[i] = z;
        this.px[i] = x - (Math.random() - 0.5) * 0.2;
        this.py[i] = y;
        this.pz[i] = z;
        this.u[i] = u;
        this.v[i] = v;
        const mx = Math.min(maskW - 1, Math.round(u * (maskW - 1)));
        const my = Math.min(maskH - 1, Math.round(v * (maskH - 1)));
        // only opaque fabric collides / can be picked; clear corners just ride along
        this.solid[i] = alpha[(my * maskW + mx) * 4 + 3] > 50 ? 1 : 0;
      }
    }

    // constraints + triangles
    const la: number[] = [];
    const lb: number[] = [];
    const lk: number[] = [];
    const tris: number[] = [];
    const at = (c: number, r: number) => r * C + c;
    const link = (a: number, b: number, k: number) => {
      la.push(a);
      lb.push(b);
      lk.push(k);
    };
    for (let r = 0; r < R; r++) {
      for (let c = 0; c < C; c++) {
        const a = at(c, r);
        if (c < this.cols) link(a, at(c + 1, r), K_STRUCT);
        if (r < this.rows) link(a, at(c, r + 1), K_STRUCT);
        if (c < this.cols && r < this.rows) {
          link(a, at(c + 1, r + 1), K_SHEAR);
          link(at(c + 1, r), at(c, r + 1), K_SHEAR);
          tris.push(a, at(c + 1, r), at(c, r + 1), at(c + 1, r), at(c + 1, r + 1), at(c, r + 1));
        }
        if (c < this.cols - 1) link(a, at(c + 2, r), K_BEND);
        if (r < this.rows - 1) link(a, at(c, r + 2), K_BEND);
      }
    }
    this.la = Int32Array.from(la);
    this.lb = Int32Array.from(lb);
    this.lk = Float32Array.from(lk);
    this.rest = new Float32Array(la.length);
    // rest lengths come from the flat artwork (not the rippled spawn shape), so a
    // piece can lie flat without buckling and the print never stretches
    for (let j = 0; j < la.length; j++) {
      const a = la[j];
      const b = lb[j];
      this.rest[j] = Math.hypot((this.u[b] - this.u[a]) * this.w, (this.v[b] - this.v[a]) * this.h);
    }
    this.triangles = Uint32Array.from(tris);
  }

  /* --------------------------------------------------------------- utils */

  projectedY(i: number) {
    return Math.min(this.floor, this.y[i] + this.z[i] * OBLIQUE);
  }

  bounds(): Bounds {
    let left = Infinity;
    let right = -Infinity;
    let top = Infinity;
    let bottom = -Infinity;
    for (let i = 0; i < this.n; i++) {
      if (!this.solid[i]) continue;
      const y = this.projectedY(i);
      if (this.x[i] < left) left = this.x[i];
      if (this.x[i] > right) right = this.x[i];
      if (y < top) top = y;
      if (y > bottom) bottom = y;
    }
    return { left, right, top, bottom };
  }

  shift(dy: number) {
    for (let i = 0; i < this.n; i++) {
      this.y[i] += dy;
      this.py[i] += dy;
    }
  }

  wake() {
    this.sleeping = false;
    this.calm = 0;
    this.landedFrames = 0;
  }

  /* ----------------------------------------------------------- dynamics */

  integrate(time: number, reduced: boolean) {
    if (this.sleeping) return;
    const { x, y, z, px, py, pz, u, v, contact } = this;
    const calmAir = reduced || this.landedFrames > 0;
    // drag ramps up the longer a piece has been down, so it eases to rest instead of popping still
    const drag = this.landedFrames ? AIR_DRAG - (AIR_DRAG - REST_DRAG) * Math.min(1, this.landedFrames / 90) : AIR_DRAG;
    for (let i = 0; i < this.n; i++) {
      let vx = (x[i] - px[i]) * drag;
      let vy = (y[i] - py[i]) * drag;
      let vz = (z[i] - pz[i]) * drag;
      const speed = Math.sqrt(vx * vx + vy * vy + vz * vz);
      if (speed > MAX_SPEED) {
        const s = MAX_SPEED / speed;
        vx *= s;
        vy *= s;
        vz *= s;
      }
      px[i] = x[i];
      py[i] = y[i];
      pz[i] = z[i];
      // a light breeze while airborne makes each piece drift and flutter
      const airborne = !calmAir && !contact[i];
      x[i] += vx + (airborne ? Math.sin(time * 0.9 + this.index * 1.7 + v[i] * 2) * 0.016 : 0);
      y[i] += vy + GRAVITY;
      z[i] += vz + (airborne ? Math.sin(time * 1.6 + u[i] * 3 + v[i] * 1.5 + this.index) * 0.026 : 0);
      contact[i] = 0;
    }
    this.version++;
  }

  createGrip(node: number): Grip {
    const pins: Grip["pins"] = new Map();
    const r = Math.max(10, this.w * 0.055);
    const cu = this.u[node];
    const cv = this.v[node];
    const ox = this.x[node];
    const oy = this.projectedY(node);
    const oz = this.z[node];
    const limits = new Float32Array(this.n);
    for (let i = 0; i < this.n; i++) {
      const d = Math.hypot((this.u[i] - cu) * this.w, (this.v[i] - cv) * this.h);
      limits[i] = d * 1.12;
      if ((this.solid[i] || i === node) && d <= r) {
        pins.set(i, { x: this.x[i] - ox, y: this.projectedY(i) - oy, z: this.z[i] - oz });
      }
    }
    return { pins, limits };
  }

  private pinGrip(grab: Grab) {
    for (const [i, o] of grab.grip.pins) {
      this.x[i] = grab.x + o.x;
      this.z[i] = o.z;
      this.y[i] = grab.y + o.y - o.z * OBLIQUE;
    }
  }

  solve(surface: number, viewW: number, grab: Grab | null, pass = 0, bag: Bag | null = null) {
    if (this.sleeping) return;
    const { x, y, z, px, py, pz, la, lb, lk, rest } = this;
    const held = grab?.fabric === this ? grab : null;
    const pins = held ? held.grip.pins : null;
    if (held) this.pinGrip(held);

    // sweep the links forward then backward on alternate passes so the solver
    // has no directional bias (one-way sweeps make cloth drift and skew)
    const count = la.length;
    const reverse = pass & 1;
    for (let k = 0; k < count; k++) {
      const j = reverse ? count - 1 - k : k;
      const a = la[j];
      const b = lb[j];
      const dx = x[b] - x[a];
      const dy = y[b] - y[a];
      const dz = z[b] - z[a];
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.001;
      const wa = pins && pins.has(a) ? 0 : 1;
      const wb = pins && pins.has(b) ? 0 : 1;
      const f = (((d - rest[j]) / d) * lk[j]) / (wa + wb || 1);
      x[a] += dx * f * wa;
      y[a] += dy * f * wa;
      z[a] += dz * f * wa;
      x[b] -= dx * f * wb;
      y[b] -= dy * f * wb;
      z[b] -= dz * f * wb;
    }

    // stop the hand from stretching the garment; folding is still free
    if (held && pins) {
      const { limits } = held.grip;
      for (let i = 0; i < this.n; i++) {
        if (pins.has(i)) continue;
        const dx = x[i] - held.x;
        const dy = y[i] - held.y;
        const dz = z[i];
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d > limits[i]) {
          const f = limits[i] / d;
          x[i] = held.x + dx * f;
          y[i] = held.y + dy * f;
          z[i] = dz * f;
        }
      }
    }

    this.floor = surface - 1.5;
    const floor = this.floor;
    const zMax = this.w * 0.8;
    // the piece in hand is held in front of the bag, everything else bumps into it
    const box = held ? null : bag;
    // The whole piece leaves the rim one way (towards the nearer side), so it never splits over the middle
    if (box && !this.bagged) {
      let sum = 0;
      for (let i = 0; i < this.n; i++) sum += x[i];
      this.rimSide = sum / this.n < (box.left + box.right) / 2 ? -1 : 1;
    }
    if (!this.entered) {
      let inside = true;
      for (let i = 0; i < this.n; i++) {
        if (y[i] + z[i] * OBLIQUE < 2) {
          inside = false;
          break;
        }
      }
      this.entered = inside;
    }
    for (let i = 0; i < this.n; i++) {
      if (x[i] < 2) {
        x[i] = 2;
        px[i] = x[i];
      } else if (x[i] > viewW - 2) {
        x[i] = viewW - 2;
        px[i] = x[i];
      }
      if (z[i] < -zMax) z[i] = -zMax;
      else if (z[i] > zMax) z[i] = zMax;
      if (this.entered && y[i] + z[i] * OBLIQUE < 2) {
        y[i] = 2 - z[i] * OBLIQUE;
        py[i] = y[i];
      }
      // nothing is drawn in front of the floor line: a fold leaning toward the viewer is pushed back
      // in depth, so it piles up behind the line instead of being flattened onto it (which read as
      // the piece being cut off along the floor)
      const front = (floor - Math.min(y[i], floor)) / OBLIQUE;
      if (z[i] > front) {
        z[i] = front;
        pz[i] = z[i];
      }
      if (y[i] > floor) {
        y[i] = floor;
        py[i] = floor;
        // floor friction: slow slides stick, faster ones drag
        const sx = x[i] - px[i];
        const sz = z[i] - pz[i];
        if (Math.abs(sx) + Math.abs(sz) < STATIC_FRICTION) {
          px[i] = x[i];
          pz[i] = z[i];
        } else {
          px[i] = x[i] - sx * KINETIC_FRICTION;
          pz[i] = z[i] - sz * KINETIC_FRICTION;
        }
        this.contact[i] = 1;
      }
      if (box) this.collideBag(i, box);
    }
    if (held) this.pinGrip(held);
  }

  /** Below the mouth the bag body is solid from outside, and its walls hold a piece that was dropped in. */
  private collideBag(i: number, bag: Bag) {
    const { x, y, z, px, py } = this;
    const vy = Math.min(this.floor, y[i] + z[i] * OBLIQUE);
    if (vy <= bag.top) return;
    if (this.bagged) {
      if (x[i] < bag.innerLeft) {
        x[i] = bag.innerLeft;
        px[i] = x[i];
      } else if (x[i] > bag.innerRight) {
        x[i] = bag.innerRight;
        px[i] = x[i];
      }
      return;
    }
    if (x[i] <= bag.left || x[i] >= bag.right) return;
    // out the shortest way: up onto the rim (then slid off it, so nothing rests in the mouth), or off a side
    const l = x[i] - bag.left;
    const r = bag.right - x[i];
    const t = vy - bag.top;
    if (t < l && t < r) {
      y[i] -= Math.min(t, BAG_PUSH);
      py[i] = y[i];
      px[i] = x[i] - this.rimSide * RIM_SLIDE;
      this.contact[i] = 1;
    } else if (this.rimSide < 0) {
      // off a side — the same side for the whole piece; per-point "nearest side" would pull a piece that
      // straddles the middle both ways at once, and its links would hold it hanging in the mouth
      x[i] -= Math.min(l, BAG_PUSH);
      px[i] = x[i] + BAG_SHOVE;
    } else {
      x[i] += Math.min(r, BAG_PUSH);
      px[i] = x[i] - BAG_SHOVE;
    }
  }

  settle(grab: Grab | null) {
    if (this.sleeping || grab?.fabric === this) return;
    let motion = 0;
    let touching = 0;
    for (let i = 0; i < this.n; i++) {
      motion +=
        Math.abs(this.x[i] - this.px[i]) + Math.abs(this.y[i] - this.py[i]) + Math.abs(this.z[i] - this.pz[i]);
      if (this.contact[i] && this.solid[i]) touching++;
    }
    if (touching) this.landedFrames++;
    if (this.landedFrames && motion / this.n < 0.06) this.calm++;
    else this.calm = 0;
    // garments on the floor freeze once settled; picking one up wakes it
    if (this.calm > 20 || this.landedFrames > 240) {
      this.sleeping = true;
      this.px.set(this.x);
      this.py.set(this.y);
      this.pz.set(this.z);
    }
  }

  /** Softens the throw so a flick never launches the garment off screen. */
  limitRelease() {
    for (let i = 0; i < this.n; i++) {
      const vx = (this.x[i] - this.px[i]) * 0.5;
      const vy = (this.y[i] - this.py[i]) * 0.5;
      const vz = (this.z[i] - this.pz[i]) * 0.5;
      const speed = Math.sqrt(vx * vx + vy * vy + vz * vz);
      const f = speed > 3 ? 3 / speed : 1;
      this.px[i] = this.x[i] - vx * f;
      this.py[i] = this.y[i] - vy * f;
      this.pz[i] = this.z[i] - vz * f;
    }
  }

  /** Lets go straight down with a small push (into the bag) — no sideways drift from the carry. */
  drop(push: number) {
    for (let i = 0; i < this.n; i++) {
      this.px[i] = this.x[i];
      this.py[i] = this.y[i] - push;
      this.pz[i] = this.z[i];
    }
    this.wake();
  }

  /** Rescales the garment around its centre after a viewport resize. */
  rescale(sx: number, sy: number, scale: number) {
    let cx = 0;
    let cy = 0;
    for (let i = 0; i < this.n; i++) {
      cx += this.x[i];
      cy += this.y[i];
    }
    cx /= this.n;
    cy /= this.n;
    for (let i = 0; i < this.n; i++) {
      this.x[i] = cx * sx + (this.x[i] - cx) * scale;
      this.y[i] = cy * sy + (this.y[i] - cy) * scale;
      this.z[i] *= scale;
      this.px[i] = this.x[i];
      this.py[i] = this.y[i];
      this.pz[i] = this.z[i];
    }
    this.w *= scale;
    this.h *= scale;
    for (let j = 0; j < this.rest.length; j++) this.rest[j] *= scale;
    this.wake();
    this.version++;
  }

  /* -------------------------------------------------------------- picking */

  /** Returns the grabbed node under (qx, qy) if it lands on opaque fabric, else -1. */
  hit(qx: number, qy: number) {
    const { triangles: t, x, u, v } = this;
    const { alpha, maskW, maskH } = this.asset;
    for (let k = t.length - 3; k >= 0; k -= 3) {
      const i0 = t[k];
      const i1 = t[k + 1];
      const i2 = t[k + 2];
      const x0 = x[i0];
      const x1 = x[i1];
      const x2 = x[i2];
      const y0 = this.projectedY(i0);
      const y1 = this.projectedY(i1);
      const y2 = this.projectedY(i2);
      const den = (y1 - y2) * (x0 - x2) + (x2 - x1) * (y0 - y2);
      if (Math.abs(den) < 0.05) continue;
      const a = ((y1 - y2) * (qx - x2) + (x2 - x1) * (qy - y2)) / den;
      const b = ((y2 - y0) * (qx - x2) + (x0 - x2) * (qy - y2)) / den;
      const c = 1 - a - b;
      if (a < 0 || b < 0 || c < 0) continue;
      const tu = u[i0] * a + u[i1] * b + u[i2] * c;
      const tv = v[i0] * a + v[i1] * b + v[i2] * c;
      const ix = Math.min(maskW - 1, Math.max(0, Math.floor(tu * maskW)));
      const iy = Math.min(maskH - 1, Math.max(0, Math.floor(tv * maskH)));
      if (alpha[(iy * maskW + ix) * 4 + 3] < 70) continue;
      return a >= b && a >= c ? i0 : b >= c ? i1 : i2;
    }
    return -1;
  }

  /* ------------------------------------------------------------- drawing */

  /** Writes (screenX, screenY, depth) per node for the GPU. */
  writeVertices(out: Float32Array) {
    const s = 1 / (this.w * 4);
    for (let i = 0, k = 0; i < this.n; i++, k += 3) {
      out[k] = this.x[i];
      out[k + 1] = this.projectedY(i);
      out[k + 2] = -this.z[i] * s;
    }
  }
}
