"use client";

import { useEffect, useRef } from "react";
import { usePaymentLink } from "@zcom/storefront-kit/client";
import { formatMoney, getErrorMessage } from "@zcom/storefront-kit/core";
import type { GetPaymentRequestQuery } from "@zcom/storefront-kit/graphql";
import NoticePage from "@/components/sections/notice/NoticePage";

type Request = NonNullable<GetPaymentRequestQuery["getPaymentRequest"]>;

const CLOSED: Record<string, string> = {
  PAID: "This order is already paid. Thank you!",
  EXPIRED: "This payment link has expired. Please ask us for a new one.",
  CANCELLED: "This payment link was cancelled.",
  SUPERSEDED: "This link was replaced by a newer one. Please use the latest link we sent you.",
};

// Anonymous by design: no sign in, no bag, no analytics with order data
const PayLink = ({ token, request }: { token: string; request: Request }) => {
  const link = usePaymentLink(token);
  const confirmed = useRef(false);

  // Back from a redirect payment app with ?confirm=1: wait for the payment to settle
  useEffect(() => {
    if (confirmed.current) return;
    confirmed.current = true;
    if (new URLSearchParams(window.location.search).get("confirm") === "1") void link.confirm();
  }, [link]);

  if (link.state === "paid" || request.status === "PAID") {
    return (
      <NoticePage eyebrow={request.storeName ?? "Payment"} title="Thank you" action={{ href: "/", label: "Visit the shop" }}>
        <p>{link.state === "paid" ? "Your payment is confirmed." : CLOSED.PAID}</p>
      </NoticePage>
    );
  }

  if (request.status !== "ACTIVE") {
    return (
      <NoticePage eyebrow={request.storeName ?? "Payment"} title="Link closed" action={{ href: "/contact", label: "Contact us" }}>
        <p>{CLOSED[request.status] ?? "This payment link can't be used."}</p>
      </NoticePage>
    );
  }

  const busy = link.state === "paying" || link.state === "verifying" || link.state === "redirecting";

  return (
    <NoticePage eyebrow={request.orderNo ? `Order ${request.orderNo}` : "Payment"} title="Pay for your order">
      <ul className="mt-4 flex flex-col gap-2 border-y border-ink/15 py-5 text-left text-ink">
        {request.lines.map((line, i) => (
          <li key={i} className="flex justify-between gap-4">
            <span>
              {line.name}
              {line.variant ? <span className="text-muted"> · {line.variant}</span> : null} × {line.quantity}
            </span>
            <span className="tabular-nums">{formatMoney(line.lineTotal, request.currency)}</span>
          </li>
        ))}
        {request.moreLines > 0 && <li className="text-muted">and {request.moreLines} more</li>}
      </ul>
      <p className="mt-5 flex justify-between text-base text-ink">
        <span>Total</span>
        <span className="tabular-nums">{formatMoney(request.amount, request.currency)}</span>
      </p>
      {request.customerNote && <p className="mt-4 text-left">{request.customerNote}</p>}
      <button
        type="button"
        onClick={() => void link.pay()}
        disabled={busy}
        className="secondary-font mt-8 h-12 w-full bg-forest text-sm tracking-wide text-white transition-colors duration-500 hover:bg-ink disabled:cursor-wait disabled:opacity-70"
      >
        {busy ? "Confirming payment…" : "Pay securely"}
      </button>
      {link.state === "failed" && link.error && (
        <p className="mt-4 text-xs text-danger">
          {getErrorMessage({ graphQLErrors: [{ extensions: { reason: link.error } }] })}
        </p>
      )}
    </NoticePage>
  );
};

export default PayLink;
