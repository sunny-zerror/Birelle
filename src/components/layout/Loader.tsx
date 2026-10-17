"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { products } from "@/data/products";
import { useLoader } from "@/components/providers/LoaderProvider";

gsap.registerPlugin(useGSAP);

const DURATION = 3; // seconds the counter runs for
const STEP = 0.22; // seconds between image swaps

const Loader = () => {
  const { setLoaded } = useLoader();
  const [isDone, setIsDone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      window.lenis?.stop();
      window.scrollTo(0, 0);

      const images = gsap.utils.toArray<HTMLElement>(".loader__image");
      const tl = gsap.timeline();

      // Counter jumps 00 → 99 in 8–10 random steps, each at a random moment within DURATION
      const setCount = (n: number) => {
        if (counterRef.current) counterRef.current.textContent = String(n).padStart(2, "0");
      };
      const steps = gsap.utils.random(8, 10, 1);
      const values = gsap.utils.shuffle(Array.from({ length: 98 }, (_, i) => i + 1)).slice(0, steps - 1).sort((a, b) => a - b);
      const times = Array.from({ length: steps - 1 }, () => gsap.utils.random(0.1, DURATION - 0.2)).sort((a, b) => a - b);
      values.forEach((n, i) => tl.call(setCount, [n], times[i]));
      tl.call(setCount, [99], DURATION);

      // Products cut straight from one to the next, cycling until the counter finishes
      const swaps = Math.floor(DURATION / STEP);
      for (let i = 0; i < swaps; i++) {
        tl.set(images, { autoAlpha: 0 }, i * STEP);
        tl.set(images[i % images.length], { autoAlpha: 1 }, i * STEP);
      }

      // Fade counter + image, then lift the white screen as the hero comes in
      tl.to([".loader__stage", ".loader__counter"], { autoAlpha: 0,  duration: 0.6, ease: "power2.inOut" }, DURATION + 0.1);
      tl.call(() => {
        window.lenis?.start();
        setLoaded();
      });
      tl.to(rootRef.current, { autoAlpha: 0, duration: 0.8, ease: "power2.inOut" });
      tl.call(() => setIsDone(true));
    },
    { scope: rootRef },
  );

  if (isDone) return null;

  return (
    <div ref={rootRef} aria-hidden="true" className="loader fixed inset-0 z-200 bg-white text-ink">
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

      {/* Bottom right — percentage */}
      <div className="loader__counter absolute inset-x-0 bottom-0">
        <div className="container flex justify-center pb-5">
          <p className="secondary-font text-4xl leading-none tabular-nums md:text-3xl">
            <span ref={counterRef}>00</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Loader;
