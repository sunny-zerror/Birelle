"use client";

import { useEffect, useRef } from "react";
import { Link } from "next-view-transitions";
import { RiCloseLine } from "@remixicon/react";
import { useAuth } from "@/components/providers/AuthProvider";

const ease = "ease-[cubic-bezier(0.22,1,0.36,1)]";

// The site's main pages
const menu = [
  { label: "Home", href: "/" },
  { label: "Shop All", href: "/shop" },
  { label: "Lookbook", href: "/lookbook" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

// Account links ask signed-out visitors to sign in first
const secondary = [
  { label: "Wishlist", href: "/account/wishlist", auth: true },
  { label: "My Account", href: "/account", auth: true },
  { label: "Help & FAQ", href: "/faq", auth: false },
];

type Props = { isOpen: boolean; onClose: () => void };

const MenuDrawer = ({ isOpen, onClose }: Props) => {
  const { requireAuth } = useAuth();
  const closeRef = useRef<HTMLButtonElement>(null);

  // Lock page scroll, focus close, Escape closes
  useEffect(() => {
    if (!isOpen) return;

    window.lenis?.stop();
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  return (
    <div className={`menu-drawer fixed inset-0 z-100 overflow-hidden ${isOpen ? "" : "pointer-events-none"}`} inert={!isOpen}>
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close menu"
        tabIndex={-1}
        onClick={onClose}
        className={`absolute inset-0 cursor-default bg-black/40 backdrop-blur-sm transition-opacity duration-700 ${ease} ${
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
        <nav
          aria-label="Main"
          className="pointer-events-auto relative z-10 flex h-full w-full flex-col border-r border-line bg-white text-ink md:w-drawer"
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
              {menu.map((item, i) => (
                // The staggered entrance lives on the item, so its delay never holds up the link's hover fade
                <li
                  key={item.href}
                  className={`transition-[opacity,translate] duration-300 ${
                    isOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
                  }`}
                  style={{ transitionDelay: isOpen ? `${150 + i * 50}ms` : "0ms" }}
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="secondary-font flex w-full items-center justify-between py-2 text-left text-2xl transition-opacity duration-300 md:text-[1.75rem] group-hover/list:opacity-35 hover:opacity-100!"
                  >
                    <span className="link-line">{item.label}</span>
                  </Link>
                </li>
              ))}
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
                    <span className="link-line">{s.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default MenuDrawer;
