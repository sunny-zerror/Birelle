"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "next-view-transitions";
import { RiHeartFill, RiHeartLine } from "@remixicon/react";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/data/products";
import { useCatalog } from "@/components/providers/CatalogProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import type { Product } from "@/types";
import CuratedWaveCanvas from "./CuratedWaveCanvas";

const START = 3;

const AUTOPLAY_MS = 2500;
const EASE = 0.075; // how quickly the track glides to its target each frame (at 60fps)
const DRAG_EASE = 0.35; // tighter follow while the pointer is down
const THROW = 180; // ms of release velocity carried into the snap

// Wraps a slide's distance from the centre into [-COUNT/2, COUNT/2) so the loop never ends
const wrap = (d: number, COUNT: number) => ((((d + COUNT / 2) % COUNT) + COUNT) % COUNT) - COUNT / 2;

type CardProps = { product: Product; isWished: boolean; onToggle: () => void };

const Card = ({ product, isWished, onToggle }: CardProps) => (
  <article className="group relative">
    {/* Image scales up on hover */}
    <div className="home-curated__media relative aspect-3/4 overflow-hidden">
      <Link href={product.href} draggable={false} className="absolute flex items-center justify-center inset-0" aria-label={product.title}>
        <img
          src={product.image}
          alt={product.title}
          draggable={false}
          className="w-[80%] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-108"
          loading="lazy"
        />
      </Link>

      <button
        type="button"
        aria-label={`${isWished ? "Remove" : "Add"} ${product.title} ${isWished ? "from" : "to"} wishlist`}
        aria-pressed={isWished}
        onClick={onToggle}
        className="center absolute right-2 top-2 size-8 text-ink opacity-0 transition-[opacity,scale] duration-500 group-hover:opacity-100 hover:opacity-60! focus-visible:opacity-100 active:scale-90"
      >
        {isWished ? <RiHeartFill className="size-5" /> : <RiHeartLine className="size-5" />}
      </button>
    </div>

    {/* Name (underlined) over price, centred, rises in on hover. Kept in the layout but hidden on the card under the canvas */}
    <Link
      href={product.href}
      tabIndex={-1}
      draggable={false}
      className="flex  flex-col items-center text-center text-ink opacity-0 transition-[opacity,translate] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100 in-[.is-active]:invisible"
    >
      <div className="block w-fit">
      <h3 className="max-w-full text-xs  border-ink pb-1  uppercase ">{product.title}</h3>
      <div className="w-full h-[1px] bg-black"></div>
      </div>
      <p className="mt-1 text-xs ">{formatPrice(product.price)}</p>
    </Link>
  </article>
);

const HomeCuratedCarousel = ({ products }: { products: Product[] }) => {
  // Listed twice so the loop always has cards waiting off-screen on both sides
  const slides = [...products, ...products];
  const FEATURED = products.map((p) => p.featured);
  const COUNT = slides.length;
  const { has, toggle } = useWishlist();
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Shared with the WebGL canvas so its wave follows the track frame for frame
  const positionRef = useRef(START);
  const waveWakeRef = useRef<(() => void) | null>(null);
  const onWaveWake = useCallback((redraw: (() => void) | null) => {
    waveWakeRef.current = redraw;
  }, []);
  // Product shown in the fixed centre canvas
  const [activeIndex, setActiveIndex] = useState(START % products.length);
  const activeProduct = products[activeIndex];
  const isActiveWished = has(activeProduct.id);

  // Custom carousel: one rAF loop glides `current` towards `target` (both measured in slides).
  // Autoplay and snapping move `target` by whole slides; dragging moves it freely.
  // Every card is the same size and slides at a constant spacing behind the fixed centre canvas.
  useEffect(() => {
    const viewport = viewportRef.current;
    const els = slideRefs.current;
    if (!viewport) return;

    let current = START;
    let target = START;
    let active = -1;
    let width = 0; // card width, px
    let canvasWidth = 0;
    let gap = 0;
    let isHovering = false;
    let drag: { x: number; target: number; lastX: number; lastT: number; v: number; moved: boolean } | null = null;
    let frame = 0;
    let last = performance.now();
    // Tick only for changes the user caused by dragging (incl. the glide after release), not autoplay
    let isUserDriven = false;
    const tickSound = new Audio("/audio/tick.mp3");
    tickSound.preload = "auto";
    const playTick = () => {
      // Clone so quick successive ticks overlap instead of cutting each other off
      const s = tickSound.cloneNode() as HTMLAudioElement;
      s.volume = 0.5;
      s.play().catch(() => {});
    };

    const measure = () => {
      const el = els[0];
      if (!el) return;
      width = el.offsetWidth;
      canvasWidth = canvasRef.current?.offsetWidth ?? width;
      gap = window.matchMedia("(min-width: 48rem)").matches ? 20 : 12;
    };

    // One "slide" of travel — wide enough that the cards either side of the canvas sit clear of it
    const stepPx = () => canvasWidth / 2 + gap + width / 2;

    const render = () => {
      const step = stepPx();

      els.forEach((el, i) => {
        if (!el) return;
        el.style.transform = `translate3d(${wrap(i - current, COUNT) * step}px, 0, 0)`;
      });
      positionRef.current = current;
      waveWakeRef.current?.();

      // The card under the canvas hides its caption; the canvas shows its featured shot
      const next = ((Math.round(current) % COUNT) + COUNT) % COUNT;
      if (next !== active) {
        els[active]?.classList.remove("is-active");
        els[next]?.classList.add("is-active");
        if (isUserDriven && active !== -1) playTick();
        active = next;
        setActiveIndex(next % products.length);
      }
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / (1000 / 60), 4); // frames elapsed at 60fps
      last = now;
      const k = 1 - Math.pow(1 - (drag ? DRAG_EASE : EASE), dt);
      if (Math.abs(target - current) > 0.0005) {
        current += (target - current) * k;
        render();
      }
      frame = requestAnimationFrame(tick);
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      drag = { x: e.clientX, target, lastX: e.clientX, lastT: e.timeStamp, v: 0, moved: false };
    };

    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > 6) {
        drag.moved = true;
        viewport.setPointerCapture(e.pointerId);
      }
      if (!drag.moved) return;
      isUserDriven = true;
      const dt = e.timeStamp - drag.lastT;
      if (dt > 0) drag.v = 0.8 * ((e.clientX - drag.lastX) / dt) + 0.2 * drag.v; // px/ms, smoothed
      drag.lastX = e.clientX;
      drag.lastT = e.timeStamp;
      target = drag.target - dx / stepPx();
    };

    const onUp = () => {
      if (!drag) return;
      const moved = drag.moved;
      // Carry a little of the throw, then snap to the nearest whole slide
      if (moved) target = Math.round(target - (drag.v * THROW) / stepPx());
      drag = null;
      // Swallow the click that follows a drag so links don't fire
      if (moved) {
        const block = (ev: MouseEvent) => {
          ev.preventDefault();
          ev.stopPropagation();
        };
        viewport.addEventListener("click", block, { capture: true, once: true });
        setTimeout(() => viewport.removeEventListener("click", block, { capture: true }), 0);
      }
    };

    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === "mouse") isHovering = true;
    };
    const onLeave = () => {
      isHovering = false;
    };

    const autoplay = window.setInterval(() => {
      if (drag || isHovering || document.hidden) return;
      isUserDriven = false;
      target = Math.round(target) + 1;
    }, AUTOPLAY_MS);

    const ro = new ResizeObserver(() => {
      measure();
      render();
    });
    ro.observe(viewport);

    viewport.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    viewport.addEventListener("pointerenter", onEnter);
    viewport.addEventListener("pointerleave", onLeave);

    measure();
    render();
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      clearInterval(autoplay);
      ro.disconnect();
      viewport.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      viewport.removeEventListener("pointerenter", onEnter);
      viewport.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <section id="home-curated" className="home-curated section overflow-hidden bg-white">
      <div className="home-curated__head container flex items-baseline justify-between">
        <h2 className=" uppercase text-deep">Curated Selection</h2>
        <Button href="/shop">View All</Button>
      </div>

      {/* Vertical swipes still scroll the page; horizontal ones drag the track */}
      <div
        ref={viewportRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Curated selection"
        className="home-curated__slider relative mt-stack cursor-grab touch-pan-y select-none active:cursor-grabbing md:mt-24"
      >
        {/* In-flow canvas-sized copy of a card gives the track its height; everything else is absolutely positioned */}
        <div aria-hidden="true" inert className="invisible mx-auto w-[60vw] md:w-[20vw]">
          <Card product={slides[0]} isWished={false} onToggle={() => {}} />
        </div>

        {/* Cards are 70% of the canvas width and pushed down so their images share the canvas's bottom edge
            (canvas image height − card image height = 0.3 × canvas width × 4/3) */}
        {slides.map((product, i) => (
          <div
            key={`${product.href}-${i}`}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            className="home-curated__slide absolute left-1/2 top-[24vw] -ml-[21vw] w-[42vw] will-change-transform md:top-[8vw] md:-ml-[7vw] md:w-[14vw]"
          >
            <Card product={product} isWished={has(product.id)} onToggle={() => toggle(product.id)} />
          </div>
        ))}

        {/* Fixed centre canvas — never moves or scales; a bulging RGB wave carries one featured shot into the next, in step with the track */}
        <div
          ref={canvasRef}
          className="home-curated__canvas absolute left-1/2 top-0 z-10 -ml-[30vw] aspect-3/4 w-[60vw] md:-ml-[10vw] md:w-[20vw]"
        >
          {/* Plain image underneath until the WebGL textures are ready */}
          <img src={activeProduct.featured} alt="" draggable={false} className="cover opacity-0 absolute inset-0" />
          <CuratedWaveCanvas srcs={FEATURED} position={positionRef} onWake={onWaveWake} />

          <Link href={activeProduct.href} draggable={false} className="absolute inset-0" aria-label={activeProduct.title}>
            <span className="absolute inset-x-0 bottom-0 flex items-baseline justify-between gap-4 p-4 text-sm uppercase tracking-wide text-white">
              <span className="truncate">{activeProduct.title}</span>
              <span className="shrink-0 tabular-nums">{formatPrice(activeProduct.price)}</span>
            </span>
          </Link>

          <button
            type="button"
            aria-label={`${isActiveWished ? "Remove" : "Add"} ${activeProduct.title} ${isActiveWished ? "from" : "to"} wishlist`}
            aria-pressed={isActiveWished}
            onClick={() => toggle(activeProduct.id)}
            className="center absolute right-2 top-2 size-8 text-white transition-[opacity,scale] duration-500 hover:opacity-60 active:scale-90"
          >
            {isActiveWished ? <RiHeartFill className="size-5" /> : <RiHeartLine className="size-5" />}
          </button>
        </div>
      </div>
    </section>
  );
};

// The store's newest pieces (from Zcom); hidden until the catalogue has any
const HomeCurated = () => {
  const { products } = useCatalog();
  const curated = products.slice(0, 8);
  if (curated.length === 0) return null;
  return <HomeCuratedCarousel products={curated} />;
};

export default HomeCurated;
