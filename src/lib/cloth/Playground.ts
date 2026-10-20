/*
 * Playground — owns every falling garment, the hand that holds one, and the
 * fixed 60 Hz simulation clock. Plain TS (no React) so the render loop never
 * triggers re-renders.
 */
import Fabric from "./Fabric";
import type { GarmentAsset, Grab } from "./types";

const STEP_MS = 1000 / 60;
const RAIN_MS = 2000; // all garments arrive within this window
const SOLVER_ITERATIONS = 5;

export default class Playground {
  readonly reduced: boolean;
  fabrics: Fabric[] = [];
  grab: Grab | null = null;
  W = 0;
  H = 0;
  /** y of the floor the garments land on (the title's baseline) */
  surface = 0;
  paused = false;

  private time = 0;
  private acc = 0;
  private timers: ReturnType<typeof setTimeout>[] = [];
  private generation = 0;

  constructor({ reduced = false }: { reduced?: boolean } = {}) {
    this.reduced = reduced;
  }

  garmentWidth(W = this.W) {
    return Math.min(W < 650 ? 154 : 224, W * 0.4);
  }

  resize(W: number, H: number, surface: number) {
    const first = !this.W;
    const oldW = this.W;
    const oldH = this.H;
    this.W = W;
    this.H = H;
    this.surface = surface;
    if (first || (oldW === W && oldH === H)) return;
    this.release();
    const scale = this.garmentWidth(W) / this.garmentWidth(oldW);
    for (const f of this.fabrics) f.rescale(W / oldW, H / oldH, scale);
  }

  private add(index: number, asset: GarmentAsset) {
    const width = this.garmentWidth() * (0.9 + Math.random() * 0.2);
    const fabric = new Fabric({ index, width, asset, viewW: this.W, viewH: this.H, initial: this.reduced });
    // start just above the top edge
    if (!this.reduced) fabric.shift(-2 - fabric.bounds().bottom);
    this.fabrics.push(fabric);
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
    this.fabrics = [];
    let pending: Promise<void> = Promise.resolve();
    order.forEach((index, n) => {
      const delay = this.reduced ? 0 : n * (RAIN_MS / Math.max(1, order.length - 1));
      this.timers.push(
        setTimeout(() => {
          pending = pending
            .then(() => ready(index))
            .then((asset) => {
              if (generation === this.generation) this.add(index, asset);
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
    const { grab, fabrics } = this;
    if (grab) {
      grab.x = grab.targetX;
      grab.y = grab.targetY;
    }
    for (const f of fabrics) f.integrate(this.time, this.reduced);
    for (let i = 0; i < SOLVER_ITERATIONS; i++) for (const f of fabrics) f.solve(this.surface, this.W, grab);
    for (const f of fabrics) f.settle(grab);
  }

  /* ----------------------------------------------------------- pointer */

  hitTest(x: number, y: number) {
    for (let i = this.fabrics.length - 1; i >= 0; i--) {
      const f = this.fabrics[i];
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
