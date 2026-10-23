import { useSyncExternalStore } from "react";

// A localStorage-backed value shared by every component that reads it, kept in sync across tabs.
// Server render (and the first client render) see `fallback`, so markup always matches.
export const createLocalStore = <T>(key: string, fallback: T) => {
  const listeners = new Set<() => void>();
  let cache: T | undefined;

  const read = (): T => {
    if (cache === undefined) {
      try {
        const raw = localStorage.getItem(key);
        cache = raw === null ? fallback : (JSON.parse(raw) as T);
      } catch {
        cache = fallback;
      }
    }
    return cache;
  };

  const write = (update: (prev: T) => T) => {
    cache = update(read());
    try {
      localStorage.setItem(key, JSON.stringify(cache));
    } catch {
      // storage unavailable — value lives for this visit only
    }
    listeners.forEach((l) => l());
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      cache = undefined;
      listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  };

  const useValue = () => useSyncExternalStore(subscribe, read, () => fallback);

  return { read, write, subscribe, useValue };
};
