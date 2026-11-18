"use client";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Button from "@/components/ui/Button";
import { useCatalog } from "@/components/providers/CatalogProvider";
import { useLoader } from "@/components/providers/LoaderProvider";

gsap.registerPlugin(useGSAP);

const DURATION = 1; // seconds the loader holds on pages without the sound choice
const STEP = 0.22; // seconds between image swaps

const Loader = () => {
  // The store's newest pieces cycle in the frame
  const products = useCatalog().products.slice(0, 8);
  const { setLoaded, setEntry } = useLoader();
  // Only the home page has the film, so only it asks how to enter; other pages let themselves in
  const [asksSound] = useState(usePathname() === "/");
  const [isDone, setIsDone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const cycleRef = useRef<gsap.core.Timeline | null>(null);
  const isLeavingRef = useRef(false);

  // Fade image + choices, then lift the white screen as the hero comes in
  const enter = (withSound: boolean) => {
    if (isLeavingRef.current) return;
    isLeavingRef.current = true;
    // Set inside the click itself, so the browser lets the film start with its sound on
    setEntry(withSound ? "sound" : "silent");

    const tl = gsap.timeline();
    tl.to([".loader__stage", ".loader__enter"], { autoAlpha: 0, duration: 0.6, ease: "power2.inOut" });
    tl.call(() => {
      window.lenis?.start();
      setLoaded();
    });
    tl.to(rootRef.current, { autoAlpha: 0, duration: 0.8, ease: "power2.inOut" });
    tl.call(() => {
      cycleRef.current?.kill();
      setIsDone(true);
    });
  };

  useGSAP(
    () => {
      window.lenis?.stop();
      window.scrollTo(0, 0);

      // Products cut straight from one to the next, cycling until the visitor enters
      const images = gsap.utils.toArray<HTMLElement>(".loader__image");
      const cycle = gsap.timeline({ repeat: -1, repeatDelay: STEP });
      images.forEach((image, i) => {
        cycle.set(images, { autoAlpha: 0 }, i * STEP);
        cycle.set(image, { autoAlpha: 1 }, i * STEP);
      });
      cycleRef.current = cycle;

      if (!asksSound) gsap.delayedCall(DURATION, enter, [false]);
    },
    { scope: rootRef },
  );

  if (isDone) return null;

  return (
    <div ref={rootRef} aria-hidden={!asksSound || undefined} className="loader fixed inset-0 z-200 bg-white text-ink">
      {/* Centre — products cycle in a 20rem frame */}
      <div className="loader__stage absolute left-1/2 top-1/2 aspect-3/4 w-40 max-w-[70vw] -translate-x-1/2 -translate-y-1/2 overflow-hidden">
        {products.map((p) => (
          <img
            key={p.id}
            src={p.image}
            alt=""
            className="loader__image invisible absolute inset-0 size-full object-contain opacity-0"
          />
        ))}
      </div>

      {/* Bottom — enter with the film's sound on, or without */}
      {asksSound && (
        <div className="loader__enter absolute inset-x-0 bottom-0">
          <div className="container flex flex-col items-center gap-4 pb-8">
            <Button onClick={() => enter(true)}>Enter with sound</Button>
            <button
              type="button"
              onClick={() => enter(false)}
              className="secondary-font text-xs uppercase transition-opacity hover:opacity-60"
            >
              <span className="link-line">Enter without sound</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loader;
