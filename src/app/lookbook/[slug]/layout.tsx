import { notFound, permanentRedirect } from "next/navigation";
import { getLookDetail } from "@/lib/zcom/catalog";

type Props = { children: React.ReactNode; params: Promise<{ slug: string }> };

// Resolves the look before loading.tsx starts streaming: unknown looks answer a real 404,
// renamed ones a real 301. The lookup is shared with the page.
export default async function LookLayout({ children, params }: Props) {
  const { slug } = await params;
  const { look, redirectTo } = await getLookDetail(slug);
  if (redirectTo) permanentRedirect(`/lookbook/${redirectTo}`);
  if (!look) notFound();
  return children;
}
