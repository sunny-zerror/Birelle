"use client";

import { createContext, useContext, useMemo } from "react";
import type { Look, Product } from "@/types";

export type CatalogCategory = { key: string; label: string };

type CatalogContextValue = {
  products: Product[];
  /** Category pills for the shop: "View All" first */
  categories: CatalogCategory[];
  looks: Look[];
  getProduct: (id: string) => Product | undefined;
  /** By Zcom product id (cart, wishlist and order lines) */
  getByZcomId: (zcomId: string) => Product | undefined;
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

// Loaded once on the server (root layout) and shared with every client component
export const CatalogProvider = ({
  products,
  categories,
  looks,
  children,
}: {
  products: Product[];
  categories: CatalogCategory[];
  looks: Look[];
  children: React.ReactNode;
}) => {
  const value = useMemo<CatalogContextValue>(() => {
    const bySlug = new Map(products.map((p) => [p.id, p]));
    const byZcom = new Map(products.flatMap((p) => (p.zcom ? [[p.zcom.productId, p] as const] : [])));
    return {
      products,
      categories: [{ key: "all", label: "View All" }, ...categories],
      looks,
      getProduct: (id) => bySlug.get(id),
      getByZcomId: (id) => byZcom.get(id),
    };
  }, [products, categories, looks]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
};

export const useCatalog = () => {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used inside <CatalogProvider>");
  return ctx;
};
