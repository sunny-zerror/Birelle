import { notFound } from "next/navigation";
import { getCatalogProduct } from "@/lib/zcom/catalog";

type Props = { children: React.ReactNode; params: Promise<{ slug: string }> };

// Checks the product exists before loading.tsx starts streaming, so an unknown
// product answers a real 404 (not a 200 "soft 404"). The lookup is shared with the page.
export default async function ProductLayout({ children, params }: Props) {
  const { slug } = await params;
  if (!(await getCatalogProduct(decodeURIComponent(slug)))) notFound();
  return children;
}
