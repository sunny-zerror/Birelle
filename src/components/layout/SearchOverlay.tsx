"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Link } from "next-view-transitions";
import { RiAddLine, RiArrowLeftLine, RiArrowRightLine, RiCloseLine, RiHistoryLine, RiSearchLine } from "@remixicon/react";
import { formatPrice } from "@/data/products";
import { useCatalog } from "@/components/providers/CatalogProvider";
import { ImageSkeleton } from "@/components/ui/skeleton";
import type { Product } from "@/types";

const ease = "ease-[cubic-bezier(0.22,1,0.36,1)]";

// Quick-search tags at the top of the left column
const tags = ["Tees", "Painted", "Trouser", "Shorts", "Black", "Script"];

const help = [
  { label: "Delivery & returns", href: "/faq#delivery" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact us", href: "/contact" },
];

// Recent searches live in this browser only (localStorage), shared with every open tab
const RECENT_KEY = "birelle:recent-searches";
const RECENT_MAX = 5;
const recentListeners = new Set<() => void>();
const readRecent = () => {
  try {
    return localStorage.getItem(RECENT_KEY) ?? "[]";
  } catch {
    return "[]";
  }
};
const writeRecent = (list: string[]) => {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {}
  recentListeners.forEach((cb) => cb());
};
const subscribeRecent = (cb: () => void) => {
  recentListeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    recentListeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
};
const parseRecent = (raw: string): string[] => {
  try {
    const list: unknown = JSON.parse(raw);
    return Array.isArray(list) ? list.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
};

const chipClass = "h-9 border px-4 text-sm transition-colors duration-300";

const matches = (p: Product, q: string) =>
  [p.title, p.colour, p.category, p.description].some((field) => field.toLowerCase().includes(q));

const ResultCard = ({ product, onOpen }: { product: Product; onOpen: () => void }) => (
  <li className="animate-panel-in snap-start">
    <Link href={product.href} onClick={onOpen} className="group block">
      <ImageSkeleton className="aspect-3/4 overflow-hidden bg-neutral-100">
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          className={`size-full object-contain p-4 transition-transform duration-1000 ${ease} group-hover:scale-105`}
        />
      </ImageSkeleton>
      <p className="mt-3 truncate text-sm">
        <span className="link-line">{product.title}</span>
      </p>
      <p className="mt-1 text-sm text-muted">{formatPrice(product.price)}</p>
    </Link>
  </li>
);

type Props = { isOpen: boolean; onClose: () => void };

const SearchOverlay = ({ isOpen, onClose }: Props) => {
  const { products, categories } = useCatalog();
  const [query, setQuery] = useState("");
  const recentRaw = useSyncExternalStore(subscribeRecent, readRecent, () => "[]");
  const recent = useMemo(() => parseRecent(recentRaw), [recentRaw]);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLUListElement>(null);
  // Which left-hand row is expanded, and which of its groups fills the right-hand side ("row:group")
  const [openRow, setOpenRow] = useState<string | null>(null);
  const [browseId, setBrowseId] = useState<string | null>(null);

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
  const newIn = products.filter((p) => p.isNew);
  // The two browse rows — each group lists its products on the right when picked
  const rows = [
    {
      key: "collection",
      title: "Collection",
      groups: [
        { key: "new", label: "New In", items: newIn },
        { key: "all", label: "All Pieces", items: products },
      ],
    },
    {
      key: "categories",
      title: "Categories",
      groups: categories
        .filter((c) => c.key !== "all")
        .map((c) => ({ key: c.key, label: c.label, items: products.filter((p) => p.category === c.key) })),
    },
  ]
    .map((row) => ({ ...row, groups: row.groups.filter((g) => g.items.length > 0) }))
    .filter((row) => row.groups.length > 0);
  const browsed = rows.flatMap((row) => row.groups.map((g) => ({ ...g, id: `${row.key}:${g.key}` }))).find((g) => g.id === browseId);

  // Right-hand side: search results win, then the picked group, then the newest pieces
  const shown = q ? results : browsed ? browsed.items : newIn;

  // Arrows move the product row one screenful at a time
  const slide = (dir: 1 | -1) => {
    const rail = railRef.current;
    rail?.scrollBy({ left: dir * rail.clientWidth, behavior: "smooth" });
  };

  const browse = (id: string) => {
    setQuery("");
    setBrowseId(id);
    scrollerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Remember what was searched once it led somewhere (a submit or a product opened)
  const remember = () => {
    const term = query.trim();
    if (!term) return;
    writeRecent([term, ...recent.filter((r) => r.toLowerCase() !== term.toLowerCase())].slice(0, RECENT_MAX));
  };
  const openProduct = () => {
    remember();
    onClose();
  };

  return (
    <div className={`search-overlay fixed inset-0 z-100 ${isOpen ? "" : "pointer-events-none"}`} inert={!isOpen}>
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close search"
        tabIndex={-1}
        onClick={onClose}
        className={`absolute inset-0 cursor-default bg-black/40 backdrop-blur-sm transition-opacity duration-700 ${ease} ${
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

        <div ref={scrollerRef} data-lenis-prevent className="overflow-y-auto overscroll-contain">
          <div className="container pb-12 md:pb-16">
            {/* Field */}
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                remember();
              }}
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

            {/* Two columns at all times: browse on the left, products on the right */}
            <div
              className={`mt-10 grid gap-10 transition-opacity delay-300 duration-700 md:mt-14 md:grid-cols-[1fr_2fr] md:gap-16 ${
                isOpen ? "opacity-100" : "opacity-0"
              }`}
            >
              {/* On mobile the results take the whole panel while searching */}
              <aside className={`flex-col gap-10 md:flex ${q ? "hidden" : "flex"}`}>
                <section>
                  <h2 className="text-sm text-muted">Popular</h2>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {tags.map((t) => (
                      <li key={t}>
                        <button
                          type="button"
                          aria-pressed={q === t.toLowerCase()}
                          onClick={() => setQuery(t)}
                          className={`${chipClass} ${
                            q === t.toLowerCase() ? "border-ink bg-ink text-white" : "border-ink/20 hover:border-ink"
                          }`}
                        >
                          {t}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Collection / Categories — a row opens on hover (or tap), its groups show their products on the right */}
                {rows.length > 0 && (
                  <ul className="divide-y divide-line border-y border-line">
                    {rows.map((row) => {
                      const open = openRow === row.key;
                      return (
                        <li key={row.key} onMouseEnter={() => setOpenRow(row.key)}>
                          <button
                            type="button"
                            aria-expanded={open}
                            aria-controls={`search-row-${row.key}`}
                            onClick={() => setOpenRow(row.key)}
                            onFocus={() => setOpenRow(row.key)}
                            className="flex w-full items-center justify-between py-3.5 text-left"
                          >
                            <span className="secondary-font text-lg">{row.title}</span>
                            <RiAddLine
                              size={18}
                              aria-hidden="true"
                              className={`text-muted transition-transform duration-500 ${ease} ${open ? "rotate-45" : ""}`}
                            />
                          </button>
                          <div
                            id={`search-row-${row.key}`}
                            className={`grid transition-[grid-template-rows,opacity] duration-500 ${ease} ${
                              open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                            }`}
                          >
                            <div className="overflow-hidden" inert={!open}>
                              <ul className="flex flex-col pb-4">
                                {row.groups.map((g) => {
                                  const id = `${row.key}:${g.key}`;
                                  const active = !q && browseId === id;
                                  return (
                                    <li key={g.key}>
                                      <button
                                        type="button"
                                        aria-pressed={active}
                                        onClick={() => browse(id)}
                                        className="flex w-full items-center justify-between py-1.5 text-left text-sm"
                                      >
                                        <span className="link-line" data-active={active || undefined}>
                                          {g.label}
                                        </span>
                                        <span className="tabular-nums text-muted">{g.items.length}</span>
                                      </button>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {recent.length > 0 && (
                  <section>
                    <div className="flex items-baseline justify-between">
                      <h2 className="text-sm text-muted">Recent searches</h2>
                      <button
                        type="button"
                        onClick={() => writeRecent([])}
                        className="text-xs text-muted transition-colors hover:text-ink"
                      >
                        Clear
                      </button>
                    </div>
                    <ul className="mt-3 flex flex-col">
                      {recent.map((r) => (
                        <li key={r}>
                          <button
                            type="button"
                            onClick={() => setQuery(r)}
                            className="flex w-full items-center gap-3 py-1.5 text-left text-sm"
                          >
                            <RiHistoryLine size={15} aria-hidden="true" className="shrink-0 text-muted" />
                            <span className="link-line truncate">{r}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                <section>
                  <h2 className="text-sm text-muted">Need help?</h2>
                  <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                    {help.map((h) => (
                      <li key={h.href}>
                        <Link href={h.href} onClick={onClose}>
                          <span className="link-line">{h.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              </aside>

              {/* A picked group jumps above the browse column on mobile, where it would otherwise sit out of sight */}
              <div className={browsed && !q ? "order-first md:order-none" : ""}>
                <div className="flex h-5 items-center justify-between gap-6">
                  <h2 aria-live="polite" className="text-sm text-muted">
                    {q
                      ? `${results.length} ${results.length === 1 ? "result" : "results"} for “${query.trim()}”`
                      : browsed
                        ? browsed.label
                        : "New in"}
                  </h2>
                  <div className="flex shrink-0 items-center gap-5">
                    {/* Only when there is more than one screenful: 2 cards on mobile, 4 on desktop */}
                    <div className={`items-center gap-1 ${shown.length > 4 ? "flex" : shown.length > 2 ? "flex md:hidden" : "hidden"}`}>
                      <button
                        type="button"
                        aria-label="Previous products"
                        onClick={() => slide(-1)}
                        className="center size-8 border border-ink/20 transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-white"
                      >
                        <RiArrowLeftLine size={16} />
                      </button>
                      <button
                        type="button"
                        aria-label="Next products"
                        onClick={() => slide(1)}
                        className="center size-8 border border-ink/20 transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-white"
                      >
                        <RiArrowRightLine size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                {shown.length > 0 ? (
                  // One row that scrolls sideways — swipe, or use the arrows; a new group starts back at the first card
                  <ul
                    key={q ? "search" : (browseId ?? "new")}
                    ref={railRef}
                    className="scroller_none mt-3 grid snap-x snap-mandatory grid-flow-col auto-cols-[calc((100%-var(--spacing-grid))/2)] gap-x-grid overflow-x-auto overscroll-x-contain pb-1 md:auto-cols-[calc((100%-3*var(--spacing-grid))/4)]"
                  >
                    {shown.map((p) => (
                      <ResultCard key={p.id} product={p} onOpen={openProduct} />
                    ))}
                  </ul>
                ) : (
                  <div className="py-12 text-center">
                    <p className="primary-font text-xl text-deep">Nothing matches your search</p>
                    <p className="mt-2 text-sm text-muted">Try another word, or pick a tag, collection or category.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
