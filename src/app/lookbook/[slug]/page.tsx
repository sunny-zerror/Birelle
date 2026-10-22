import { notFound } from "next/navigation";
import { LookbookDetail } from "@/components/sections/lookbook";
import { getLook, looks } from "@/data/lookbook";
import JsonLd from "@/components/seo/JsonLd";
import { createMetadata } from "@/lib/seo";
import { breadcrumbSchema, lookSchema } from "@/lib/schema";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return looks.map((look) => ({ slug: look.slug }));
}

export const dynamicParams = false;

const LookPage = async ({ params }: Params) => {
  const { slug } = await params;
  const look = getLook(slug);
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
  const look = getLook(slug);
  if (!look) return {};

  return createMetadata({
    title: `${look.title} — Lookbook ${look.season}`,
    description: look.story[0],
    path: `/lookbook/${look.slug}`,
    image: look.photos[0]?.src,
    imageAlt: `${look.title} from the Birelle lookbook`,
  });
}
