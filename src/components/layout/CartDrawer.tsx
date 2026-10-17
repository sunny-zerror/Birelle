"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "next-view-transitions";
import { RiAddLine, RiArrowDownSLine, RiCloseLine, RiSubtractLine } from "@remixicon/react";
import Button from "@/components/ui/Button";
import { useCart } from "@/components/providers/CartProvider";
import { SIZES, formatPrice, products } from "@/data/products";
import type { Product } from "@/types";

const FREE_DELIVERY_FROM = 250;

const ease = "ease-[cubic-bezier(0.22,1,0.36,1)]";

// Recommendation card with its own size picker — sized so 1.5 cards show (one card + gap-8 + half a card = 100%)
const Suggestion = ({ product, onAdd }: { product: Product; onAdd: (size: string) => void }) => {
  const [size, setSize] = useState("M");

  return (
    <li className="flex w-[calc((100%-2rem)/1.5)] shrink-0 snap-start gap-4">
      <Link href={product.href} className="block aspect-3/4 w-20 shrink-0 overflow-hidden bg-white">
        <img src={product.image} alt={product.title} className="cover" loading="lazy" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="truncate text-sm text-ink">{product.title}</p>
        <p className="mt-1 text-sm text-ink">{formatPrice(product.price)}</p>
        <div className="mt-auto flex gap-2 pt-3">
          <label className="relative flex-1">
            <span className="sr-only">Size for {product.title}</span>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="h-8 w-full appearance-none border border-ink/30 bg-white pl-2 pr-6 text-sm text-ink focus:border-ink focus:outline-none"
            >
              {SIZES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <RiArrowDownSLine size={14} className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2" />
          </label>
          <button
            type="button"
            onClick={() => onAdd(size)}
            className="h-8 bg-deep px-4 text-sm text-white transition-colors duration-300 hover:bg-ink"
          >
            Add
          </button>
        </div>
      </div>
    </li>
  );
};

const CartDrawer = () => {
  const { lines, count, subtotal, isOpen, close, add, setQty, remove } = useCart();
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
        className={`absolute inset-0 cursor-default bg-white/30 backdrop-blur-md transition-opacity duration-700 ${ease} ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Your cart"
        className={`absolute inset-y-0 right-0 flex w-full flex-col bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.08)] transition-transform duration-700 md:w-[46vw] md:max-w-152 ${ease} ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain px-6 pb-10 pt-6 md:px-8">
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
                    <img src={line.product.image} alt={line.product.title} className="cover" />
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

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="mt-6">
              <h3 className="secondary-font text-base font-medium text-ink">You may also like</h3>
              <ul className="scroller_none  mt-6 flex snap-x gap-8 overflow-x-auto px-6  md:px-8">
                {suggestions.map((p) => (
                  <Suggestion key={p.id} product={p} onAdd={(size) => add(p.id, size)} />
                ))}
              </ul>
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
