import { notFound } from "next/navigation";
import { ProductMain, ProductCompleteLook, ProductRelated } from "@/components/sections/product";
import { formatPrice, getColours, getProduct, getRelated, products } from "@/data/products";
import JsonLd from "@/components/seo/JsonLd";
import { siteConfig } from "@/config/site";
import { createMetadata } from "@/lib/seo";
import { breadcrumbSchema, productSchema } from "@/lib/schema";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.id }));
}

export const dynamicParams = false;

const ProductPage = async ({ params }: Params) => {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const pair = product.pairsWith ? getProduct(product.pairsWith) : undefined;

  return (
    <>
      <JsonLd
        data={[
          productSchema(product),
          breadcrumbSchema([
            { name: "Shop", path: "/shop" },
            { name: product.title, path: product.href },
          ]),
        ]}
      />
      <ProductMain product={product} />
      {pair && <ProductCompleteLook product={product} pair={pair} />}
      <ProductRelated products={getRelated(product.id)} />
    </>
  );
};

export default ProductPage;

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};

  return createMetadata({
    title: `${product.title} — ${product.category[0].toUpperCase()}${product.category.slice(1)}`,
    description: `${product.description} ${formatPrice(product.price)}. Free express shipping over $${siteConfig.shipping.freeOver}.`,
    path: product.href,
    image: product.image,
    imageAlt: product.title,
    keywords: [product.title, `Birelle ${product.category}`, ...getColours(product).map((c) => `${c.toLowerCase()} ${product.category}`), ...siteConfig.keywords],
    // Open Graph product tags (Pinterest / Facebook catalogue)
    other: {
      "product:brand": siteConfig.name,
      "product:availability": "in stock",
      "product:condition": "new",
      "product:price:amount": product.price.toFixed(2),
      "product:price:currency": siteConfig.currency,
    },
  });
}
