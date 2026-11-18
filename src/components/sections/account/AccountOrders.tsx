"use client";

import { useId, useState } from "react";
import { Link } from "next-view-transitions";
import { RiArrowDownSLine } from "@remixicon/react";
import { useOrders } from "@/hooks/useOrders";
import { formatPrice } from "@/data/products";
import { formatDate } from "@/utils/date";
import type { Order } from "@/types";
import { AccountHeading, EmptyState, StatusBadge, ease } from "./ui";
import { ImageSkeleton } from "@/components/ui/skeleton";

const itemCount = (o: Order) => o.lines.reduce((n, l) => n + l.qty, 0);

const OrderCard = ({ order, index }: { order: Order; index: number }) => {
  const [open, setOpen] = useState(index === 0);
  const detailsId = useId();
  const count = itemCount(order);

  return (
    <li className="order-card animate-panel-in border border-line" style={{ animationDelay: `${index * 60}ms` }}>
      {/* Summary row */}
      <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="secondary-font text-sm uppercase tracking-wide text-ink">Order {order.number}</p>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-2 text-xs text-muted">
            Placed {formatDate(order.placedAt)} · {count} {count === 1 ? "item" : "items"} ·{" "}
            <span className="text-ink">{formatPrice(order.total)}</span>
          </p>
        </div>

        <div className="flex items-center justify-between gap-6 md:justify-end">
          <ul aria-hidden="true" className="flex -space-x-3">
            {order.lines.slice(0, 3).map((l) => (
              <li
                key={`${l.productId}-${l.size}-${l.colour}`}
                className="aspect-3/4 w-10 overflow-hidden border-2 border-white bg-neutral-100"
              >
                <ImageSkeleton className="size-full"><img src={l.image} alt="" loading="lazy" className="cover" /></ImageSkeleton>
              </li>
            ))}
          </ul>
          <button
            type="button"
            aria-expanded={open}
            aria-controls={detailsId}
            onClick={() => setOpen((o) => !o)}
            className="flex shrink-0 items-center gap-1.5 text-xs text-ink underline-offset-4 hover:underline"
          >
            {open ? "Hide details" : "View details"}
            <RiArrowDownSLine size={14} className={`transition-transform duration-500 ${ease} ${open ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Details — height eases open */}
      <div
        id={detailsId}
        inert={!open}
        className={`grid transition-[grid-template-rows] duration-500 ${ease} ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="border-t border-line p-6 md:p-8">
            <ul className="divide-y divide-line">
              {order.lines.map((l) => (
                <li key={`${l.productId}-${l.size}-${l.colour}`} className="flex gap-4 py-4 first:pt-0">
                  <Link href={l.href} className="block aspect-3/4 w-16 shrink-0 overflow-hidden bg-neutral-100 md:w-20">
                    <ImageSkeleton className="size-full"><img src={l.image} alt={l.title} loading="lazy" className="cover" /></ImageSkeleton>
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5 text-sm">
                    <div className="flex items-start justify-between gap-4">
                      <Link href={l.href} className="text-ink hover:opacity-60">
                        {l.title}
                      </Link>
                      <span className="shrink-0 tabular-nums text-ink">{formatPrice(l.price * l.qty)}</span>
                    </div>
                    <p className="text-xs text-muted">
                      {l.colour} · Size {l.size} · Qty {l.qty}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 grid gap-6 border-t border-line pt-6 text-sm sm:grid-cols-3">
              <div>
                <h3 className="secondary-font text-xs uppercase tracking-wide text-muted">Shipping to</h3>
                <address className="mt-2.5 not-italic leading-relaxed text-ink">
                  {order.shipTo.name}
                  <br />
                  {order.shipTo.line1}
                  {order.shipTo.line2 && `, ${order.shipTo.line2}`}
                  <br />
                  {order.shipTo.city} {order.shipTo.postalCode}, {order.shipTo.country}
                </address>
              </div>
              <div>
                <h3 className="secondary-font text-xs uppercase tracking-wide text-muted">Payment</h3>
                <p className="mt-2.5 text-ink">{order.payment}</p>
              </div>
              <dl className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <dt className="text-muted">Subtotal</dt>
                  <dd className="tabular-nums text-ink">{formatPrice(order.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Shipping</dt>
                  <dd className="text-ink">{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</dd>
                </div>
                <div className="mt-1 flex justify-between border-t border-line pt-3">
                  <dt className="text-ink">Total</dt>
                  <dd className="tabular-nums text-ink">{formatPrice(order.total)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

const AccountOrders = () => {
  const { orders } = useOrders();

  return (
    <div className="account-orders">
      <AccountHeading title="My Orders" description="Every order placed with your account, newest first." />

      {orders.length === 0 ? (
        <EmptyState title="No orders yet" text="When you place an order it will appear here, with its status and details." />
      ) : (
        <ul className="mt-8 flex flex-col gap-5 md:mt-10">
          {orders.map((order, i) => (
            <OrderCard key={order.number} order={order} index={i} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default AccountOrders;
