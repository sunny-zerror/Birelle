import type { Texture } from "three";

/** A decoded garment image: GPU texture + a small alpha mask used for collision and picking. */
export interface GarmentAsset {
  texture: Texture;
  /** height / width of the artwork */
  aspect: number;
  /** RGBA bytes of the downscaled mask */
  alpha: Uint8ClampedArray;
  maskW: number;
  maskH: number;
}

/** The shopping bag standing in the middle of the stage, in canvas px. */
export interface Bag {
  /** body (front face + side gusset) — solid for every piece outside it */
  left: number;
  right: number;
  /** the mouth: top edge of the front face */
  top: number;
  /** walls a piece falls between once it's dropped in */
  innerLeft: number;
  innerRight: number;
  /** front face width — garments are sized to fit through the mouth */
  width: number;
}

export interface Bounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface GripPin {
  x: number;
  y: number;
  z: number;
}

export interface Grip {
  /** node index → offset from the hand */
  pins: Map<number, GripPin>;
  /** max distance per node from the hand, so holding never stretches the artwork */
  limits: Float32Array;
}

export interface Grab {
  fabric: import("./Fabric").default;
  node: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  offsetX: number;
  offsetY: number;
  grip: Grip;
}
