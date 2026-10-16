import { notFound } from "next/navigation";
import { ProductMain, ProductCompleteLook, ProductRelated } from "@/components/sections/product";
import { getProduct, getRelated, products } from "@/data/products";
import { createMetadata } from "@/lib/seo";

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
    title: product.title,
    description: product.description,
    path: product.href,
    image: product.image,
  });
}
