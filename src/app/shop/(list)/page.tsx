import { PlpHero, PlpGrid } from "@/components/sections/allproducts";
import JsonLd from "@/components/seo/JsonLd";
import { createPageMetadata } from "@/lib/seo";
import { breadcrumbSchema, productListSchema } from "@/lib/schema";
import { getCatalog } from "@/lib/zcom/catalog";

// Catalogue from the Zcom store, refreshed every minute
export const revalidate = 60;

const AllProductsPage = async () => {
  const { products } = await getCatalog();
  return (
    <>
      <JsonLd
        data={[
          productListSchema(products, "Shop All — Birelle Collection 2026", "/shop"),
          breadcrumbSchema([{ name: "Shop", path: "/shop" }]),
        ]}
      />
      <PlpHero />
      <PlpGrid />
    </>
  );
};

export default AllProductsPage;

export async function generateMetadata() {
  return createPageMetadata("/shop");
}
