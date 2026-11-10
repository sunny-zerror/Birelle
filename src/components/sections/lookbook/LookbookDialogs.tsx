"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { RiArrowLeftLine } from "@remixicon/react";
import Button from "@/components/ui/Button";
import { LOOKBOOK_SEASON } from "@/data/lookbook";
import { useCatalog } from "@/components/providers/CatalogProvider";

gsap.registerPlugin(useGSAP);

// Fades in on mount; `close(after)` fades out, then runs `after` (default onClose).
// Pauses Lenis while open so the overlay scrolls natively.
const useDialog = (onClose: () => void) => {
  const root = useRef<HTMLDivElement>(null);
  const closing = useRef(false);

  useGSAP(() => {
    gsap.fromTo(root.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: "power2.out" });
    gsap.from(".lookbook-dialog__reveal", { y: 24, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.06, delay: 0.1 });
  }, { scope: root });

  const close = (after?: () => void) => {
    if (closing.current) return;
    closing.current = true;
    gsap.to(root.current, { autoAlpha: 0, duration: 0.25, ease: "power2.in", onComplete: after ?? onClose });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return { root, close };
};

type ShellProps = {
  ref: React.Ref<HTMLDivElement>;
  label: string;
  top: React.ReactNode;
  children: React.ReactNode;
};

// Full-screen white sheet over the header — hairline top bar, own scroll area
const Shell = ({ ref, label, top, children }: ShellProps) => (
  <div ref={ref} role="dialog" aria-modal="true" aria-label={label} className="lookbook-dialog fixed inset-0 z-100 flex flex-col bg-white text-ink">
    <div className="lookbook-dialog__top container flex min-h-(--spacing-header) items-center justify-between gap-4 border-b border-black/10">
      {top}
    </div>
    <div data-lenis-prevent className="lookbook-dialog__scroll scroller_none flex-1 overflow-y-auto overscroll-contain">
      {children}
    </div>
  </div>
);

const backClass = "text-cta inline-flex items-center gap-2";

type LookDialogProps = {
  index: number;
  origin: "playground" | "collection";
  onClose: () => void;
  onCollection: () => void;
};

export const LookDialog = ({ index, origin, onClose, onCollection }: LookDialogProps) => {
  const { looks } = useCatalog();
  const look = looks[index];
  const { root, close } = useDialog(onClose);

  return (
    <Shell
      ref={root}
      label={look.title}
      top={
        <>
          <button type="button" className={backClass} onClick={() => close()}>
            <RiArrowLeftLine size={16} />
            {origin === "collection" ? "Back" : "Back to playground"}
          </button>
          {origin !== "collection" && (
            <button type="button" className="text-cta" onClick={() => close(onCollection)}>
              Full collection
            </button>
          )}
        </>
      }
    >
      <article className="container grid gap-stack pb-section pt-stack md:grid-cols-[1.4fr_1fr] md:items-center">
        <div className="lookbook-dialog__reveal center aspect-4/5 bg-neutral-50 p-8 md:aspect-auto md:h-[calc(100svh-var(--spacing-header)-8rem)]">
          <img src={look.src} alt={`${look.title} artwork`} draggable={false} className="block h-full w-full object-contain" />
        </div>

        <div className="flex flex-col items-start">
          <p className="lookbook-dialog__reveal text-eyebrow text-muted">
            {look.season} — {look.category}
          </p>
          <h2 className="lookbook-dialog__reveal primary-font mt-4 font-normal uppercase leading-[0.95] text-deep md:text-[4.5rem]">
            {look.title}
          </h2>
          {look.story.map((p, i) => (
            <p key={i} className="lookbook-dialog__reveal mt-6 max-w-[28rem] text-sm leading-relaxed text-ink">
              {p}
            </p>
          ))}
          <div className="lookbook-dialog__reveal mt-10">
            <Button href="/shop">Shop the collection</Button>
          </div>
        </div>
      </article>
    </Shell>
  );
};

type CollectionDialogProps = {
  onClose: () => void;
  onOpen: (index: number) => void;
};

export const CollectionDialog = ({ onClose, onOpen }: CollectionDialogProps) => {
  const { looks } = useCatalog();
  const { root, close } = useDialog(onClose);

  return (
    <Shell
      ref={root}
      label="Full collection"
      top={
        <>
          <button type="button" className={backClass} onClick={() => close()}>
            <RiArrowLeftLine size={16} />
            Back to playground
          </button>
          <span className="text-sm text-muted">{looks.length} pieces</span>
        </>
      }
    >
      <div className="container pb-section">
        <header className="flex flex-col items-center py-stack text-center">
          <p className="lookbook-dialog__reveal text-eyebrow text-muted">{LOOKBOOK_SEASON}</p>
          <h2 className="lookbook-dialog__reveal primary-font mt-4 font-normal uppercase leading-[0.95] text-deep md:text-[4.5rem]">
            Full Collection
          </h2>
        </header>

        <ul className="grid grid-cols-2 gap-grid md:grid-cols-3 lg:grid-cols-4">
          {looks.map((look, i) => (
            <li key={look.id} className="lookbook-dialog__reveal">
              <button type="button" className="group block w-full text-left" onClick={() => close(() => onOpen(i))}>
                <figure className="center aspect-3/4 overflow-hidden bg-neutral-50 p-6">
                  <img
                    src={look.rain}
                    alt={look.title}
                    loading="lazy"
                    draggable={false}
                    className="h-full w-full object-contain transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                  />
                </figure>
                <span className="mt-card flex justify-between gap-2 text-sm">
                  <span className="text-ink">{look.title}</span>
                  <span className="text-muted">{look.category}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Shell>
  );
};
