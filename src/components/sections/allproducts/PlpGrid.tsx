"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "next-view-transitions";
import gsap from "gsap";
import { Flip } from "gsap/all";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { RiEqualizerLine } from "@remixicon/react";
import { SIZES, formatPrice } from "@/data/products";
import type { Product } from "@/types";
import { ImageSkeleton } from "@/components/ui/skeleton";
import { useCatalog } from "@/components/providers/CatalogProvider";
import { ONE_SIZE, isSizeAvailable } from "@/lib/zcom/adapters";

gsap.registerPlugin(Flip, ScrollTrigger, useGSAP);

// A store category slug, or "all"
type CategoryKey = string;

const sorts = [
  { key: "featured", label: "Featured" },
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
  { key: "name", label: "Name: A–Z" },
] as const;

type SortKey = (typeof sorts)[number]["key"];

// Every size the catalogue carries, in the usual order first
const sizesIn = (products: Product[]) => {
  const all = new Set(products.flatMap((p) => p.sizes ?? []).filter((s) => s !== ONE_SIZE));
  return [...SIZES.filter((s) => all.has(s)), ...[...all].filter((s) => !SIZES.includes(s))];
};

// In stock in at least one of the chosen sizes
const hasSize = (product: Product, selected: string[]) =>
  selected.length === 0 || selected.some((s) => product.sizes?.includes(s) && isSizeAvailable(product, s));

const ease = "ease-[cubic-bezier(0.22,1,0.36,1)]";

const sortProducts = (list: Product[], sort: SortKey) => {
  const sorted = [...list];
  if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
  if (sort === "name") sorted.sort((a, b) => a.title.localeCompare(b.title));
  return sorted;
};

const PlpGrid = () => {
  const { products, categories } = useCatalog();
  const sizes = sizesIn(products);
  const [category, setCategory] = useState<CategoryKey>("all");
  const [sort, setSort] = useState<SortKey>("featured");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLUListElement>(null);
  const pillRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const flipState = useRef<Flip.FlipState | null>(null);

  const ordered = sortProducts(products, sort);
  const visibleCount = ordered.filter((p) => (category === "all" || p.category === category) && hasSize(p, selectedSizes)).length;

  // Snapshot card positions before any change so Flip can animate from them
  const captureFlip = () => {
    if (!gridRef.current) return;
    flipState.current = Flip.getState(gridRef.current.querySelectorAll("[data-flip-id]"));
  };

  const changeCategory = (key: CategoryKey) => {
    if (key === category) return;
    captureFlip();
    setCategory(key);
  };

  const changeSort = (key: SortKey) => {
    if (key === sort) return;
    captureFlip();
    setSort(key);
  };

  const toggleSize = (size: string) =>
    setSelectedSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]));

  const clearFilters = () => {
    if (category !== "all" || sort !== "featured") captureFlip();
    setCategory("all");
    setSort("featured");
    setSelectedSizes([]);
  };

  // Cards glide to their new slots; entering ones rise in, leaving ones fade down
  useLayoutEffect(() => {
    if (!flipState.current) return;

    Flip.from(flipState.current, {
      duration: 0.8,
      ease: "power3.inOut",
      stagger: 0.03,
      absolute: true,
      onEnter: (els) =>
        gsap.fromTo(
          els,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.06, delay: 0.25 },
        ),
      onLeave: (els) => gsap.to(els, { opacity: 0, y: 20, duration: 0.35, ease: "power2.in" }),
      onComplete: () => ScrollTrigger.refresh(),
    });
    flipState.current = null;
  }, [category, sort]);

  // Black pill slides under the active category
  useLayoutEffect(() => {
    const measure = () => {
      const el = pillRefs.current[category];
      if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [category]);

  // First reveal as the grid scrolls into view
  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>(".plp-card");
      gsap.set(cards, { opacity: 0, y: 50 });
      ScrollTrigger.batch(cards, {
        start: "top 90%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.08 }),
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="plp-grid" className="plp-grid section bg-white">
      <div className="plp-grid__inner container">
        {/* Toolbar */}
        <div className="plp-toolbar flex flex-col gap-6 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center">
          <div className="flex items-baseline gap-3">
            <h1 className="h2 primary-font font-normal uppercase text-ink">Collection <br /> 2026</h1>
          </div>

          <div
            role="group"
            aria-label="Filter by category"
            className="scroller_none relative -mx-gutter flex gap-2 overflow-x-auto px-gutter md:mx-0 md:gap-3 md:overflow-visible md:px-0"
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute inset-y-0 bg-ink transition-[left,width] duration-600 ${ease}`}
              style={{ left: indicator.left, width: indicator.width }}
            />
            {categories.map(({ key, label }) => {
              const active = key === category;
              return (
                <button
                  key={key}
                  ref={(el) => {
                    pillRefs.current[key] = el;
                  }}
                  type="button"
                  aria-pressed={active}
                  onClick={() => changeCategory(key)}
                  className={`relative z-10 h-9 shrink-0 border px-6 text-sm transition-colors duration-500 md:min-w-24 ${
                    active ? "border-ink text-white" : "border-ink/40 text-ink hover:border-ink"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="md:justify-self-end">
            <button
              type="button"
              aria-expanded={filterOpen}
              aria-controls="plp-filter-panel"
              onClick={() => setFilterOpen((o) => !o)}
              className="group inline-flex items-center gap-2 text-xs uppercase tracking-wider text-ink"
            >
              {filterOpen ? "Close" : "Filter"}
              <RiEqualizerLine
                size={14}
                className={`transition-transform duration-500 ${ease} ${filterOpen ? "rotate-180" : "group-hover:rotate-90"}`}
              />
            </button>
          </div>
        </div>

        {/* Filter panel — height animates via grid rows */}
        <div
          id="plp-filter-panel"
          className={`grid transition-[grid-template-rows,opacity] duration-700 ${ease} ${
            filterOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden" inert={!filterOpen}>
            <div className="mt-8 grid gap-8 border-y border-line py-8 md:grid-cols-[2fr_1fr_auto] md:items-start">
              <fieldset>
                <legend className="text-xs uppercase tracking-wider text-muted">Sort by</legend>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
                  {sorts.map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      aria-pressed={sort === key}
                      onClick={() => changeSort(key)}
                      className="group relative pb-1 text-sm text-ink"
                    >
                      {label}
                      <span
                        aria-hidden="true"
                        className={`absolute inset-x-0 bottom-0 h-px origin-left bg-current transition-transform duration-500 ${ease} ${
                          sort === key ? "scale-x-100" : "scale-x-0 group-hover:scale-x-50"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-xs uppercase tracking-wider text-muted">Size</legend>
                <div className="mt-4 flex flex-wrap gap-2">
                  {sizes.map((size) => {
                    const on = selectedSizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleSize(size)}
                        className={`center size-9 border text-xs transition-colors duration-300 ${
                          on ? "border-ink bg-ink text-white" : "border-ink/30 text-ink hover:border-ink"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <button
                type="button"
                onClick={clearFilters}
                className="justify-self-start text-xs uppercase tracking-wider text-muted transition-colors hover:text-ink md:mt-8"
              >
                Clear all
              </button>
            </div>
          </div>
        </div>

        {/* Product grid */}
        <ul
          ref={gridRef}
          className="plp-grid__list relative mt-stack grid grid-cols-2 gap-x-4 gap-y-12 md:mt-20 md:grid-cols-4 md:gap-x-8 md:gap-y-20 min-h-[32rem]"
        >
          {ordered.map((product) => {
            const shown = (category === "all" || product.category === category) && hasSize(product, selectedSizes);
            return (
              <li
                key={product.id}
                data-flip-id={product.id}
                className={`plp-card ${shown ? "" : "hidden"}`}
              >
                <Link href={product.href} className="group block">
                  <ImageSkeleton className="relative aspect-3/4 center overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.title}
                      loading="lazy"
                      className={`w-[80%] transition-transform duration-1000 ${ease} group-hover:scale-105`}
                    />
                  </ImageSkeleton>
                  <div className="mt-4 text-center">
                    <h2 className="secondary-font text-xs uppercase tracking-wide text-ink">
                      <span className="bg-[linear-gradient(currentColor,currentColor)] bg-size-[0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-500 group-hover:bg-size-[100%_1px]">
                        {product.title}
                      </span>
                    </h2>
                    <p className="mt-1.5 text-xs text-ink">{formatPrice(product.price)}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default PlpGrid;
