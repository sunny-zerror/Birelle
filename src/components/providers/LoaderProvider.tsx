"use client";

import { createContext, useContext, useMemo, useState } from "react";

type LoaderContextValue = {
  isLoaded: boolean;
  setLoaded: () => void;
};

const LoaderContext = createContext<LoaderContextValue | null>(null);

// Flips once the intro loader has finished — hero and header wait on it
export const LoaderProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const value = useMemo(() => ({ isLoaded, setLoaded: () => setIsLoaded(true) }), [isLoaded]);

  return <LoaderContext.Provider value={value}>{children}</LoaderContext.Provider>;
};

export const useLoader = () => {
  const ctx = useContext(LoaderContext);
  if (!ctx) throw new Error("useLoader must be used inside LoaderProvider");
  return ctx;
};
