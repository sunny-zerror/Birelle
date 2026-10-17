import type { Product } from "@/types";

const IMG = "/images/homepage/curated";

// Shared model shot until each product has its own featured image
const FEATURED = `${IMG}/featured_img.svg`;

export const SIZES = ["XS", "S", "M", "L", "XL"];

// Dummy catalogue — swap for real data / CMS later
export const products: Product[] = [
  {
    id: "signature-tee",
    title: "Signature Tee",
    category: "tees",
    price: 185,
    href: "/shop/signature-tee",
    image: `${IMG}/cutout/product_1.webp`,
    featured: FEATURED,
    colour: "Black",
    colours: ["Black", "White", "Sand"],
    isNew: true,
    pairsWith: "painters-trouser",
    description:
      "Relaxed boxy tee in heavyweight cotton jersey, finished with a small embroidered Birelle crest at the chest and dropped shoulders.",
  },
  {
    id: "painters-trouser",
    title: "The Painter's Trouser",
    category: "bottoms",
    price: 245,
    href: "/shop/painters-trouser",
    image: `${IMG}/cutout/product_2.webp`,
    featured: FEATURED,
    colour: "Multicolour",
    isNew: true,
    pairsWith: "signature-tee",
    description:
      "Wide-leg trouser printed edge to edge with a painterly heraldic scene, framed by contrast side stripes and an elasticated drawcord waist.",
  },
  {
    id: "script-jogger",
    title: "Script Jogger",
    category: "bottoms",
    price: 210,
    href: "/shop/script-jogger",
    image: `${IMG}/cutout/product_3.webp`,
    featured: FEATURED,
    colour: "Black",
    colours: ["Black", "Navy"],
    pairsWith: "script-trim-tee",
    description:
      "Tapered jogger in brushed-back fleece with hand-drawn script panels along each leg, ribbed cuffs and contrast piped pockets.",
  },
  {
    id: "panel-trouser",
    title: "Panel Trouser",
    category: "bottoms",
    price: 225,
    href: "/shop/panel-trouser",
    image: `${IMG}/cutout/product_4.webp`,
    featured: FEATURED,
    colour: "White",
    colours: ["White", "Sand"],
    pairsWith: "painted-sleeve-tee",
    description:
      "Fluid straight-leg trouser in off-white twill, cut with painted side panels that move with every step.",
  },
  {
    id: "painted-sleeve-tee",
    title: "Painted Sleeve Tee",
    category: "tees",
    price: 165,
    href: "/shop/painted-sleeve-tee",
    image: `${IMG}/cutout/product_5.webp`,
    featured: FEATURED,
    colour: "Black",
    colours: ["Black", "White"],
    isNew: true,
    pairsWith: "panel-trouser",
    description:
      "Raglan tee in black jersey with sun-washed painted sleeves in sky blues and warm ochres, finished with fine ribbed trims.",
  },
  {
    id: "script-trim-tee",
    title: "Script Trim Tee",
    category: "tees",
    price: 155,
    href: "/shop/script-trim-tee",
    image: `${IMG}/cutout/product_6.webp`,
    featured: FEATURED,
    colour: "White",
    colours: ["White", "Black", "Navy"],
    pairsWith: "script-jogger",
    description:
      "Clean white tee with hand-drawn script trims at the collar and cuffs, cut in a relaxed fit from soft combed cotton.",
  },
  {
    id: "tide-short",
    title: "Tide Short",
    category: "shorts",
    price: 175,
    href: "/shop/tide-short",
    image: `${IMG}/cutout/product_7.webp`,
    featured: FEATURED,
    colour: "Multicolour",
    pairsWith: "signature-tee",
    description:
      "Knee-length short printed with a tidal abstract in deep blues and amber, with a black side panel and elasticated waist.",
  },
];

export const categories = [
  { key: "all", label: "View All" },
  { key: "tees", label: "Tees" },
  { key: "bottoms", label: "Bottoms" },
  { key: "shorts", label: "Shorts" },
] as const;

export const formatPrice = (price: number) => `$${price.toFixed(2)} USD`;

export const getProduct = (id: string) => products.find((p) => p.id === id);

export const getRelated = (id: string, count = 6) => products.filter((p) => p.id !== id).slice(0, count);

// Swatch fill for each colour name (CSS background value)
export const COLOUR_SWATCHES: Record<string, string> = {
  Black: "#111111",
  White: "#f4f2ec",
  Sand: "#d8c7a5",
  Navy: "#1f2a44",
  Multicolour: "conic-gradient(#e0a458, #5b8fb9, #8bb174, #c8553d, #e0a458)",
};

export const getColours = (product: Product) => product.colours ?? [product.colour];
