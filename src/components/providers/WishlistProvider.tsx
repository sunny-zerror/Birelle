"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import { getProduct } from "@/data/products";
import type { Product } from "@/types";

const STORAGE_KEY = "birelle-wishlist";

type WishlistContextValue = {
  items: Product[];
  count: number;
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

// --- Persisted store (localStorage), read via useSyncExternalStore ---------
const EMPTY: string[] = [];
const listeners = new Set<() => void>();
let cache: string[] | null = null;

const readStore = () => {
  if (cache === null) {
    try {
      cache = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as string[];
    } catch {
      cache = EMPTY;
    }
  }
  return cache;
};

const writeStore = (update: (prev: string[]) => string[]) => {
  cache = update(readStore());
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // storage unavailable — wishlist lives for this visit only
  }
  listeners.forEach((l) => l());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  // Keep other open tabs in sync
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    cache = null;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
};

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  // Server render (and first client render) see an empty wishlist, so markup matches
  const stored = useSyncExternalStore(subscribe, readStore, () => EMPTY);

  const toggle = useCallback((id: string) => {
    writeStore((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }, []);

  const remove = useCallback((id: string) => {
    writeStore((prev) => prev.filter((i) => i !== id));
  }, []);

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
