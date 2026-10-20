import type { Look } from "@/types";

const IMG = "/images/lookbook";

const CATEGORIES = ["Tees", "Shirts", "Knitwear", "Outerwear", "Essentials"];

// Giant title the garments land on (one entry per line)
export const LOOKBOOK_TITLE = ["Birelle", "Lookbook"];

export const LOOKBOOK_SEASON = "Collection 2026";

// Dummy looks — swap for real data / CMS later.
// `rain` is the light trimmed texture used while falling (regenerate with
// `node scripts/make-rain-images.mjs`), `src` the full-size artwork.
export const looks: Look[] = Array.from({ length: 15 }, (_, i) => {
  const n = i + 1;
  return {
    id: n,
    src: `${IMG}/full/${n}.webp`,
    rain: `${IMG}/rain/${n}.webp`,
    title: `Look ${String(n).padStart(2, "0")}`,
    category: CATEGORIES[i % CATEGORIES.length],
    season: "SS26",
    story: [
      "A considered piece from the Birelle lookbook — cut, colour and fabric developed together for an easy, everyday silhouette.",
    ],
  };
});
