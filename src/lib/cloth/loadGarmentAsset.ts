import * as THREE from "three";
import type { GarmentAsset } from "./types";

const MASK_MAX_WIDTH = 256;

/** Decodes a garment image into a GPU texture + an alpha mask for picking. */
export function loadGarmentAsset(src: string): Promise<GarmentAsset> {
  const image = new Image();
  image.decoding = "async";
  // `load` (not decode()) — decode() can stall forever in background tabs
  const loaded = new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = reject;
  });
  image.src = src;

  return loaded.then(() => {
    const maskW = Math.min(MASK_MAX_WIDTH, image.naturalWidth);
    const maskH = Math.max(1, Math.round((maskW * image.naturalHeight) / image.naturalWidth));
    const canvas = document.createElement("canvas");
    canvas.width = maskW;
    canvas.height = maskH;
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    ctx.drawImage(image, 0, 0, maskW, maskH);

    const texture = new THREE.Texture(image);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.premultiplyAlpha = true;
    texture.anisotropy = 8;
    texture.needsUpdate = true;

    return {
      texture,
      aspect: image.naturalHeight / image.naturalWidth,
      alpha: ctx.getImageData(0, 0, maskW, maskH).data,
      maskW,
      maskH,
    };
  });
}
