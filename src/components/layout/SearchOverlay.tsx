"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "next-view-transitions";
import { RiCloseLine, RiSearchLine } from "@remixicon/react";
import { formatPrice, products } from "@/data/products";
import type { Product } from "@/types";

const ease = "ease-[cubic-bezier(0.22,1,0.36,1)]";

const trending = ["Tees", "Painted", "Trouser", "Shorts", "Black", "Script"];

const matches = (p: Product, q: string) =>
  [p.title, p.colour, p.category, p.description].some((field) => field.toLowerCase().includes(q));

const ResultCard = ({ product, onClose }: { product: Product; onClose: () => void }) => (
  <li className="animate-panel-in">
    <Link href={product.href} onClick={onClose} className="group block">
      <div className="aspect-3/4 overflow-hidden bg-neutral-100">
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          className={`cover transition-transform duration-1000 ${ease} group-hover:scale-105`}
        />
      </div>
      <p className="mt-3 truncate text-sm">{product.title}</p>
      <p className="mt-1 text-sm text-muted">{formatPrice(product.price)}</p>
    </Link>
  </li>
);

type Props = { isOpen: boolean; onClose: () => void };

const SearchOverlay = ({ isOpen, onClose }: Props) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Lock page scroll, focus the field, close on Escape
  useEffect(() => {
    if (!isOpen) return;

    window.lenis?.stop();
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);

    return () => {
      clearTimeout(t);
      window.lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  const q = query.trim().toLowerCase();
  const results = q ? products.filter((p) => matches(p, q)) : [];
  const newIn = products.filter((p) => p.isNew).slice(0, 4);

  return (
    <div className={`search-overlay fixed inset-0 z-100 ${isOpen ? "" : "pointer-events-none"}`} inert={!isOpen}>
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close search"
        tabIndex={-1}
        onClick={onClose}
        className={`absolute inset-0 cursor-default bg-white/30 backdrop-blur-md transition-opacity duration-700 ${ease} ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Panel drops from the top */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className={`absolute inset-x-0 top-0 flex max-h-dvh flex-col bg-white text-ink shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-transform duration-700 ${ease} ${
          isOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container flex h-header shrink-0 items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="group flex items-center gap-2 text-sm transition-opacity hover:opacity-60"
          >
            Close
            <RiCloseLine size={20} className="transition-transform duration-500 group-hover:rotate-90" />
          </button>
        </div>

        <div data-lenis-prevent className="overflow-y-auto overscroll-contain">
          <div className="container pb-12 md:pb-16">
            {/* Field */}
            <form
              role="search"
              onSubmit={(e) => e.preventDefault()}
              className={`mx-auto max-w-3xl transition-[opacity,translate] delay-200 duration-700 ${ease} ${
                isOpen ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
              }`}
            >
              <label className="flex items-center gap-4 border-b border-ink pb-3">
                <RiSearchLine size={22} className="shrink-0" />
                <span className="sr-only">Search products</span>
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for “tees”"
                  className="secondary-font min-w-0 flex-1 bg-transparent text-xl outline-none placeholder:text-muted md:text-3xl [&::-webkit-search-cancel-button]:hidden"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      inputRef.current?.focus();
                    }}
                    className="shrink-0 text-sm underline underline-offset-4 transition-opacity hover:opacity-60"
                  >
                    Clear
                  </button>
                )}
              </label>
            </form>

            {q ? (
              <div className="mt-10 md:mt-14">
                <p aria-live="polite" className="text-sm text-muted">
                  {results.length} {results.length === 1 ? "result" : "results"} for “{query.trim()}”
                </p>
                {results.length > 0 ? (
                  <ul className="mt-6 grid grid-cols-2 gap-x-grid gap-y-8 md:grid-cols-4 lg:grid-cols-6">
                    {results.map((p) => (
                      <ResultCard key={p.id} product={p} onClose={onClose} />
                    ))}
                  </ul>
                ) : (
                  <div className="py-12 text-center">
                    <p className="primary-font text-xl text-deep">Nothing matches your search</p>
                    <p className="mt-2 text-sm text-muted">Try another word, or browse a trending search below.</p>
                    <ul className="mt-6 flex flex-wrap justify-center gap-2">
                      {trending.map((t) => (
                        <li key={t}>
                          <button
                            type="button"
                            onClick={() => setQuery(t)}
                            className="h-9  border border-ink/20 px-4 text-sm transition-colors duration-300 hover:border-ink"
                          >
                            {t}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div
                className={`mt-10 grid gap-10 transition-opacity delay-300 duration-700 md:mt-14 md:grid-cols-[1fr_2fr] md:gap-16 ${
                  isOpen ? "opacity-100" : "opacity-0"
                }`}
              >
                <div>
                  <p className="text-sm text-muted">Trending searches</p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {trending.map((t) => (
                      <li key={t}>
                        <button
                          type="button"
                          onClick={() => setQuery(t)}
                          className="h-9  border border-ink/20 px-4 text-sm transition-colors duration-300 hover:border-ink"
                        >
                          {t}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="flex items-baseline justify-between">
                    <p className="text-sm text-muted">New in</p>
                    <Link href="/shop" onClick={onClose} className="text-sm underline underline-offset-4 transition-opacity hover:opacity-60">
                      View all
                    </Link>
                  </div>
                  <ul className="mt-5 grid grid-cols-2 gap-x-grid gap-y-8 md:grid-cols-4">
                    {newIn.map((p) => (
                      <ResultCard key={p.id} product={p} onClose={onClose} />
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
