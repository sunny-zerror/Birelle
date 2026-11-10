import { cache } from "react";
import { getCategories, getLookbook, getLookbooks, getProduct, getProducts } from "@zcom/storefront-kit/server";
import { looks as builtInLooks } from "@/data/lookbook";
import type { Look, Product } from "@/types";
import { toLook, toProduct } from "./adapters";

// ─── Catalog (server) ─────────────────────────────────────────────────────────

const PAGE_SIZE = 100;
const MAX_PRODUCTS = 500;
/** The newest pieces carry the design's "New In" label */
const NEW_IN_COUNT = 4;

export type CatalogCategory = { key: string; label: string };

export type Catalog = {
  products: Product[];
  categories: CatalogCategory[];
};

/** Every published product and category, cached per request (and 60 s in Next's data cache). */
export const getCatalog = cache(async (): Promise<Catalog> => {
  const { categories } = await getCategories({ limit: 100 });
  const categorySlugs = Object.fromEntries(categories.map((c) => [c._id, c.slug ?? c._id]));

  const products: Product[] = [];
  for (let offset = 0; offset < MAX_PRODUCTS; offset += PAGE_SIZE) {
    const page = await getProducts({ limit: PAGE_SIZE, offset, sort: "NEWEST" });
    for (const p of page.products) {
      products.push(toProduct(p, { isNew: products.length < NEW_IN_COUNT, categorySlugs }));
    }
    if (page.products.length < PAGE_SIZE || offset + PAGE_SIZE >= page.totalCount) break;
  }

  return {
    products,
    categories: categories.map((c) => ({ key: c.slug ?? c._id, label: c.name })),
  };
});

/** One product for its page, with the full description; null when unpublished or unknown. */
export const getCatalogProduct = cache(async (slug: string): Promise<Product | null> => {
  const product = await getProduct(slug);
  if (!product) return null;
  const { products } = await getCatalog();
  const isNew = products.find((p) => p.id === (product.slug ?? product._id))?.isNew;
  return toProduct(product, { isNew });
});

/** "Complete the look": the next piece from another category (no pairing field in Zcom). */
export const pairFor = (product: Product, products: Product[]) =>
  products.find((p) => p.id !== product.id && p.category !== product.category) ??
  products.find((p) => p.id !== product.id);

export const relatedTo = (product: Product, products: Product[], count = 6) => {
  const same = products.filter((p) => p.id !== product.id && p.category === product.category);
  const rest = products.filter((p) => p.id !== product.id && p.category !== product.category);
  return [...same, ...rest].slice(0, count);
};

// ─── Lookbook (server) ────────────────────────────────────────────────────────

/** Lookbooks from Zcom; the designer's built-in looks while the store has none yet. */
export const getLooks = cache(async (): Promise<Look[]> => {
  try {
    const { lookbooks } = await getLookbooks({ limit: 50 });
    if (lookbooks.length > 0) return lookbooks.map(toLook);
  } catch {
    // Lookbooks not available on this backend: keep the built-in looks
  }
  return builtInLooks;
});

/** One look with its photos. `redirectTo` is set when the slug was renamed. */
export const getLookDetail = cache(async (slug: string): Promise<{ look: Look | null; redirectTo: string | null }> => {
  const looks = await getLooks();
  const index = looks.findIndex((l) => l.slug === slug);
  if (looks === builtInLooks) return { look: looks[index] ?? null, redirectTo: null };
  const { lookbook, redirectTo } = await getLookbook(slug);
  if (redirectTo) return { look: null, redirectTo };
  return { look: lookbook ? toLook(lookbook, Math.max(index, 0)) : null, redirectTo: null };
});
