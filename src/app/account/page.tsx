import { AccountOverview } from "@/components/sections/account";
import { createMetadata } from "@/lib/seo";

const Page = () => <AccountOverview />;

export default Page;

export async function generateMetadata() {
  // Personal page — keep it out of search results
  return createMetadata({
    title: "My Account",
    description: "Your Birelle account — orders, wishlist, addresses and settings.",
    path: "/account",
    noIndex: true,
  });
}
