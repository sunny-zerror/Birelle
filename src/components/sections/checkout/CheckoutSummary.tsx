"use client";

import { useState } from "react";
import { RiArrowDownSLine } from "@remixicon/react";
import { TextField } from "@/components/ui/form";
import type { CartLine } from "@/components/providers/CartProvider";

type CheckoutSummaryProps = {
  lines: CartLine[];
  subtotal: number;
  /** Mobile only — the summary collapses into a bar above the form */
  expanded: boolean;
  onToggle: () => void;
  ref?: React.Ref<HTMLElement>;
};

const money = (n: number) => `$${n.toFixed(2)}`;

const CheckoutSummary = ({ lines, subtotal, expanded, onToggle, ref }: CheckoutSummaryProps) => {
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");

  // No discount codes exist yet — every code is rejected until promotions are wired up
  const applyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError(code.trim() ? "This discount code isn't valid." : "Enter a discount code.");
  };

  return (
    <aside
      ref={ref}
      aria-label="Order summary"
      className="checkout-summary order-first scroll-mt-4 border-b max-md:pt-header md:order-none md:border-b-0 "
    >
      {/* Mobile toggle bar */}
      <button
        type="button"
        aria-expanded={expanded}
        onClick={onToggle}
        className="flex w-full items-center justify-between px-gutter py-4 text-sm text-ink md:hidden"
      >
        <span className="flex items-center gap-1">
          {expanded ? "Hide" : "Show"} order summary
          <RiArrowDownSLine size={16} className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
        </span>
        <span className="tabular-nums">{money(subtotal)}</span>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:block md:h-full ${
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden md:h-full md:overflow-visible">
          {/* Sticky so the order stays in view while the form scrolls */}
          <div className="px-gutter pb-8 pt-2 md:sticky md:top-0 md:px-14 md:pb-16 md:pt-32 lg:px-20">
            <div className="w-full max-w-[25rem] max-md:mx-auto">
              <ul className="flex flex-col gap-5">
                {lines.map((line) => (
                  <li key={line.key} className="flex items-start gap-4">
                    <div className="relative w-16 shrink-0">
                      <img src={line.product.image} alt="" className="aspect-3/4 w-full object-contain" />
                      <span
                        aria-label={`Quantity ${line.qty}`}
                        className="absolute -right-2 -top-2 center size-5 rounded-full bg-ink/70 text-[0.625rem] leading-none text-white"
                      >
                        {line.qty}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1">
                      <p className="primary-font text-[0.9375rem] leading-snug text-ink">{line.product.title}</p>
                      <p className="mt-1.5 text-xs text-muted">{line.size}</p>
                    </div>
                    <p className="pt-1 text-sm tabular-nums text-ink">{money(line.product.price * line.qty)}</p>
                  </li>
                ))}
              </ul>

              {/* Discount code */}
              <form onSubmit={applyCode} className="mt-8 flex items-start gap-2" noValidate>
                <TextField
                  variant="box"
                  label="Discount code"
                  name="discount"
                  autoComplete="off"
                  value={code}
                  onChange={(v) => {
                    setCode(v);
                    setCodeError("");
                  }}
                  error={codeError}
                  className="flex-1"
                />
                <button
                  type="submit"
                  className="h-12 shrink-0 border border-ink/30 bg-white px-5 text-sm text-ink transition-colors duration-300 hover:border-ink"
                >
                  Apply
                </button>
              </form>

              {/* Totals */}
              <dl className="mt-8 flex flex-col gap-3 text-sm text-ink">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd className="tabular-nums">{money(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Shipping</dt>
                  <dd className="uppercase">Free</dd>
                </div>
                <div className="mt-2 flex items-baseline justify-between border-t border-ink/15 pt-5">
                  <dt className="text-base">Total</dt>
                  <dd className="tabular-nums">
                    <span className="mr-1.5 text-xs text-muted">USD</span>
                    <span className="text-base">{money(subtotal)}</span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default CheckoutSummary;
