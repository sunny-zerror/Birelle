"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { getProduct } from "@/data/products";
import { useAuth } from "@/components/providers/AuthProvider";
import { sessionStore, wishlistsStore } from "@/lib/accountStore";
import type { Product } from "@/types";

type WishlistContextValue = {
  items: Product[];
  count: number;
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

const EMPTY: string[] = [];

// Each account keeps its own list (see wishlistsStore) — signed out, the wishlist is empty
const writeFor = (email: string, update: (prev: string[]) => string[]) =>
  wishlistsStore.write((all) => ({ ...all, [email]: update(all[email] ?? EMPTY) }));

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, openLogin } = useAuth();
  const all = wishlistsStore.useValue();
  const stored = (user && all[user.email]) || EMPTY;

  // Saving needs an account — signed-out visitors sign in first, then the piece is saved for them
  const toggle = useCallback(
    (id: string) => {
      if (user) {
        writeFor(user.email, (prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
        return;
      }
      openLogin({
        next: null,
        // Runs once signed in — the session is already stored, so read it rather than the stale closure
        onSuccess: () => {
          const email = sessionStore.read()?.email;
          if (email) writeFor(email, (prev) => (prev.includes(id) ? prev : [...prev, id]));
        },
      });
    },
    [user, openLogin],
  );

  const remove = useCallback(
    (id: string) => {
      if (user) writeFor(user.email, (prev) => prev.filter((i) => i !== id));
    },
    [user],
  );

  const value = useMemo<WishlistContextValue>(() => {
    const items = stored.flatMap((id) => getProduct(id) ?? []);
    return {
      items,
      count: items.length,
      has: (id) => stored.includes(id),
      toggle,
      remove,
    };
  }, [stored, toggle, remove]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside <WishlistProvider>");
  return ctx;
};
