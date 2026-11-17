/*
 * Playground — owns every falling garment, the hand that holds one, the bag
 * they get dropped into and the fixed 60 Hz simulation clock. Plain TS (no
 * React) so the render loop never triggers re-renders.
 */
import Fabric from "./Fabric";
import type { Bag, GarmentAsset, Grab } from "./types";

const STEP_MS = 1000 / 60;
const RAIN_MS = 2000; // all garments arrive within this window
const SOLVER_ITERATIONS = 8;
const HAND_FOLLOW = 0.45; // how quickly the held patch catches up with the pointer (per step)
const BAG_LIFT_FRAMES = 45; // longest the hand spends carrying a piece over the bag's mouth
const BAG_FALL_FRAMES = 50; // …and the longest the piece takes to land inside
const BAG_DROP_PUSH = 5; // px per frame — a piece is dropped in, not floated in

type Bagging = {
  fabric: Fabric;
  /** lift: carried over the mouth · fall: dropping inside · in: landed */
  phase: "lift" | "fall" | "in";
  frames: number;
  onDrop?: () => void;
  onLand?: () => void;
};

export default class Playground {
  readonly reduced: boolean;
  fabrics: Fabric[] = [];
  grab: Grab | null = null;
  W = 0;
  H = 0;
  /** y of the floor the garments (and the bag) stand on */
  surface = 0;
  /** the shopping bag pieces get dropped into */
  bag: Bag | null = null;
  paused = false;

  private time = 0;
  private acc = 0;
  private timers: ReturnType<typeof setTimeout>[] = [];
  private generation = 0;
  private bagging: Bagging | null = null;

  constructor({ reduced = false }: { reduced?: boolean } = {}) {
    this.reduced = reduced;
  }

  garmentWidth() {
    // sized to the bag's mouth, so any piece fits through it
    if (this.bag) return this.bag.width * 0.84;
    return Math.min(this.W < 650 ? 154 : 224, this.W * 0.4);
  }

  resize(W: number, H: number, surface: number, bag: Bag | null = null) {
    const first = !this.W;
    const oldW = this.W;
    const oldH = this.H;
    const oldSize = this.garmentWidth();
    this.W = W;
    this.H = H;
    this.surface = surface;
    this.bag = bag;
    if (first || (oldW === W && oldH === H)) return;
    this.release();
    const scale = this.garmentWidth() / oldSize;
    for (const f of this.fabrics) f.rescale(W / oldW, H / oldH, scale);
  }

  private add(index: number, asset: GarmentAsset, side: number) {
    const width = this.garmentWidth() * (0.9 + Math.random() * 0.2);
    const fabric = new Fabric({
      index,
      width,
      asset,
      viewW: this.W,
      viewH: this.H,
      centerX: this.spawnX(width, side),
      initial: this.reduced,
    });
    // start just above the top edge
    if (!this.reduced) fabric.shift(-2 - fabric.bounds().bottom);
    this.fabrics.push(fabric);
  }

  /** Where a piece falls: beside the bag, never onto it — sides alternate so both piles grow evenly. */
  private spawnX(width: number, side: number) {
    const { W, bag } = this;
    const edge = width * 0.55;
    if (!bag) return edge + Math.random() * Math.max(0, W - edge * 2);
    const spans = [
      [edge, bag.left - width * 0.3],
      [bag.right + width * 0.3, W - edge],
    ].filter(([a, b]) => b > a);
    if (!spans.length) return side ? W - edge : edge;
    const [a, b] = spans[side % spans.length];
    return a + Math.random() * (b - a);
  }

  /**
   * Drops every garment in `order`, spread over two seconds. `ready(i)`
   * resolves with that garment's asset once its image has decoded.
   */
  rain(order: number[], ready: (index: number) => Promise<GarmentAsset>) {
    this.timers.forEach(clearTimeout);
    this.timers = [];
    const generation = ++this.generation;
    this.grab = null;
    this.bagging = null;
    this.fabrics = [];
    let pending: Promise<void> = Promise.resolve();
    order.forEach((index, n) => {
      const delay = this.reduced ? 0 : n * (RAIN_MS / Math.max(1, order.length - 1));
      this.timers.push(
        setTimeout(() => {
          pending = pending
            .then(() => ready(index))
            .then((asset) => {
              if (generation === this.generation) this.add(index, asset, n % 2);
            })
            .catch(() => {});
        }, delay),
      );
    });
  }

  dispose() {
    this.timers.forEach(clearTimeout);
    this.timers = [];
  }

  get active() {
    return !!this.grab || this.fabrics.some((f) => !f.sleeping);
  }

  /** Advances the fixed-step simulation. */
  update(deltaMs: number) {
    if (this.paused || !this.W || !this.active) {
      this.acc = 0;
      return;
    }
    this.acc = Math.min(this.acc + Math.min(deltaMs, 50), 50);
    let steps = 0;
    while (this.acc >= STEP_MS && steps < 3) {
      this.step();
      this.acc -= STEP_MS;
      steps++;
    }
  }

  private step() {
    this.time += 1 / 60;
    this.carryIntoBag();
    const { grab, fabrics, bag } = this;
    if (grab) {
      // ease the hand toward the pointer so fast flicks don't yank the cloth
      grab.x += (grab.targetX - grab.x) * HAND_FOLLOW;
      grab.y += (grab.targetY - grab.y) * HAND_FOLLOW;
    }
    for (const f of fabrics) f.integrate(this.time, this.reduced);
    for (let i = 0; i < SOLVER_ITERATIONS; i++) for (const f of fabrics) f.solve(this.surface, this.W, grab, i, bag);
    for (const f of fabrics) f.settle(grab);
  }

  /* --------------------------------------------------------------- bag */

  /**
   * Carries the held piece over the bag's mouth, then lets it fall in.
   * `onDrop` fires as it's let go, `onLand` once it reaches the bottom.
   * Returns false when nothing is held.
   */
  dropIntoBag({ onDrop, onLand }: { onDrop?: () => void; onLand?: () => void } = {}) {
    const { grab, bag } = this;
    if (!grab || !bag) return false;
    const b = grab.fabric.bounds();
    // centred over the mouth, high enough that the whole piece hangs above it
    const mouthX = (bag.innerLeft + bag.innerRight) / 2;
    grab.targetX = Math.max(2, Math.min(this.W - 2, mouthX + grab.x - (b.left + b.right) / 2));
    grab.targetY = Math.max(2, bag.top - (b.bottom - grab.y) - 10);
    grab.fabric.wake();
    this.bagging = { fabric: grab.fabric, phase: "lift", frames: 0, onDrop, onLand };
    return true;
  }

  private carryIntoBag() {
    const job = this.bagging;
    const { bag } = this;
    if (!job || !bag || job.phase === "in") return;
    job.frames++;
    if (job.phase === "lift") {
      const g = this.grab;
      const there = !!g && Math.abs(g.targetX - g.x) < 3 && Math.abs(g.targetY - g.y) < 3;
      if ((there && job.fabric.bounds().bottom < bag.top) || job.frames > BAG_LIFT_FRAMES) {
        job.phase = "fall";
        job.frames = 0;
        this.grab = null;
        job.fabric.bagged = true;
        job.fabric.drop(BAG_DROP_PUSH);
        job.onDrop?.();
      }
    } else if (job.fabric.landedFrames > 0 || job.frames > BAG_FALL_FRAMES) {
      job.phase = "in";
      job.onLand?.();
    }
  }

  /* ----------------------------------------------------------- pointer */

  hitTest(x: number, y: number) {
    for (let i = this.fabrics.length - 1; i >= 0; i--) {
      const f = this.fabrics[i];
      if (f.bagged) continue;
      const b = f.bounds();
      if (x < b.left || x > b.right || y < b.top || y > b.bottom) continue;
      const node = f.hit(x, y);
      if (node >= 0) return { fabric: f, node };
    }
    return null;
  }

  /** Picks up the garment under (x, y). Returns it, or null. */
  pick(x: number, y: number) {
    const h = this.hitTest(x, y);
    if (!h) return null;
    const { fabric, node } = h;
    fabric.wake();
    const nx = fabric.x[node];
    const ny = fabric.projectedY(node);
    this.grab = {
      fabric,
      node,
      x: nx,
      y: ny,
      targetX: nx,
      targetY: ny,
      offsetX: x - nx,
      offsetY: y - ny,
      grip: fabric.createGrip(node),
    };
    // the held garment is drawn on top of everything
    this.fabrics = this.fabrics.filter((f) => f !== fabric);
    this.fabrics.push(fabric);
    return fabric;
  }

  moveTo(x: number, y: number) {
    const g = this.grab;
    if (!g) return;
    g.targetX = Math.max(2, Math.min(this.W - 2, x - g.offsetX));
    g.targetY = Math.max(2, Math.min(this.surface - 2, y - g.offsetY));
    g.fabric.wake();
  }

  release() {
    if (this.grab) this.grab.fabric.limitRelease();
    this.grab = null;
  }
}
