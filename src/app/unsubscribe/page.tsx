import type { Metadata } from "next";
import { TokenNotice } from "./TokenNotice";

export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false, follow: false } };

// Link in campaign emails — the store's go-live check expects this page
export default function Page() {
  return <TokenNotice kind="newsletter" />;
}
