import type { Metadata } from "next";
import { getPaymentRequest } from "@zcom/storefront-kit/server";
import NoticePage from "@/components/sections/notice/NoticePage";
import PayLink from "./PayLink";

// A payment link the store sent for an order taken offline: never indexed, never cached
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Pay for your order", robots: { index: false, follow: false } };

type Params = { params: Promise<{ token: string }> };

export default async function Page({ params }: Params) {
  const { token } = await params;
  const request = await getPaymentRequest(token).catch(() => null);

  if (!request) {
    return (
      <NoticePage eyebrow="Payment link" title="Link not found" action={{ href: "/", label: "Go to the shop" }}>
        <p>This payment link isn&apos;t valid. Please check the link or contact us.</p>
      </NoticePage>
    );
  }

  return <PayLink token={token} request={request} />;
}
