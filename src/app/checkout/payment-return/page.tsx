import type { Metadata } from "next";
import PaymentReturn from "./PaymentReturn";

export const metadata: Metadata = { title: "Confirming payment", robots: { index: false, follow: false } };

export default function Page() {
  return <PaymentReturn />;
}
