import type { Metadata } from "next";
import { TokenNotice } from "@/app/unsubscribe/TokenNotice";

export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false, follow: false } };

export default function Page() {
  return <TokenNotice kind="review" />;
}
