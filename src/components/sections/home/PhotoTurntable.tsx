"use client";

import { useEffect, useRef, type RefObject } from "react";

const VIEWS = 4; // front, facing right, back, facing left — 90° apart
const STEP = 360 / VIEWS;
const SPIN_SECONDS = 5; // one full turn while hovered
const HANDOVER = 0.14; // share of each quarter turn spent cross-fading — short, so it reads as a turn, not a dissolve
const BLUR = 1.2; // px of motion blur at the hand-over between two views

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

type Props = {
  srcs: readonly string[];
  alt: string;
  hovered: boolean;
  /** Scroll progress through the section, 0 → 1 (one full turn) */
  progress: RefObject<number>;
};

// A turntable made from four photos: the angle runs continuously and the figure's silhouette morphs in width from
// one view to the next (front → profile narrows, profile → back widens), handing over to the next photo halfway
// with a quick cross-fade and a touch of motion blur. A floor shadow follows the width. The white photo backgrounds
// multiply away, so the two views blend cleanly.
const PhotoTurntable = ({ srcs, alt, hovered, progress }: Props) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const shadowRef = useRef<HTMLSpanElement>(null);
  const hoveredRef = useRef(hovered);

  useEffect(() => {
    hoveredRef.current = hovered;
  }, [hovered]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const m = { base: (progress.current ?? 0) * 360, spin: 0, velocity: 0 };
    let frame = 0;
    let last = performance.now();

    // Width ÷ height of each view (side views are narrower), for the shadow
    const aspectOf = (i: number) => {
      const img = imgRefs.current[i];
      return img?.naturalWidth ? img.naturalWidth / img.naturalHeight : 0.42;
    };

    const render = (angle: number) => {
      const a = ((angle % 360) + 360) % 360;
      const k = Math.floor(a / STEP) % VIEWS;
      const next = (k + 1) % VIEWS;
      const t = a / STEP - Math.floor(a / STEP);
      const hand = reduceMotion.matches ? Math.round(t) : smoothstep(0.5 - HANDOVER / 2, 0.5 + HANDOVER / 2, t);
      const blur = reduceMotion.matches ? 0 : BLUR * Math.sin(Math.PI * hand);
      // Both views meet at their average width halfway through, so the silhouette never jumps
      const from = aspectOf(k);
      const to = aspectOf(next);
      const mid = (from + to) / 2;
      const outScale = 1 + (mid / from - 1) * Math.min(1, t / 0.5);
      const inScale = mid / to + (1 - mid / to) * Math.max(0, (t - 0.5) / 0.5);

      imgRefs.current.forEach((img, i) => {
        if (!img) return;
        let opacity = 0;
        let scale = 1;
        if (i === k) {
          opacity = 1 - hand;
          scale = outScale;
        } else if (i === next) {
          opacity = hand;
          scale = inScale;
        }
        img.style.opacity = String(opacity);
        img.style.transform = `translateX(-50%) scaleX(${scale.toFixed(4)})`;
        img.style.filter = blur > 0.05 && opacity > 0 ? `blur(${blur.toFixed(2)}px)` : "";
      });

      const shadow = shadowRef.current;
      if (shadow) {
        const width = t < 0.5 ? from * outScale : to * inScale;
        shadow.style.width = `${width * 100 * 0.95}%`;
      }
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      const still = reduceMotion.matches;

      m.base += ((progress.current ?? 0) * 360 - m.base) * (1 - Math.exp(-dt * 6));
      const target = hoveredRef.current && !still ? 360 / SPIN_SECONDS : 0;
      m.velocity += (target - m.velocity) * (1 - Math.exp(-dt * 3));
      m.spin += m.velocity * dt;

      // At rest, settle on the nearest whole view so the figure never stops mid-blend
      if (!hoveredRef.current && Math.abs(m.velocity) < 20) {
        const angle = m.base + m.spin;
        m.spin += (Math.round(angle / STEP) * STEP - angle) * (1 - Math.exp(-dt * 5));
      }

      render(m.base + m.spin);
      frame = requestAnimationFrame(tick);
    };

    // Runs only while the section is on screen
    const observer = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frame);
      if (!entry.isIntersecting) return;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    });
    observer.observe(root);
    render(m.base);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [progress]);

  return (
    <div ref={rootRef} className="photo-turntable absolute inset-0">
      {/* Floor shadow — stays put while the figure turns above it, which sells the turn */}
      <span
        ref={shadowRef}
        aria-hidden="true"
        className="absolute bottom-0 left-1/2 h-[3%] w-[40%] -translate-x-1/2 translate-y-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(0_0_0/0.22),transparent)]"
      />
      {srcs.map((src, i) => (
        <img
          key={src}
          ref={(el) => {
            imgRefs.current[i] = el;
          }}
          src={src}
          alt={i === 0 ? alt : ""}
          aria-hidden={i === 0 ? undefined : true}
          draggable={false}
          className="absolute bottom-0 left-1/2 h-full w-auto max-w-none origin-bottom mix-blend-multiply will-change-[transform,opacity]"
          style={{ opacity: i === 0 ? 1 : 0, transform: "translateX(-50%)" }}
        />
      ))}
    </div>
  );
};

export default PhotoTurntable;
