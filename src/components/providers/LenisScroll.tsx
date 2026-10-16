"use client";
import React, { useEffect, useRef } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";

export default function LenisScroll({ children }: { children: React.ReactNode }) {
  const lenis = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (lenis.current) lenis.current.scrollTo(0, { immediate: true });
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // if (window.innerWidth < 1024) return

    const instance = new Lenis({
      smoothWheel: true,
      lerp: .1,
      wheelMultiplier: .7,
      gestureOrientation: "vertical",
      syncTouch: false,
    });

    lenis.current = instance;
    window.lenis = instance;

    let frame: number;
    const raf = (time: number) => {
      instance.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    const handleResize = () => {
      instance.resize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
      instance.destroy();
      lenis.current = null;
      window.lenis = null;
    };
  }, []);

  return <>{children}</>;
}
