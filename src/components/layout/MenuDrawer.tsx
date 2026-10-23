"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "next-view-transitions";
import { RiArrowLeftLine, RiArrowRightLine, RiCloseLine } from "@remixicon/react";
import { products } from "@/data/products";
import { useAuth } from "@/components/providers/AuthProvider";
import type { Product } from "@/types";

const ease = "ease-[cubic-bezier(0.22,1,0.36,1)]";

type MenuItem = {
  key: string;
  label: string;
  href: string;
  // Items with products open a second panel instead of navigating
  items?: Product[];
};

const menu: MenuItem[] = [
  { key: "new", label: "New In", href: "/shop", items: products.filter((p) => p.isNew) },
  { key: "tees", label: "Tees", href: "/shop", items: products.filter((p) => p.category === "tees") },
  { key: "bottoms", label: "Bottoms", href: "/shop", items: products.filter((p) => p.category === "bottoms") },
  { key: "shorts", label: "Shorts", href: "/shop", items: products.filter((p) => p.category === "shorts") },
  { key: "all", label: "Shop All", href: "/shop" },
  { key: "about", label: "The House of Birelle", href: "/about" },
];

// Account links ask signed-out visitors to sign in first
const secondary = [
  { label: "Wishlist", href: "/account/wishlist", auth: true },
  { label: "My Account", href: "/account", auth: true },
  { label: "Can we help you?", href: "/contact", auth: false },
];

type Props = { isOpen: boolean; onClose: () => void };

const MenuDrawer = ({ isOpen, onClose }: Props) => {
  const { requireAuth } = useAuth();
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const active = menu.find((m) => m.key === activeKey && m.items);

  // Lock page scroll, focus close, Escape steps back a level then closes
  useEffect(() => {
    if (!isOpen) return;

    window.lenis?.stop();
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setActiveKey((key) => {
        if (key === null) onClose();
        return null;
      });
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  // Reset to the first level once the drawer has slid away
  useEffect(() => {
    if (isOpen) return;
    const t = setTimeout(() => setActiveKey(null), 700);
    return () => clearTimeout(t);
  }, [isOpen]);

  return (
    <div className={`menu-drawer fixed inset-0 z-100 overflow-hidden ${isOpen ? "" : "pointer-events-none"}`} inert={!isOpen}>
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close menu"
        tabIndex={-1}
        onClick={onClose}
        className={`absolute inset-0 cursor-default bg-white/30 backdrop-blur-md transition-opacity duration-700 ${ease} ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`absolute inset-y-0 left-0 flex w-full transition-transform duration-700 md:pointer-events-none md:w-auto ${ease} ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Level 1 */}
        <nav
          aria-label="Main"
          className="pointer-events-auto relative z-10 flex h-full w-full flex-col bg-white text-ink md:w-[30vw] md:min-w-96 md:max-w-120"
        >
          <div className="flex h-header shrink-0 items-center px-6 md:px-12">
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="group -ml-1 flex items-center gap-2 text-sm transition-opacity hover:opacity-60"
            >
              <RiCloseLine size={20} className="transition-transform duration-500 group-hover:rotate-90" />
              Close
            </button>
          </div>

          <div data-lenis-prevent className="flex flex-1 flex-col overflow-y-auto overscroll-contain px-6 pb-10 md:px-12">
            {/* Siblings dim while one is hovered */}
            <ul className="group/list mt-6 flex flex-col gap-1 md:mt-10">
              {menu.map((item, i) => {
                const selected = item.key === activeKey;
                const className = `secondary-font flex w-full items-center justify-between py-2 text-left text-2xl transition-[opacity,translate] duration-500 md:text-[1.75rem] ${ease} ${
                  activeKey && !selected ? "opacity-35" : ""
                } group-hover/list:opacity-35 hover:opacity-100! ${
                  isOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
                }`;
                const style = { transitionDelay: isOpen ? `${150 + i * 50}ms` : "0ms" };

                return (
                  <li key={item.key}>
                    {item.items ? (
                      <button
                        type="button"
                        aria-expanded={selected}
                        onClick={() => setActiveKey(selected ? null : item.key)}
                        className={className}
                        style={style}
                      >
                        <span className="relative">
                          {item.label}
                          <span
                            className={`absolute -bottom-0.5 left-0 h-px w-full origin-left bg-current transition-transform duration-500 ${ease} ${
                              selected ? "scale-x-100" : "scale-x-0"
                            }`}
                          />
                        </span>
                        <RiArrowRightLine size={18} className="md:hidden" />
                      </button>
                    ) : (
                      <Link href={item.href} onClick={onClose} className={className} style={style}>
                        {item.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>

            <ul className="mt-auto flex flex-col gap-3 border-t border-line pt-8 text-sm">
              {secondary.map((s) => (
                <li key={s.label}>
                  <Link
                    href={s.href}
                    onClick={(e) => {
                      onClose();
                      if (s.auth) requireAuth(s.href)(e);
                    }}
                    className="transition-opacity hover:opacity-60"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Level 2 — slides over on mobile, slides out beside level 1 on desktop.
            Hidden when not in use: on mobile its parked spot (one screen to the right) lands exactly
            on-screen once the closed drawer is shifted left, so it must not stay visible. */}
        <div
          aria-hidden={!active}
          inert={!active}
          className={`pointer-events-auto absolute inset-y-0 left-0 z-20 flex w-full flex-col bg-white text-ink transition-[translate,visibility] duration-700 md:relative md:z-0 md:w-[26vw] md:min-w-80 md:max-w-104 md:border-l md:border-line ${ease} ${
            active ? "visible" : "invisible"
          } ${
            // Rides along with the drawer while it is closed, so resetting never sweeps it across the screen
            active || !isOpen ? "translate-x-0" : "translate-x-full md:-translate-x-full"
          }`}
        >
          <div className="flex h-header shrink-0 items-center px-6 md:px-10">
            <button
              type="button"
              onClick={() => setActiveKey(null)}
              className="-ml-1 flex items-center gap-2 text-sm transition-opacity hover:opacity-60 md:hidden"
            >
              <RiArrowLeftLine size={18} />
              Back
            </button>
          </div>

          {active?.items && (
            <div
              key={active.key}
              data-lenis-prevent
              className="flex flex-1 animate-panel-in flex-col overflow-y-auto overscroll-contain px-6 pb-10 md:px-10"
            >
              <p className="secondary-font mt-6 text-2xl md:mt-10">{active.label}</p>

              <ul className="mt-8 flex flex-col gap-4 text-base">
                <li>
                  <Link href={active.href} onClick={onClose} className="underline underline-offset-4 transition-opacity hover:opacity-60">
                    View all
                  </Link>
                </li>
                {active.items.map((p) => (
                  <li key={p.id}>
                    <Link href={p.href} onClick={onClose} className="transition-opacity hover:opacity-60">
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>

              {active.items[0] && (
                <Link href={active.items[0].href} onClick={onClose} className="group mt-auto block pt-10">
                  <div className="aspect-4/5 overflow-hidden bg-neutral-100">
                    <img
                      src={active.items[0].image}
                      alt={active.items[0].title}
                      loading="lazy"
                      className={`cover transition-transform duration-1000 ${ease} group-hover:scale-105`}
                    />
                  </div>
                  <p className="mt-3 text-sm">{active.items[0].title}</p>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuDrawer;
