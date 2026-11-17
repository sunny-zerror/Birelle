"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useTransitionRouter } from "next-view-transitions";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { RiArrowDownLine } from "@remixicon/react";
import Button from "@/components/ui/Button";
import { useLoader } from "@/components/providers/LoaderProvider";
import { LOOKBOOK_SEASON, LOOKBOOK_TITLE } from "@/data/lookbook";
import { useCatalog } from "@/components/providers/CatalogProvider";
import { Playground, loadGarmentAsset, type Bag, type Bounds, type Fabric, type GarmentAsset } from "@/lib/cloth";
import GarmentLayer from "./GarmentLayer";
import LookbookBag, { BAG } from "./LookbookBag";
import "@/styles/lookbook.css";

gsap.registerPlugin(useGSAP);

const HINT_MS = 4800;
const NAV_DELAY_MS = 450; // after the piece lands in the bag
const NAV_FALLBACK_MS = 2600; // opens the look even if the landing is never seen (e.g. a background tab)
const NOTE = {
  idle: "Drop a product in the bag",
  drag: "Now drop it in the bag",
  ready: "Release to view the look",
};
const NOTE_SUB = "To view the full look";

type Hint = { shown: boolean; interacted: boolean; lastCheck: number; timer: number; reduced: boolean };

/** Where the hero is in the pick → drop → open flow (mirrored on the stage as data-mode for the CSS) */
type Mode = "idle" | "drag" | "ready" | "bagging";

/** The bag in stage px: what the physics needs, plus the floor and handle tops for the pointer */
type BagBox = Bag & { bottom: number; handleTop: number };

// Interactive cloth lookbook — garments rain down either side of a Birelle shopping bag,
// get picked up and dropped into the bag to open that look's page
const LookbookHero = () => {
  // Looks from the Zcom store (the designer's built-in looks until the store has some)
  const { looks } = useCatalog();
  const RAIN_ORDER = looks.map((_, i) => i);
  const { isLoaded } = useLoader();
  const router = useTransitionRouter();

  const stageRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const noteBoxRef = useRef<HTMLDivElement>(null);
  // The bag's front copy, drawn over the cloth: measured for the physics, shown while a piece falls in
  const bagRef = useRef<HTMLDivElement>(null);
  const noteRef = useRef<HTMLParagraphElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const guideRef = useRef<HTMLDivElement>(null);

  const playground = useRef<Playground | null>(null);
  const assets = useRef<Promise<GarmentAsset>[]>([]);
  const bag = useRef<BagBox | null>(null);
  const pointerStart = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const held = useRef<number | null>(null);
  const mode = useRef<Mode>("idle");
  const navTimer = useRef(0);
  const started = useRef(false);
  const hint = useRef<Hint>({ shown: false, interacted: false, lastCheck: 0, timer: 0, reduced: false });

  const [nameReady, setNameReady] = useState(false);

  /* ------------------------------------------- DOM helpers (no re-render) */
  const hideHint = () => {
    if (guideRef.current) guideRef.current.hidden = true;
    clearTimeout(hint.current.timer);
  };
  const dismissHint = () => {
    hint.current.interacted = true;
    hideHint();
  };
  const resetHint = () => {
    hideHint();
    hint.current.shown = false;
  };

  /* ----------------------------------------------------- bag + note */
  // The bag opens while a piece is held (front handle flops forward, back one behind),
  // lifts and glows while the piece is over it — and the note narrates along
  const setMode = (next: Mode) => {
    const stage = stageRef.current;
    if (!stage || mode.current === next) return;
    mode.current = next;
    stage.dataset.mode = next;

    const look = held.current === null ? null : looks[held.current];
    if (noteRef.current) {
      noteRef.current.textContent = next === "bagging" ? `Opening ${look?.title ?? "the look"}` : NOTE[next];
    }
    if (subRef.current) subRef.current.textContent = look && next !== "idle" ? `${look.title} — ${look.category}` : NOTE_SUB;
    // the drop sequence takes the bag from here; with reduced motion it simply stays put
    if (next === "bagging" || hint.current.reduced) return;

    const q = gsap.utils.selector(stage);
    const open = next !== "idle";
    const over = next === "ready";
    const swing = open
      ? { duration: 0.5, ease: "power3.inOut", transformOrigin: "50% 100%", overwrite: "auto" as const }
      : { duration: 0.8, ease: "back.out(1.7)", transformOrigin: "50% 100%", overwrite: "auto" as const };
    gsap.to(q(".lookbook-bag__handle--front"), { scaleY: open ? -0.5 : 1, ...swing });
    gsap.to(q(".lookbook-bag__handle--back"), { scaleY: open ? -0.3 : 1, ...swing });
    gsap.to(q(".lookbook-bag"), { scale: over ? 1.04 : 1, y: over ? -6 : 0, duration: 0.5, ease: "power3.out", overwrite: "auto" });
    gsap.to(q(".lookbook-bag__glow"), { opacity: over ? 1 : open ? 0.35 : 0, duration: 0.4, overwrite: "auto" });
  };

  // Lets go of whatever is held (it falls where it is) and closes the bag again
  const release = () => {
    playground.current?.release();
    worldRef.current?.classList.remove("grabbing");
    held.current = null;
    setMode("idle");
  };

  // The piece lands: the bag gives under it and its handles stand back up
  const settleBag = () => {
    const q = gsap.utils.selector(stageRef);
    gsap.to(q(".lookbook-bag__handle"), { scaleY: 1, duration: 0.9, ease: "back.out(1.7)", overwrite: "auto" });
    gsap.to(q(".lookbook-bag__glow"), { opacity: 0, duration: 0.6, overwrite: "auto" });
    gsap
      .timeline()
      .to(q(".lookbook-bag"), { scaleX: 1.03, scaleY: 0.95, y: 0, duration: 0.12, ease: "power2.out", overwrite: "auto" })
      .to(q(".lookbook-bag"), { scaleX: 1, scaleY: 1, duration: 0.8, ease: "elastic.out(1, 0.4)" });
  };

  /* ------------------------------------------------- setup & measuring */
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    hint.current.reduced = reduced;
    const pg = new Playground({ reduced });
    playground.current = pg;    assets.current = looks.map((look) => loadGarmentAsset(look.rain));
    assets.current.forEach((p) => p.catch(() => { }));

    const measure = () => {
      const stage = stageRef.current;
      const name = nameRef.current;
      const front = bagRef.current;
      if (!stage || !name || !front) return;
      const W = Math.round(stage.clientWidth);
      const H = Math.round(stage.clientHeight);

      // Title: its widest line spans the stage between the gutters, the lines stay within ~58% of the height
      const pad = parseFloat(getComputedStyle(name).paddingLeft) || 16;
      let size = W * 0.2;
      name.style.fontSize = `${size}px`;
      const widest = Math.max(...Array.from(name.children, (s) => s.getBoundingClientRect().width));
      size *= (W - pad * 2) / widest;
      size = Math.min(size, (H * 0.58) / (name.children.length * 0.81));
      name.style.fontSize = `${size}px`;
      // Tall screens: centred in the space between the top bar and the note. Otherwise it starts
      // under the bar and the bag stands in front of its last line.
      const meta = metaRef.current;
      const note = noteBoxRef.current;
      if (meta && note) {
        const top = meta.offsetTop + meta.offsetHeight;
        const gap = note.offsetTop - top;
        name.style.top = name.offsetHeight < gap ? `${top + (gap - name.offsetHeight) / 2}px` : "";
      }

      // Bag: its layout box (offset*, so the hover lift never skews it) mapped through the artwork geometry
      const k = front.offsetWidth / BAG.width;
      const x = (u: number) => front.offsetLeft + u * k;
      const y = (v: number) => front.offsetTop + v * k;
      const box: BagBox = {
        left: x(BAG.left),
        right: x(BAG.right),
        top: y(BAG.top),
        innerLeft: x(BAG.left + 12),
        innerRight: x(BAG.right - 12),
        width: (BAG.right - BAG.left) * k,
        bottom: y(BAG.bottom),
        handleTop: y(BAG.handleTop),
      };
      bag.current = box;
      pg.resize(W, H, box.bottom, box);
    };

    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      measure();
      setNameReady(true);
    });

    let timer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (mode.current !== "bagging") release();
        hideHint();
        measure();
      }, 160);
    };
    window.addEventListener("resize", onResize);

    // Touch: only garments capture the finger, empty space still scrolls the page
    const world = worldRef.current!;
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      const r = world.getBoundingClientRect();
      if (pg.hitTest(t.clientX - r.left, t.clientY - r.top)) e.preventDefault();
    };
    world.addEventListener("touchstart", onTouchStart, { passive: false });

    return () => {
      cancelled = true;
      clearTimeout(timer);
      clearTimeout(navTimer.current);
      window.removeEventListener("resize", onResize);
      world.removeEventListener("touchstart", onTouchStart);
      pg.dispose();
    };
  }, []);

  /* ------------------------------------------------------------ rain */
  const rain = () => {
    if (mode.current === "bagging") return;
    resetHint();
    release();
    if (bagRef.current) bagRef.current.style.visibility = "";
    playground.current?.rain(RAIN_ORDER, (i) => assets.current[i]);
  };

  // Once the intro loader lifts: the title rises in, the bag settles onto the floor and stands its
  // handles up, then the garments fall either side of it
  useGSAP(
    () => {
      if (!nameReady || !isLoaded || started.current) return;
      started.current = true;
      stageRef.current?.classList.add("is-live");
      if (hint.current.reduced) return rain();
      gsap
        .timeline()
        // Words rise into their masks (same reveal as HomeCollection)
        .fromTo(".lookbook-hero__word", { yPercent: 100 }, { yPercent: 0, duration: 1.1, ease: "power4.out", stagger: 0.08 })
        .from(".lookbook-hero__reveal", { y: 16, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.08 }, 0.25)
        // (transform not cleared: a piece picked up mid-intro moves both bag copies, they must stay in step)
        .from(".lookbook-bag--full", { y: 48, opacity: 0, duration: 1.1, ease: "power3.out", clearProps: "opacity" }, 0.1)
        .from(".lookbook-bag__handle--back", { scaleY: 0, transformOrigin: "50% 100%", duration: 0.8, ease: "back.out(2)" }, 0.7)
        .from(".lookbook-bag__handle--front", { scaleY: 0, transformOrigin: "50% 100%", duration: 0.8, ease: "back.out(2)" }, 0.78)
        .add(rain, 0.9);
    },
    { dependencies: [nameReady, isLoaded], scope: stageRef },
  );

  /* ------------------------------------------------------ drop zone */
  const relPoint = (e: React.PointerEvent) => {
    const r = worldRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  // The bag, its handles and a little air around and above it
  const overBag = (p: { x: number; y: number }) => {
    const b = bag.current;
    if (!b) return false;
    const pad = b.width * 0.22;
    return p.x > b.left - pad && p.x < b.right + pad && p.y > b.handleTop - b.width * 0.45 && p.y < b.bottom;
  };

  // Carried over the mouth, dropped in, lands — then that look's page opens
  const dropInBag = (index: number) => {
    const pg = playground.current;
    const go = () => router.push(`/lookbook/${looks[index].slug}`);
    worldRef.current?.classList.remove("grabbing");
    setMode("bagging");
    const dropping =
      !!pg &&
      !pg.reduced &&
      pg.dropIntoBag({
        // from here the bag's front is drawn over the cloth, so the piece disappears inside
        onDrop: () => bagRef.current?.style.setProperty("visibility", "visible"),
        onLand: () => {
          settleBag();
          clearTimeout(navTimer.current);
          navTimer.current = window.setTimeout(go, NAV_DELAY_MS);
        },
      });
    if (!dropping) return go();
    navTimer.current = window.setTimeout(go, NAV_FALLBACK_MS);
  };

  /* ---------------------------------------------------------- pointer */
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dismissHint();
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const pg = playground.current;
    if (!pg || mode.current === "bagging") return;
    const p = relPoint(e);
    const fabric = pg.pick(p.x, p.y);
    pointerStart.current = { ...p, moved: false };
    if (!fabric) return;
    held.current = fabric.index;
    router.prefetch(`/lookbook/${looks[fabric.index].slug}`);
    worldRef.current!.setPointerCapture(e.pointerId);
    worldRef.current!.classList.add("grabbing");
    setMode(overBag(p) ? "ready" : "drag");
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const pg = playground.current;
    // Hand cursor only while hovering a piece that can be picked up
    if (pg && !pg.grab && e.pointerType === "mouse") {
      const { x, y } = relPoint(e);
      const hover = mode.current !== "bagging" && !!pg.hitTest(x, y);
      worldRef.current?.classList.toggle("can-grab", hover);
    }
    if (!pg || mode.current === "bagging" || (!pg.grab && !pointerStart.current)) return;
    const p = relPoint(e);
    const s = pointerStart.current;
    if (s && Math.hypot(p.x - s.x, p.y - s.y) > 7) s.moved = true;
    if (pg.grab) {
      pg.moveTo(p.x, p.y);
      setMode(overBag(p) ? "ready" : "drag");
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const pg = playground.current;
    if (!pg || mode.current === "bagging" || (!pg.grab && !pointerStart.current)) return;
    const p = relPoint(e);
    const index = pg.grab && pointerStart.current?.moved && overBag(p) ? pg.grab.fabric.index : null;
    pointerStart.current = null;
    if (index !== null) return dropInBag(index);
    release();
  };

  const onPointerCancel = () => {
    if (mode.current === "bagging") return;
    release();
    pointerStart.current = null;
  };

  /* ------------------------------------------------------ pickup hint */
  // Once the pile settles, a hand shows how to carry a piece over to the bag
  const updateHint = (time: number) => {
    const h = hint.current;
    const pg = playground.current;
    const guide = guideRef.current;
    const b = bag.current;
    if (!pg || !guide || !b) return;
    if (pg.grab) return hideHint();
    if (h.shown || h.interacted || h.reduced || window.scrollY > 25 || time - h.lastCheck < 300) return;
    h.lastCheck = time;
    if (pg.fabrics.length < looks.length || pg.active) return;

    let best: { f: Fabric; b: Bounds; d: number } | null = null;
    for (const f of pg.fabrics) {
      const fb = f.bounds();
      if (fb.bottom < 0 || fb.top > pg.H) continue;
      const d = Math.abs((fb.left + fb.right) / 2 - pg.W / 2);
      if (!best || d < best.d) best = { f, b: fb, d };
    }
    if (!best) return;
    const { f, b: fb } = best;
    const cx = (fb.left + fb.right) / 2;
    const cy = fb.top + (fb.bottom - fb.top) * 0.35;
    let origin: { x: number; y: number; d: number } | null = null;
    for (let i = 0; i < f.n; i++) {
      if (!f.solid[i]) continue;
      const x = f.x[i];
      const y = f.projectedY(i);
      const d = Math.hypot(x - cx, y - cy);
      if (!origin || d < origin.d) origin = { x, y, d };
    }
    if (!origin) return;

    // Arc up and over into the bag's mouth
    const tx = (b.innerLeft + b.innerRight) / 2;
    const ty = b.top - 6;
    const curve = `M ${origin.x} ${origin.y} Q ${(origin.x + tx) / 2} ${Math.min(origin.y, b.handleTop) - 48} ${tx} ${ty}`;

    const trail = guide.querySelector("svg")!;
    trail.setAttribute("viewBox", `0 0 ${pg.W} ${pg.H}`);
    trail.querySelector("path")!.setAttribute("d", curve);
    guide.querySelector<HTMLElement>(".lookbook-guide__hand")!.style.offsetPath = `path('${curve}')`;
    h.shown = true;
    guide.hidden = false;
    h.timer = window.setTimeout(hideHint, HINT_MS);
  };

  /* ------------------------------------------------------------ view */
  return (
    <>
      <section id="lookbook-hero" data-hero className="lookbook-hero relative bg-white pt-header">
        <div
          ref={stageRef}
          data-mode="idle"
          className="lookbook-hero__stage relative h-[calc(100svh-var(--spacing-header))] min-h-[32rem] overflow-hidden text-ink"
          // how tall the bag stands (handle tops to floor) per unit of its width — the note sits above it
          style={{ "--lookbook-bag-reach": (BAG.height - BAG.handleTop) / BAG.width } as React.CSSProperties}
        >
          {/* Title — set huge in the background, behind the bag */}
          <h1
            ref={nameRef}
            className={`lookbook-hero__name primary-font pointer-events-none absolute inset-x-0 top-[9%] z-0 m-0 px-(--spacing-gutter) text-center font-normal uppercase leading-[0.81] ${nameReady ? "ready" : ""
              }`}
          >
            {LOOKBOOK_TITLE.map((line) => (
              // One mask per line — the padding / negative margin pair keeps cap tops from being clipped by the tight leading
              <span key={line} className="mx-auto block w-max overflow-hidden pt-[0.08em] -mt-[0.08em]">
                <span className="lookbook-hero__word inline-block">{line}</span>
              </span>
            ))}
          </h1>

          {/* Season + shortcuts to the whole collection */}
          <div ref={metaRef} className="lookbook-hero__reveal pointer-events-none absolute inset-x-0 top-0 z-4">
            <div className="container flex items-center justify-between gap-6 pt-5">
              {/* Same scale as every section heading (global h2) */}
              <h2 className="primary-font font-normal uppercase leading-none text-deep">
                Lookbook <br /> Collection
              </h2>
              <div className="pointer-events-auto flex items-center gap-5">
                <Button href="/lookbook/all">View all {looks.length} looks</Button>
              </div>
            </div>
          </div>

          {/* The bag, standing on the floor in front of the title */}
          <LookbookBag className="z-1" />

          {/* WebGL cloth */}
          <div
            ref={worldRef}
            className="lookbook-world absolute inset-0 z-2"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
          >
            <Canvas
              flat
              dpr={[1, 2]}
              gl={{ antialias: true, alpha: true, premultipliedAlpha: true }}
              style={{ position: "absolute", inset: 0 }}
            >
              <GarmentLayer playground={playground} onFrame={updateHint} />
            </Canvas>
          </div>

          {/* The bag's front again, over the cloth — shown while a piece falls in, so it disappears inside */}
          <LookbookBag ref={bagRef} variant="front" className="z-3" />

          {/* Instruction above the bag — narrates the pick, the drop and the look being opened */}
          <div ref={noteBoxRef} className="lookbook-hero__note lookbook-hero__reveal pointer-events-none absolute inset-x-0 z-4 flex flex-col items-center gap-2 px-(--spacing-gutter) text-center">
            <p
              ref={noteRef}
              aria-live="polite"
              className="lookbook-hero__action primary-font text-[1.375rem] leading-tight text-deep max-md:text-lg"
            >
              {NOTE.idle}
            </p>
            <p ref={subRef} className="text-eyebrow text-muted">
              {NOTE_SUB}
            </p>
            <RiArrowDownLine size={14} className="mt-1 animate-nudge text-muted" />
          </div>

          {/* Pickup guide: dotted trail + a hand carrying a piece to the bag */}
          <div ref={guideRef} hidden aria-hidden="true" className="lookbook-guide pointer-events-none absolute inset-0 z-4 overflow-hidden">
            <svg className="lookbook-guide__trail absolute inset-0 h-full w-full" fill="none">
              <path stroke="currentColor" className="text-muted" strokeWidth="1" strokeDasharray="2 3" strokeLinecap="round" />
            </svg>
            <span className="lookbook-guide__hand absolute left-0 top-0 size-4 text-muted">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-full w-full"
              >
                <path d="M8 13V4a2 2 0 0 1 4 0v7M12 9a2 2 0 0 1 4 0v3M16 10a2 2 0 0 1 4 0v6c0 4-2 6-6 6h-2c-2 0-3-1-4-3l-4-6a2 2 0 0 1 3-2l1 2" />
              </svg>
            </span>
          </div>
        </div>
      </section>
    </>
  );
};

export default LookbookHero;
