"use client";

import { useEffect, useState } from "react";
import { Link } from "next-view-transitions";
import { RiArrowDownSLine } from "@remixicon/react";
import { scrollToSection } from "@/lib/scroll";

type TocItem = { id: string; title: string };

const ease = "ease-[cubic-bezier(0.22,1,0.36,1)]";

// Desktop: sticky list that follows the section being read. Mobile: a collapsible "On this page".
const LegalToc = ({ items }: { items: TocItem[] }) => {
  const [active, setActive] = useState(items[0]?.id);
  const [open, setOpen] = useState(false);

  // The section whose heading most recently crossed the top third of the screen
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: "0px 0px -66% 0px" },
    );
    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  const list = (
    <ol className="flex flex-col">
      {items.map(({ id, title }, i) => (
        <li key={id}>
          <Link
            href={`#${id}`}
            scroll={false}
            onClick={(e) => {
              setOpen(false);
              scrollToSection(e, id);
            }}
            aria-current={active === id ? "location" : undefined}
            className={`flex gap-3 border-l py-2 pl-4 text-sm transition-colors duration-300 lg:-ml-px ${
              active === id ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            <span className="w-5 shrink-0 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
            {title}
          </Link>
        </li>
      ))}
    </ol>
  );

  return (
    <nav aria-label="On this page" className="legal-toc">
      {/* Mobile */}
      <div className="border-y border-line lg:hidden">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex h-12 w-full items-center justify-between text-sm text-ink"
        >
          On this page
          <RiArrowDownSLine size={16} className={`transition-transform duration-500 ${ease} ${open ? "rotate-180" : ""}`} />
        </button>
        <div className={`grid transition-[grid-template-rows] duration-500 ${ease} ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <div className="min-h-0 overflow-hidden" inert={!open}>
            <div className="pb-4">{list}</div>
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden lg:block">
        <p className="secondary-font mb-4 text-xs uppercase tracking-wide text-muted">On this page</p>
        <div className="border-l border-line">{list}</div>
      </div>
    </nav>
  );
};

export default LegalToc;
