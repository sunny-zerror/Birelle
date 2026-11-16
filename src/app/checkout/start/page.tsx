import type { Metadata } from "next";
import { Suspense } from "react";
import CheckoutStart from "./CheckoutStart";

export const metadata: Metadata = { title: "Checkout", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <Suspense>
      <CheckoutStart />
    </Suspense>
  );
}
