"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useAdsTracking, useAnalytics, useCart as useZcomCart } from "@zcom/storefront-kit/client";
import { getErrorMessage } from "@zcom/storefront-kit/core";
import type { CartLine as ZcomCartLine } from "@zcom/storefront-kit/client";
import { useCatalog } from "@/components/providers/CatalogProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { findVariantId, variantLabels } from "@/lib/zcom/adapters";
import type { Product } from "@/types";

type StoredLine = { id: string; size: string; qty: number; colour?: string };

// colour is always resolved on a line
export type CartLine = StoredLine & { key: string; product: Product; colour: string };

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  /** Zcom cart id, for checkout */
  cartId: string | null;
  isOpen: boolean;
  /** True while a cart change is on its way to the store */
  pending: boolean;
  open: () => void;
  close: () => void;
  add: (id: string, size: string, colour?: string, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  applyCode: (code: string) => Promise<void>;
  removeCode: () => Promise<void>;
  promotionCode: string | null;
  discount: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const keyOf = (l: Pick<ZcomCartLine, "productId" | "variantId">) => `${l.productId}__${l.variantId ?? ""}`;

// A product the catalogue doesn't list (e.g. unpublished since it was added) still shows in the bag
const fallbackProduct = (l: ZcomCartLine): Product => ({
  id: l.productId,
  title: l.name ?? "Product",
  category: "",
  price: l.finalPrice ?? l.price ?? 0,
  href: "/shop",
  image: l.asset?.path ?? "/og.png",
  featured: l.asset?.path ?? "/og.png",
  colour: "",
  description: "",
});

// The bag lives on the Zcom store (server cart; guests get a signed guest id, merged at sign in)
export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const zcom = useZcomCart();
  const { getProduct, getByZcomId } = useCatalog();
  const analytics = useAnalytics();
  const ads = useAdsTracking();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const fail = useCallback((error: unknown) => toast.error(getErrorMessage(error)), [toast]);

  const add = useCallback(
    (id: string, size: string, colour?: string, qty = 1) => {
      const product = getProduct(id);
      if (!product?.zcom) return;
      const variantId = findVariantId(product, size, colour);
      setIsOpen(true);
      zcom
        .addItem({ productId: product.zcom.productId, variantId, qty })
        .then(() => {
          const variant = { _id: variantId, sku: null, title: null, optionValues: null, price: product.price, compareAtPrice: null, status: null, availability: null, availableQuantity: null };
          analytics.addToCart({ _id: product.zcom!.productId, name: product.title, variants: [variant], productOptions: [] }, variant, qty);
          // Meta / Google Ads add-to-cart (sent only with the shopper's ads consent); ids are variant ids
          ads.trackAddToCart({ id: variantId ?? product.zcom!.productId, quantity: qty, price: product.price });
        })
        .catch(fail);
    },
    [getProduct, zcom, analytics, ads, fail],
  );

  const findLine = useCallback((key: string) => zcom.lines.find((l) => keyOf(l) === key), [zcom.lines]);

  const setQty = useCallback(
    (key: string, qty: number) => {
      const line = findLine(key);
      if (line) zcom.setQuantity(line, qty).catch(fail);
    },
    [findLine, zcom, fail],
  );

  const remove = useCallback(
    (key: string) => {
      const line = findLine(key);
      if (line) zcom.removeLine(line).catch(fail);
    },
    [findLine, zcom, fail],
  );

  // After a paid order the store empties the bag itself — re-read it
  const clear = useCallback(() => {
    void zcom.refetch();
  }, [zcom]);

  const applyCode = useCallback(async (code: string) => {
    await zcom.applyPromotion(code);
  }, [zcom]);

  const removeCode = useCallback(async () => {
    await zcom.removePromotion();
  }, [zcom]);

  const value = useMemo<CartContextValue>(() => {
    const lines: CartLine[] = zcom.lines.map((l) => {
      const product = getByZcomId(l.productId) ?? fallbackProduct(l);
      const { size, colour } = variantLabels(product, l.variantId);
      return {
        key: keyOf(l),
        id: product.id,
        size,
        colour,
        qty: l.qty,
        product: { ...product, price: l.finalPrice ?? l.price ?? product.price },
      };
    });
    const cart = zcom.cart;
    return {
      lines,
      count: zcom.itemCount,
      subtotal: cart?.discountedPrice ?? cart?.totalprice ?? 0,
      cartId: cart?._id ?? null,
      isOpen,
      pending: zcom.pending,
      open,
      close,
      add,
      setQty,
      remove,
      clear,
      applyCode,
      removeCode,
      promotionCode: cart?.promotion?.promotionCode ?? null,
      discount: cart?.totalDiscount ?? 0,
    };
  }, [zcom.lines, zcom.cart, zcom.itemCount, zcom.pending, getByZcomId, isOpen, open, close, add, setQty, remove, clear, applyCode, removeCode]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
};
