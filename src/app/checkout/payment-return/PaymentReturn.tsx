"use client";

import { useEffect } from "react";
import { useTransitionRouter } from "next-view-transitions";
import { useAuth, usePaymentReturn } from "@zcom/storefront-kit/client";
import { orderStatusPath } from "@zcom/storefront-kit/core";
import NoticePage from "@/components/sections/notice/NoticePage";

// Back from a redirect payment app: verify, then show the order (or the payment link) again.
// A paid order (kit 1.1.0) has a status token: a guest goes to its order status page, where the
// order email also points; otherwise checkout's own thank-you screen.
const PaymentReturn = () => {
  const result = usePaymentReturn();
  const router = useTransitionRouter();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (!result) return;
    if (result.kind === "payment-link") {
      router.replace(`/pay/${result.token}${result.status === "FAILED" ? "" : "?confirm=1"}`);
    } else if (result.status === "paid" && !isLoggedIn && orderStatusPath(result.statusToken)) {
      router.replace(orderStatusPath(result.statusToken)!);
    } else if (result.orderId && result.status !== "failed") {
      router.replace(`/checkout?order=${result.orderId}`);
    }
  }, [result, router, isLoggedIn]);

  if (result?.kind === "order" && result.status === "failed") {
    return (
      <NoticePage eyebrow="Payment" title="Payment didn't go through" action={{ href: "/checkout", label: "Back to checkout" }}>
        <p>No money was taken. Your bag is saved — you can try again.</p>
      </NoticePage>
    );
  }

  return (
    <NoticePage eyebrow="Payment" title="One moment">
      <p>We&apos;re confirming your payment…</p>
    </NoticePage>
  );
};

export default PaymentReturn;
