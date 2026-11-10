"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useTransitionRouter } from "next-view-transitions";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { RiRefreshLine } from "@remixicon/react";
import { useLoader } from "@/components/providers/LoaderProvider";
import { LOOKBOOK_SEASON, LOOKBOOK_TITLE } from "@/data/lookbook";
import { useCatalog } from "@/components/providers/CatalogProvider";
import { Playground, loadGarmentAsset, type Bounds, type Fabric, type GarmentAsset } from "@/lib/cloth";
import GarmentLayer from "./GarmentLayer";
import { CollectionDialog, LookDialog } from "./LookbookDialogs";
import "@/styles/lookbook.css";

gsap.registerPlugin(useGSAP);

const HINT_MS = 4800;
const NOTE_TEXT = "Pick up a piece to view the full look";
const DROP_PAD = 40; // px of forgiveness around the note when dropping

type Dialog =
  | { type: "look"; index: number; origin: "playground" | "collection" }
  | { type: "collection" }
  | null;

type Hint = { shown: boolean; interacted: boolean; lastCheck: number; timer: number; reduced: boolean };

// Interactive cloth lookbook — garments rain onto the title, get picked up and
// dropped on the note to open that look's page
const LookbookHero = () => {
  // Looks from the Zcom store (the designer's built-in looks until the store has some)
  const { looks } = useCatalog();
  const RAIN_ORDER = looks.map((_, i) => i);
  const { isLoaded } = useLoader();
  const router = useTransitionRouter();

  const stageRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const dropActionRef = useRef<HTMLParagraphElement>(null);
  const guideRef = useRef<HTMLDivElement>(null);

  const playground = useRef<Playground | null>(null);
  const assets = useRef<Promise<GarmentAsset>[]>([]);
  const pointerStart = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const dialogOpen = useRef(false);
  const started = useRef(false);
  const hint = useRef<Hint>({ shown: false, interacted: false, lastCheck: 0, timer: 0, reduced: false });

  const [nameReady, setNameReady] = useState(false);
  const [dialog, setDialog] = useState<Dialog>(null);

  /* ------------------------------------------- DOM helpers (no re-render) */
  const hideDrop = () => {
    dropRef.current?.classList.remove("visible", "ready");
    stageRef.current?.classList.remove("is-dragging");
    if (dropActionRef.current) dropActionRef.current.textContent = NOTE_TEXT;
  };

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

  /* ------------------------------------------------- setup & measuring */
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    hint.current.reduced = reduced;
    const pg = new Playground({ reduced });
    playground.current = pg;
    assets.current = looks.map((look) => loadGarmentAsset(look.rain));
    assets.current.forEach((p) => p.catch(() => { }));

    // Size the title so its widest line spans the stage, then put the floor on its baseline
    const measure = () => {
      const stage = stageRef.current;
      const name = nameRef.current;
      if (!stage || !name) return;
      const W = Math.round(stage.clientWidth);
      const H = Math.round(stage.clientHeight);
      const gutter = parseFloat(getComputedStyle(name).left) || 16;
      let size = W * 0.23;
      name.style.fontSize = `${size}px`;
      const widest = Math.max(...Array.from(name.children, (s) => s.getBoundingClientRect().width));
      size *= (W - gutter * 2) / widest;
      size = Math.min(size, (H * 0.5) / 1.62);
      name.style.fontSize = `${size}px`;

      const cs = getComputedStyle(name);
      const ctx = document.createElement("canvas").getContext("2d")!;
      ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const m = ctx.measureText((name.lastElementChild?.textContent ?? "").toUpperCase());
      const line = parseFloat(cs.lineHeight);
      const box = name.getBoundingClientRect();
      const baseline =
        box.bottom - line + (line - m.fontBoundingBoxAscent - m.fontBoundingBoxDescent) / 2 + m.fontBoundingBoxAscent;
      const surface = Math.min(H - 24, baseline + m.actualBoundingBoxDescent - stage.getBoundingClientRect().top);
      pg.resize(W, H, surface);
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
        pg.release();
        hideDrop();
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
      window.removeEventListener("resize", onResize);
      world.removeEventListener("touchstart", onTouchStart);
      pg.dispose();
    };
  }, []);

  /* ------------------------------------------------------------ rain */
  const rain = () => {
    resetHint();
    hideDrop();
    worldRef.current?.classList.remove("grabbing");
    playground.current?.rain(RAIN_ORDER, (i) => assets.current[i]);
  };

  // Once the intro loader lifts, the title rises in, then the garments start to fall
  useGSAP(
    () => {
      if (!nameReady || !isLoaded || started.current) return;
      started.current = true;
      if (hint.current.reduced) return rain();
      gsap.from(".lookbook-hero__reveal", { yPercent: 40, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.08 });
      // Words rise into their masks (same reveal as HomeCollection), then the garments fall onto them
      gsap.fromTo(
        ".lookbook-hero__word",
        { yPercent: 100 },
        { yPercent: 0, duration: 1.1, ease: "power4.out", stagger: 0.08, onComplete: rain },
      );
    },
    { dependencies: [nameReady, isLoaded], scope: stageRef },
  );

  /* ------------------------------------------------------- drop zone */
  const relPoint = (e: React.PointerEvent) => {
    const r = worldRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const overDrop = (p: { x: number; y: number }) => {
    const r = dropRef.current!.getBoundingClientRect();
    const c = worldRef.current!.getBoundingClientRect();
    return (
      p.x >= r.left - c.left - DROP_PAD &&
      p.x <= r.right - c.left + DROP_PAD &&
      p.y >= r.top - c.top - DROP_PAD &&
      p.y <= r.bottom - c.top + DROP_PAD
    );
  };

  const updateDrop = (p: { x: number; y: number }) => {
    const ready = overDrop(p);
    dropRef.current!.classList.toggle("ready", ready);
    dropActionRef.current!.textContent = ready ? "Release to view look" : "Drop here to view look";
  };

  const release = () => {
    playground.current?.release();
    hideDrop();
    worldRef.current?.classList.remove("grabbing");
  };

  /* ---------------------------------------------------------- pointer */
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dismissHint();
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const pg = playground.current;
    if (!pg || dialogOpen.current) return;
    const p = relPoint(e);
    const fabric = pg.pick(p.x, p.y);
    pointerStart.current = { ...p, moved: false };
    if (!fabric) return;
    worldRef.current!.setPointerCapture(e.pointerId);
    worldRef.current!.classList.add("grabbing");
    dropRef.current!.classList.add("visible");
    stageRef.current!.classList.add("is-dragging");
    updateDrop(p);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const pg = playground.current;
    if (!pg || (!pg.grab && !pointerStart.current)) return;
    const p = relPoint(e);
    const s = pointerStart.current;
    if (s && Math.hypot(p.x - s.x, p.y - s.y) > 7) s.moved = true;
    if (pg.grab) {
      pg.moveTo(p.x, p.y);
      updateDrop(p);
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const pg = playground.current;
    if (!pg || (!pg.grab && !pointerStart.current)) return;
    const p = relPoint(e);
    const index = pg.grab && pointerStart.current?.moved && overDrop(p) ? pg.grab.fabric.index : null;
    release();
    pointerStart.current = null;
    if (index !== null) router.push(`/lookbook/${looks[index].slug}`);
  };

  const onPointerCancel = () => {
    release();
    pointerStart.current = null;
  };

  /* ---------------------------------------------------------- dialogs */
  const openLook = (index: number, origin: "playground" | "collection" = "playground") =>
    setDialog({ type: "look", index, origin });
  const openCollection = () => setDialog({ type: "collection" });
  const closeDialog = () => setDialog(null);

  // While a sheet is open: freeze the cloth and the page scroll
  useEffect(() => {
    dialogOpen.current = !!dialog;
    if (playground.current) playground.current.paused = !!dialog;
    if (!dialog) return;
    hideHint();
    window.lenis?.stop();
    return () => window.lenis?.start();
  }, [dialog]);

  /* ------------------------------------------------------ pickup hint */
  // Once the pile settles, a hand shows how to carry a piece to the drop box
  const updateHint = (time: number) => {
    const h = hint.current;
    const pg = playground.current;
    const guide = guideRef.current;
    if (!pg || !guide) return;
    if (dialogOpen.current || pg.grab) return hideHint();
    if (h.shown || h.interacted || h.reduced || window.scrollY > 25 || time - h.lastCheck < 300) return;
    h.lastCheck = time;
    if (pg.fabrics.length < looks.length || pg.active) return;

    let best: { f: Fabric; b: Bounds; d: number } | null = null;
    for (const f of pg.fabrics) {
      const b = f.bounds();
      if (b.bottom < 0 || b.top > pg.H) continue;
      const d = Math.abs((b.left + b.right) / 2 - pg.W / 2);
      if (!best || d < best.d) best = { f, b, d };
    }
    if (!best) return;
    const { f, b } = best;
    const cx = (b.left + b.right) / 2;
    const cy = b.top + (b.bottom - b.top) * 0.35;
    let origin: { x: number; y: number; d: number } | null = null;
    for (let i = 0; i < f.n; i++) {
      if (!f.solid[i]) continue;
      const x = f.x[i];
      const y = f.projectedY(i);
      const d = Math.hypot(x - cx, y - cy);
      if (!origin || d < origin.d) origin = { x, y, d };
    }
    if (!origin) return;

    const frame = dropRef.current!.getBoundingClientRect();
    const box = stageRef.current!.getBoundingClientRect();
    const tx = frame.left + frame.width / 2 - box.left;
    const ty = frame.top + frame.height / 2 - box.top;
    const curve = `M ${origin.x} ${origin.y} Q ${(origin.x + tx) / 2 + 40} ${Math.min(origin.y, ty) - 32} ${tx} ${ty}`;

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
          className="lookbook-hero__stage relative h-[calc(100svh-var(--spacing-header))] min-h-[32rem] overflow-hidden text-ink"
        >


          {/* Instruction + replay — doubles as the drop target while a garment is held */}
          <div
            ref={dropRef}
            className="lookbook-hero__note lookbook-hero__reveal pointer-events-none absolute left-1/2 top-[30%] z-4 flex w-max max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4 text-center max-md:top-[40%]"
          >
            <div className="flex items-center gap-4">
              <p ref={dropActionRef} aria-live="polite" className="lookbook-hero__action primary-font text-lg leading-tight text-deep max-md:text-base">
                {NOTE_TEXT}
              </p>
            </div>
          </div>

          {/* Title — the floor the garments land on */}
          <h1
            ref={nameRef}
            className={`lookbook-hero__name  pointer-events-none absolute bottom-8 left-(--spacing-gutter) m-0 text-[15rem] font-normal uppercase leading-[0.81]  text-deep  max-md:bottom-5 ${nameReady ? "ready" : ""
              }`}
          >
            {LOOKBOOK_TITLE.map((line) => (
              // One mask per line — the padding / negative margin pair keeps cap tops from being clipped by the tight leading
              <span key={line} className="block w-max overflow-hidden pt-[0.08em] -mt-[0.08em]">
                <span className="lookbook-hero__word inline-block">{line}</span>
              </span>
            ))}
          </h1>

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

          {/* Pickup guide: dotted trail + a hand carrying a piece to the box */}
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

      {dialog?.type === "look" && (
        <LookDialog
          key={dialog.index}
          index={dialog.index}
          origin={dialog.origin}
          onClose={dialog.origin === "collection" ? openCollection : closeDialog}
          onCollection={openCollection}
        />
      )}
      {dialog?.type === "collection" && (
        <CollectionDialog onClose={closeDialog} onOpen={(i) => openLook(i, "collection")} />
      )}
    </>
  );
};

export default LookbookHero;
