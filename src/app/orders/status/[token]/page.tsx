import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { formatMoney, getShipmentStatusLabel } from "@zcom/storefront-kit/core";
import { getOrderStatus } from "@zcom/storefront-kit/server";
import NoticePage from "@/components/sections/notice/NoticePage";

// The order status page the store's order emails link to (kit 1.1.0): anyone with the link, signed in
// or not. Read on every visit; never indexed (the kit's proxy also sends noindex and no-referrer).
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your order", robots: { index: false, follow: false } };

type Params = { params: Promise<{ token: string }> };

export default async function Page({ params }: Params) {
  const { token } = await params;
  const order = await getOrderStatus(token);

  if (!order) {
    return (
      <NoticePage eyebrow="Order status" title="Link not found" action={{ href: "/contact", label: "Contact us" }}>
        <p>This order link isn&apos;t valid or has been replaced. Please check your latest email or contact us.</p>
      </NoticePage>
    );
  }

  const currency = order.currency ?? undefined;
  const shipment = order.shipment;
  // The store's own shipment status in shopper words (never the courier's wording)
  const status = order.isCancelled
    ? "Cancelled"
    : (getShipmentStatusLabel(shipment?.trackingStatus) ?? (order.paymentStatus === "PAID" ? "Confirmed" : "Processing"));
  const trackingUrl = shipment?.trackingUrl?.startsWith("https://") ? shipment.trackingUrl : null;

  return (
    <NoticePage eyebrow={order.orderNo ? `Order ${order.orderNo}` : "Your order"} title={status}>
      {shipment?.courierName && (
        <p>
          {shipment.courierName}
          {shipment.awbCode ? ` · AWB ${shipment.awbCode}` : ""}
        </p>
      )}
      {trackingUrl && (
        <p className="mt-2">
          <Link href={trackingUrl} target="_blank" rel="noopener noreferrer" className="text-forest underline underline-offset-4">
            Track your parcel
          </Link>
        </p>
      )}
      <ul className="mt-6 flex flex-col gap-2 border-y border-ink/15 py-5 text-left text-ink">
        {(order.lines ?? []).map((line, i) =>
          line ? (
            <li key={i} className="flex justify-between gap-4">
              <span>
                {line.name} × {line.quantity}
              </span>
              <span className="tabular-nums">{formatMoney((line.unitPrice ?? 0) * (line.quantity ?? 1), currency)}</span>
            </li>
          ) : null,
        )}
      </ul>
      <dl className="mt-5 flex flex-col gap-1 text-left">
        <div className="flex justify-between">
          <dt>Shipping</dt>
          <dd className="tabular-nums">{formatMoney(order.shipping ?? 0, currency)}</dd>
        </div>
        {order.discount ? (
          <div className="flex justify-between">
            <dt>Discount</dt>
            <dd className="tabular-nums">−{formatMoney(order.discount, currency)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between text-base text-ink">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatMoney(order.total, currency)}</dd>
        </div>
      </dl>
      {order.shippingAddress && (
        <p className="mt-6 text-left">
          <span className="text-ink">{order.shippingAddress.name}</span>
          <br />
          {order.shippingAddress.line}
          <br />
          {[order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.country].filter(Boolean).join(", ")}
        </p>
      )}
      {order.store?.email && (
        <p className="mt-6">
          Questions? Write to{" "}
          <Link href={`mailto:${order.store.email}`} target="_top" className="text-forest underline underline-offset-4">
            {order.store.email}
          </Link>
          .
        </p>
      )}
    </NoticePage>
  );
}
