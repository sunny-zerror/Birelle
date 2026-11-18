"use client";

import { createContext, useContext, useMemo, useState } from "react";

/** How the visitor left the intro loader — null while it is still up */
export type LoaderEntry = "sound" | "silent" | null;

type LoaderContextValue = {
  isLoaded: boolean;
  setLoaded: () => void;
  entry: LoaderEntry;
  setEntry: (entry: LoaderEntry) => void;
};

const LoaderContext = createContext<LoaderContextValue | null>(null);

// Flips once the intro loader has finished — hero and header wait on it
export const LoaderProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [entry, setEntry] = useState<LoaderEntry>(null);
  const value = useMemo(() => ({ isLoaded, setLoaded: () => setIsLoaded(true), entry, setEntry }), [isLoaded, entry]);

  return <LoaderContext.Provider value={value}>{children}</LoaderContext.Provider>;
};

export const useLoader = () => {
  const ctx = useContext(LoaderContext);
  if (!ctx) throw new Error("useLoader must be used inside LoaderProvider");
  return ctx;
};
