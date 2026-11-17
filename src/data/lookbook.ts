import type { Look, LookPhoto } from "@/types";
import PHOTOS from "./lookbook-photos.json";

const IMG = "/images/lookbook";

const CATEGORIES = ["Tees", "Shirts", "Knitwear", "Outerwear", "Essentials"];

// Giant title set behind the shopping bag (one entry per line)
export const LOOKBOOK_TITLE = ["The Art of", "Everyday", "Expression"];

export const LOOKBOOK_SEASON = "Collection 2026";

// Compressed photography (regenerate with `node scripts/make-lookbook-photos.mjs`)
const landscapes = PHOTOS.filter((p) => p.width > p.height);
const portraits = PHOTOS.filter((p) => p.width <= p.height);

// Dummy gallery per look: alternate one landscape with a pair of portraits,
// starting at a different photo for each look so every page reads differently
const galleryFor = (i: number): LookPhoto[] => {
  const L = landscapes.map((_, k) => landscapes[(k + i) % landscapes.length]);
  const P = portraits.map((_, k) => portraits[(k + i * 2) % portraits.length]);
  const out: LookPhoto[] = [];
  while (L.length || P.length) {
    if (L.length) out.push(L.shift()!);
    out.push(...P.splice(0, 2));
  }
  return out;
};

// Dummy looks — swap for real data / CMS later.
// `rain` is the light trimmed texture used while falling (regenerate with
// `node scripts/make-rain-images.mjs`), `src` the full-size artwork.
export const looks: Look[] = Array.from({ length: 15 }, (_, i) => {
  const n = i + 1;
  return {
    id: n,
    slug: `look-${String(n).padStart(2, "0")}`,
    src: `${IMG}/full/${n}.webp`,
    rain: `${IMG}/rain/${n}.webp`,
    title: `Look ${String(n).padStart(2, "0")}`,
    category: CATEGORIES[i % CATEGORIES.length],
    season: "SS26",
    story: [
      "A considered piece from the Birelle lookbook — cut, colour and fabric developed together for an easy, everyday silhouette.",
    ],
    photos: galleryFor(i),
  };
});

export const getLook = (slug: string) => looks.find((look) => look.slug === slug);
