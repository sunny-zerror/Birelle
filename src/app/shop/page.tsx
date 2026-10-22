import { PlpHero, PlpGrid } from "@/components/sections/allproducts";
import JsonLd from "@/components/seo/JsonLd";
import { products } from "@/data/products";
import { createPageMetadata } from "@/lib/seo";
import { breadcrumbSchema, productListSchema } from "@/lib/schema";

const AllProductsPage = () => {
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
