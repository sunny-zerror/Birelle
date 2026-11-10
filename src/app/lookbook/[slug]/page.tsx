import { notFound, permanentRedirect } from "next/navigation";
import { LookbookDetail } from "@/components/sections/lookbook";
import JsonLd from "@/components/seo/JsonLd";
import { createMetadata } from "@/lib/seo";
import { breadcrumbSchema, lookSchema } from "@/lib/schema";
import { getLookDetail } from "@/lib/zcom/catalog";

type Params = { params: Promise<{ slug: string }> };

// Looks come from the Zcom store's lookbooks, refreshed every minute
export const revalidate = 60;

// Rendered on first visit, then cached (no build-time burst against the store API)
export async function generateStaticParams() {
  return [];
}

const LookPage = async ({ params }: Params) => {
  const { slug } = await params;
  const { look, redirectTo } = await getLookDetail(slug);
  // A renamed lookbook keeps its old links working
  if (redirectTo) permanentRedirect(`/lookbook/${redirectTo}`);
  if (!look) notFound();

  return (
    <>
      <JsonLd
        data={[
          lookSchema(look),
          breadcrumbSchema([
            { name: "Lookbook", path: "/lookbook" },
            { name: look.title, path: `/lookbook/${look.slug}` },
          ]),
        ]}
      />
      <LookbookDetail look={look} />
    </>
  );
};

export default LookPage;

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const { look } = await getLookDetail(slug);
  if (!look) return {};

  return createMetadata({
    title: look.season ? `${look.title} — Lookbook ${look.season}` : `${look.title} — Lookbook`,
    description: look.story[0] ?? look.title,
    path: `/lookbook/${look.slug}`,
    image: look.photos[0]?.src ?? look.src,
    imageAlt: `${look.title} from the Birelle lookbook`,
  });
}
