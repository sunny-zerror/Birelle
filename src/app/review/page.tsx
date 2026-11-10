import type { Metadata } from "next";
import ReviewOrder from "./ReviewOrder";

export const metadata: Metadata = { title: "Review your order", robots: { index: false, follow: false } };

// Link in the store's "how was your order?" email — no sign in needed
export default function Page() {
  return <ReviewOrder />;
}
