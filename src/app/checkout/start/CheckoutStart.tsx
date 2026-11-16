"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTransitionRouter } from "next-view-transitions";
import { useCheckoutStart } from "@zcom/storefront-kit/client";
import { getErrorMessage } from "@zcom/storefront-kit/core";
import NoticePage from "@/components/sections/notice/NoticePage";

// /checkout/start?products=<variantId>:<qty>,… (Meta's checkout link): adds the products to the bag,
// then opens checkout. Sold-out or archived ones are skipped.
const CheckoutStart = () => {
  const router = useTransitionRouter();
  const state = useCheckoutStart(useSearchParams().get("products"));

  useEffect(() => {
    if (state.status === "ready") router.replace("/checkout");
  }, [state, router]);

  if (state.status === "error") {
    return (
      <NoticePage eyebrow="Checkout" title="That link didn't work" action={{ href: "/shop", label: "Shop the collection" }}>
        <p>{getErrorMessage(state.error)}</p>
      </NoticePage>
    );
  }

  return (
    <NoticePage eyebrow="Checkout" title="One moment">
      <p>We&apos;re adding your pieces and opening checkout…</p>
    </NoticePage>
  );
};

export default CheckoutStart;
