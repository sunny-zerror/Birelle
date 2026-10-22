// Compresses the raw lookbook photography for the look pages.
// Originals in public/images/lookbook/product_images stay untouched;
// 2400px webp copies go to public/images/lookbook/photos, and their sizes
// (used to pick landscape / portrait layouts) to src/data/lookbook-photos.json.
//
//   node scripts/make-lookbook-photos.mjs

import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "public/images/lookbook/product_images");
const out = path.join(root, "public/images/lookbook/photos");
const manifest = path.join(root, "src/data/lookbook-photos.json");

await mkdir(out, { recursive: true });
const files = (await readdir(src)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
const photos = [];

for (const file of files) {
  const name = file.replace(/\.\w+$/, ".webp");
  const info = await sharp(path.join(src, file))
    .rotate() // respect camera orientation
    .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 78, effort: 5 })
    .toFile(path.join(out, name));
  photos.push({ src: `/images/lookbook/photos/${name}`, width: info.width, height: info.height });
  console.log(`${file} -> photos/${name} ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)}kB`);
}

await writeFile(manifest, JSON.stringify(photos, null, 2) + "\n");
console.log(`wrote ${path.relative(root, manifest)}`);
