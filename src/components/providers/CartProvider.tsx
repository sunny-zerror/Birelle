"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react";
import { getProduct } from "@/data/products";
import type { Product } from "@/types";

const STORAGE_KEY = "birelle-cart";

type StoredLine = { id: string; size: string; qty: number };

export type CartLine = StoredLine & { key: string; product: Product };

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (id: string, size: string, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const lineKey = (id: string, size: string) => `${id}__${size}`;

// --- Persisted store (localStorage), read via useSyncExternalStore ---------
const EMPTY: StoredLine[] = [];
const listeners = new Set<() => void>();
let cache: StoredLine[] | null = null;

const readStore = () => {
  if (cache === null) {
    try {
      cache = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as StoredLine[];
    } catch {
      cache = EMPTY;
    }
  }
  return cache;
};

const writeStore = (update: (prev: StoredLine[]) => StoredLine[]) => {
  cache = update(readStore());
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // storage unavailable — cart lives for this visit only
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

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  // Server render (and first client render) see an empty cart, so markup matches
  const stored = useSyncExternalStore(subscribe, readStore, () => EMPTY);
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const add = useCallback((id: string, size: string, qty = 1) => {
    writeStore((prev) => {
      const existing = prev.find((l) => l.id === id && l.size === size);
      if (existing) return prev.map((l) => (l === existing ? { ...l, qty: l.qty + qty } : l));
      return [...prev, { id, size, qty }];
    });
    setIsOpen(true);
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    writeStore((prev) =>
      qty < 1 ? prev.filter((l) => lineKey(l.id, l.size) !== key) : prev.map((l) => (lineKey(l.id, l.size) === key ? { ...l, qty } : l)),
    );
  }, []);

  const remove = useCallback((key: string) => {
    writeStore((prev) => prev.filter((l) => lineKey(l.id, l.size) !== key));
  }, []);

  const clear = useCallback(() => writeStore(() => []), []);

  const value = useMemo<CartContextValue>(() => {
    const lines = stored.flatMap((l) => {
      const product = getProduct(l.id);
      return product ? [{ ...l, key: lineKey(l.id, l.size), product }] : [];
    });

    return {
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: lines.reduce((n, l) => n + l.qty * l.product.price, 0),
      isOpen,
      open,
      close,
      add,
      setQty,
      remove,
      clear,
    };
  }, [stored, isOpen, open, close, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
};
