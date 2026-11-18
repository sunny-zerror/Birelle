"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { useWishlist as useZcomWishlist } from "@zcom/storefront-kit/client";
import { getErrorMessage } from "@zcom/storefront-kit/core";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCatalog } from "@/components/providers/CatalogProvider";
import { useToast } from "@/components/providers/ToastProvider";
import type { Product } from "@/types";

type WishlistContextValue = {
  items: Product[];
  count: number;
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

// Saved pieces live on the customer's Zcom account — signed out, the wishlist is empty
export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, openLogin } = useAuth();
  const zcom = useZcomWishlist();
  const { getProduct, getByZcomId } = useCatalog();
  const toast = useToast();

  const zcomIdOf = useCallback((id: string) => getProduct(id)?.zcom?.productId, [getProduct]);

  // Flips the piece on the store, then says which way it went
  const flip = useCallback(
    (id: string, zcomId: string) => {
      const title = getProduct(id)?.title;
      const wasSaved = zcom.has(zcomId);
      zcom
        .toggle(zcomId)
        .then(() =>
          wasSaved
            ? toast.info("Removed from your wishlist", { description: title })
            : toast.success("Saved to your wishlist", { description: title }),
        )
        .catch((error) => toast.error(getErrorMessage(error)));
    },
    [getProduct, zcom, toast],
  );

  // Saving needs an account — signed-out visitors sign in first, then the piece is saved for them
  const toggle = useCallback(
    (id: string) => {
      const zcomId = zcomIdOf(id);
      if (!zcomId) return;
      if (user) {
        flip(id, zcomId);
        return;
      }
      openLogin({
        next: null,
        onSuccess: () => {
          if (!zcom.has(zcomId)) flip(id, zcomId);
        },
      });
    },
    [user, openLogin, zcom, zcomIdOf, flip],
  );

  const remove = useCallback(
    (id: string) => {
      const zcomId = zcomIdOf(id);
      if (user && zcomId && zcom.has(zcomId)) flip(id, zcomId);
    },
    [user, zcom, zcomIdOf, flip],
  );

  const value = useMemo<WishlistContextValue>(() => {
    const items = user ? zcom.productIds.flatMap((zid) => getByZcomId(zid) ?? []) : [];
    return {
      items,
      count: items.length,
      has: (id) => {
        const zcomId = zcomIdOf(id);
        return !!user && !!zcomId && zcom.has(zcomId);
      },
      toggle,
      remove,
    };
  }, [user, zcom, getByZcomId, zcomIdOf, toggle, remove]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside <WishlistProvider>");
  return ctx;
};
