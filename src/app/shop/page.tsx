import { PlpHero, PlpGrid } from "@/components/sections/allproducts";
import { createPageMetadata } from "@/lib/seo";

const AllProductsPage = () => {
  return (
    <>
      <PlpHero />
      <PlpGrid />
    </>
  );
};

export default AllProductsPage;

export async function generateMetadata() {
  return createPageMetadata("/allproducts");
}
