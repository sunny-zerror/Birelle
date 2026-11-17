"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "next-view-transitions";
import { RiAddLine, RiArrowDownSLine, RiArrowLeftSLine, RiArrowRightSLine, RiCloseLine, RiSubtractLine } from "@remixicon/react";
import Button from "@/components/ui/Button";
import { useCart } from "@/components/providers/CartProvider";
import { formatPrice, getSizes } from "@/data/products";
import { useCatalog } from "@/components/providers/CatalogProvider";
import { ImageSkeleton } from "@/components/ui/skeleton";
import { siteConfig } from "@/config/site";
import type { Product } from "@/types";

const FREE_DELIVERY_FROM = siteConfig.shipping.freeOver;

const ease = "ease-[cubic-bezier(0.22,1,0.36,1)]";

type SuggestionProps = { product: Product; onAdd: (size: string) => void; onOpen: () => void };

// Recommendation card with its own size picker — two to a view (gap-4 between them)
const Suggestion = ({ product, onAdd, onOpen }: SuggestionProps) => {
  const sizes = getSizes(product);
  const [size, setSize] = useState(sizes.includes("M") ? "M" : sizes[0]);

  return (
    <li className="flex w-[calc((100%-1rem)/2)] shrink-0 snap-start flex-col">
      <Link href={product.href} onClick={onOpen} className="group block aspect-4/5 overflow-hidden bg-neutral-100">
        <ImageSkeleton className="size-full">
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          className={`size-full object-contain p-3 transition-transform duration-700 ${ease} group-hover:scale-105`}
        />
        </ImageSkeleton>
      </Link>

      <Link href={product.href} onClick={onOpen} className="mt-3 truncate text-sm text-ink">
        <span className="link-line">{product.title}</span>
      </Link>
      <p className="mt-1 text-sm tabular-nums text-muted">{formatPrice(product.price)}</p>

      {/* Size + add share one bordered bar */}
      <div className="mt-3 flex h-9">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Size for {product.title}</span>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="h-full w-full cursor-pointer appearance-none border border-r-0 border-ink/30 bg-white pl-3 pr-7 text-sm text-ink transition-colors focus:border-ink focus:outline-none"
          >
            {sizes.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <RiArrowDownSLine size={14} aria-hidden="true" className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ink" />
        </label>
        <button
          type="button"
          onClick={() => onAdd(size)}
          aria-label={`Add ${product.title}, size ${size}, to cart`}
          className="shrink-0 bg-deep px-4 text-sm text-white transition-colors duration-300 hover:bg-ink"
        >
          Add
        </button>
      </div>
    </li>
  );
};

// Horizontal row of suggestions: swipe on touch, arrows on desktop (the scrollbar is hidden)
const Suggestions = ({ products, onAdd, onOpen }: { products: Product[]; onAdd: (id: string, size: string) => void; onOpen: () => void }) => {
  const trackRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const updateEdges = () => {
    const el = trackRef.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 1, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1 });
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateEdges);
    ro.observe(el);
    return () => ro.disconnect();
  }, [products.length]);

  // One card (plus its gap) per click
  const step = (dir: 1 | -1) => {
    const el = trackRef.current;
    const card = el?.querySelector("li");
    if (el && card) el.scrollBy({ left: dir * (card.offsetWidth + 16), behavior: "smooth" });
  };

  const arrowClass =
    "center size-8 border border-ink/30 text-ink transition-[opacity,border-color] duration-300 hover:border-ink disabled:pointer-events-none disabled:opacity-30";

  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="secondary-font text-base font-medium text-ink">You may also like</h3>
        {products.length > 2 && (
          <div className="flex gap-2">
            <button type="button" aria-label="Previous suggestions" onClick={() => step(-1)} disabled={edges.start} className={arrowClass}>
              <RiArrowLeftSLine size={16} />
            </button>
            <button type="button" aria-label="Next suggestions" onClick={() => step(1)} disabled={edges.end} className={arrowClass}>
              <RiArrowRightSLine size={16} />
            </button>
          </div>
        )}
      </div>
      <ul ref={trackRef} onScroll={updateEdges} className="scroller_none mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain">
        {products.map((p) => (
          <Suggestion key={p.id} product={p} onAdd={(size) => onAdd(p.id, size)} onOpen={onOpen} />
        ))}
      </ul>
    </>
  );
};

const CartDrawer = () => {
  const { lines, count, subtotal, isOpen, close, add, setQty, remove } = useCart();
  const { products } = useCatalog();
  const closeRef = useRef<HTMLButtonElement>(null);

  // Lock page scroll, focus the close button, close on Escape
  useEffect(() => {
    if (!isOpen) return;

    window.lenis?.stop();
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);

    return () => {
      window.lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close]);

  const inCart = new Set(lines.map((l) => l.id));
  const suggestions = products.filter((p) => !inCart.has(p.id)).slice(0, 4);
  const remaining = Math.max(0, FREE_DELIVERY_FROM - subtotal);
  const progress = Math.min(1, subtotal / FREE_DELIVERY_FROM);

  return (
    <div className={`cart-drawer fixed inset-0 z-100 ${isOpen ? "" : "pointer-events-none"}`} inert={!isOpen}>
      {/* Backdrop — blurs the page behind */}
      <button
        type="button"
        aria-label="Close cart"
        tabIndex={-1}
        onClick={close}
        className={`absolute inset-0 cursor-default bg-black/40 backdrop-blur-sm transition-opacity duration-700 ${ease} ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Your cart"
        className={`absolute inset-y-0 right-0 flex w-full flex-col border-l border-line bg-white transition-transform duration-700 md:w-drawer ${ease} ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div data-lenis-prevent className="flex flex-1 flex-col overflow-y-auto *:shrink-0 overscroll-contain px-6 pb-10 pt-6 md:px-8">
          {/* Head */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="secondary-font text-2xl font-semibold text-ink">Your Cart</h2>
              <p className="mt-2 text-sm text-ink">
                {count} {count === 1 ? "item" : "items"}
              </p>
            </div>
            <button
              ref={closeRef}
              type="button"
              aria-label="Close cart"
              onClick={close}
              className="center size-8 text-ink transition-transform duration-500 hover:rotate-90"
            >
              <RiCloseLine size={22} />
            </button>
          </div>

          {/* Free-delivery meter */}
          <div className="mt-8">
            <p className="text-base text-ink">
              {remaining === 0
                ? "Your order will be shipped with free delivery"
                : `Spend ${formatPrice(remaining)} more for free delivery`}
            </p>
            <div className="mt-3 h-px w-full bg-line">
              <div
                className={`h-px origin-left bg-ink transition-transform duration-700 ${ease}`}
                style={{ transform: `scaleX(${progress})` }}
              />
            </div>
          </div>

          {/* Lines */}
          {lines.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <p className="primary-font text-xl text-deep">Your cart is empty</p>
              <Button href="/shop" className="mt-6">
                Shop the collection
              </Button>
            </div>
          ) : (
            <ul className="mt-6 divide-y divide-line">
              {lines.map((line) => (
                <li key={line.key} className="flex gap-5 py-6 animate-panel-in">
                  <Link
                    href={line.product.href}
                    onClick={close}
                    className="block aspect-3/4 w-24 shrink-0 overflow-hidden bg-neutral-100"
                  >
                    <ImageSkeleton className="size-full">
                      <img src={line.product.image} alt={line.product.title} className="cover" />
                    </ImageSkeleton>
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm font-medium text-ink">{line.product.title}</p>
                      <p className="shrink-0 text-sm text-ink">{formatPrice(line.product.price * line.qty)}</p>
                    </div>
                    <p className="mt-3 text-sm text-ink">Colour: {line.colour}</p>
                    <p className="mt-1.5 text-sm text-ink">Size: {line.size}</p>

                    <div className="mt-4 flex items-center gap-5">
                      <div className="flex h-7 items-center border border-ink/30">
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${line.product.title}`}
                          onClick={() => setQty(line.key, line.qty - 1)}
                          className="center h-full w-7 text-ink transition-opacity hover:opacity-60"
                        >
                          <RiSubtractLine size={12} />
                        </button>
                        <span aria-live="polite" className="w-6 text-center text-sm tabular-nums text-ink">
                          {line.qty}
                        </span>
                        <button
                          type="button"
                          aria-label={`Increase quantity of ${line.product.title}`}
                          onClick={() => setQty(line.key, line.qty + 1)}
                          className="center h-full w-7 text-ink transition-opacity hover:opacity-60"
                        >
                          <RiAddLine size={12} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(line.key)}
                        className="inline-flex items-center gap-1 text-sm text-ink transition-opacity hover:opacity-60"
                      >
                        <RiCloseLine size={13} /> Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Suggestions — pinned to the bottom of an empty cart, otherwise they follow the items */}
          {suggestions.length > 0 && (
            <div className={`border-t border-line pt-6 ${lines.length === 0 ? "mt-auto" : "mt-2"}`}>
              <Suggestions products={suggestions} onAdd={(id, size) => add(id, size)} onOpen={close} />
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-neutral-100 px-6 pb-6 pt-6 md:px-8">
          <div className="flex items-baseline justify-between text-ink">
            <span className="text-base">Subtotal</span>
            <span className="text-base tabular-nums">{formatPrice(subtotal)}</span>
          </div>
          <p className="mt-1 text-sm text-muted">Taxes and shipping calculated at checkout.</p>
          <Link
            href="/checkout"
            onClick={close}
            aria-disabled={lines.length === 0}
            tabIndex={lines.length === 0 ? -1 : undefined}
            className="mt-5 center h-12 w-full bg-deep text-sm text-white transition-colors duration-300 hover:bg-ink aria-disabled:pointer-events-none aria-disabled:opacity-40"
          >
            Securely checkout
          </Link>
        </div>
      </aside>
    </div>
  );
};

export default CartDrawer;
