import { notFound } from "next/navigation";
import { ProductMain, ProductCompleteLook, ProductRelated } from "@/components/sections/product";
import { formatPrice, getColours } from "@/data/products";
import JsonLd from "@/components/seo/JsonLd";
import { siteConfig } from "@/config/site";
import { createMetadata } from "@/lib/seo";
import { breadcrumbSchema, productSchema } from "@/lib/schema";
import { getCatalog, getCatalogProduct, pairFor, relatedTo } from "@/lib/zcom/catalog";

type Params = { params: Promise<{ slug: string }> };

// Product pages render on demand from the Zcom store and refresh every minute
export const revalidate = 60;

// Rendered on first visit, then cached (no build-time burst against the store API)
export async function generateStaticParams() {
  return [];
}

const ProductPage = async ({ params }: Params) => {
  const { slug } = await params;
  const [product, { products }] = await Promise.all([getCatalogProduct(decodeURIComponent(slug)), getCatalog()]);
  if (!product) notFound();

  const pair = pairFor(product, products);

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
      <ProductRelated products={relatedTo(product, products)} />
    </>
  );
};

export default ProductPage;

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const product = await getCatalogProduct(decodeURIComponent(slug));
  if (!product) return {};

  const category = product.category.replace(/-/g, " ");
  const anyAvailable = product.zcom?.variants.some((v) => v.purchasable) ?? true;
  return createMetadata({
    title: category ? `${product.title} — ${category[0].toUpperCase()}${category.slice(1)}` : product.title,
    description: `${product.description} ${formatPrice(product.price)}. Free express shipping over ${formatPrice(siteConfig.shipping.freeOver)}.`.trim(),
    path: product.href,
    image: product.image,
    imageAlt: product.title,
    keywords: [product.title, `Birelle ${category}`, ...getColours(product).map((c) => `${c.toLowerCase()} ${category}`), ...siteConfig.keywords],
    // Open Graph product tags (Pinterest / Facebook catalogue)
    other: {
      "product:brand": siteConfig.name,
      "product:availability": anyAvailable ? "in stock" : "out of stock",
      "product:condition": "new",
      "product:price:amount": product.price.toFixed(2),
      "product:price:currency": siteConfig.currency,
    },
  });
}
