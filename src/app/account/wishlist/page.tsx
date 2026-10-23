import { AccountWishlist } from "@/components/sections/account";
import { createMetadata } from "@/lib/seo";

const Page = () => <AccountWishlist />;

export default Page;

export async function generateMetadata() {
  // Personal page — keep it out of search results
  return createMetadata({
    title: "Wishlist",
    description: "Pieces you have saved from the Birelle collection.",
    path: "/account/wishlist",
    noIndex: true,
  });
}
