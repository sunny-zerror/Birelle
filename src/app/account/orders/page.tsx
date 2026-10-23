import { AccountOrders } from "@/components/sections/account";
import { createMetadata } from "@/lib/seo";

const Page = () => <AccountOrders />;

export default Page;

export async function generateMetadata() {
  // Personal page — keep it out of search results
  return createMetadata({
    title: "My Orders",
    description: "Track and review your Birelle orders.",
    path: "/account/orders",
    noIndex: true,
  });
}
