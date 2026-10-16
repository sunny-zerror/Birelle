import { WishlistGrid } from "@/components/sections/wishlist";
import { createMetadata } from "@/lib/seo";

const WishlistPage = () => {
  return <WishlistGrid />;
};

export default WishlistPage;

export async function generateMetadata() {
  // Personal page — keep it out of search results
  return createMetadata({
    title: "Wishlist",
    description: "Pieces you have saved from the Birelle collection.",
    path: "/wishlist",
    noIndex: true,
  });
}
