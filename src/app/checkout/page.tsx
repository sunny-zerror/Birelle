import { Checkout } from "@/components/sections/checkout";
import { createMetadata } from "@/lib/seo";

const CheckoutPage = () => {
  return <Checkout />;
};

export default CheckoutPage;

export async function generateMetadata() {
  // Personal page — keep it out of search results
  return createMetadata({
    title: "Checkout",
    description: "Complete your Birelle order.",
    path: "/checkout",
    noIndex: true,
  });
}
