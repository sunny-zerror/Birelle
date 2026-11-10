import type { Product } from "@/types";
import { siteConfig } from "@/config/site";

// Products now come from the Zcom store — see lib/zcom/catalog.ts (server)
// and useCatalog() in components/providers/CatalogProvider.tsx (client).

// Fallback when a product carries no size option
export const SIZES = ["XS", "S", "M", "L", "XL"];

const priceFormat = new Intl.NumberFormat(siteConfig.language, {
  style: "currency",
  currency: siteConfig.currency,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatPrice = (price: number) => `${priceFormat.format(price)} ${siteConfig.currency}`;

/** Compact form for summaries, e.g. "$185.00" */
export const formatMoney = (price: number) => priceFormat.format(price);

// Swatch fill for each colour name (CSS background value)
export const COLOUR_SWATCHES: Record<string, string> = {
  Black: "#111111",
  White: "#f4f2ec",
  Sand: "#d8c7a5",
  Navy: "#1f2a44",
  Multicolour: "conic-gradient(#e0a458, #5b8fb9, #8bb174, #c8553d, #e0a458)",
};

/** A swatch for any colour name: the design's palette first, then the CSS colour of that name */
export const swatchFor = (colour: string) => COLOUR_SWATCHES[colour] ?? colour.toLowerCase().replace(/\s+/g, "");

export const getColours = (product: Product) =>
  product.colours?.length ? product.colours : product.colour ? [product.colour] : [];

export const getSizes = (product: Product) => (product.sizes?.length ? product.sizes : SIZES);
