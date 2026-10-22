import { LookbookHero } from "@/components/sections/lookbook";
import JsonLd from "@/components/seo/JsonLd";
import { createPageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";

const LookbookPage = () => {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Lookbook", path: "/lookbook" }])} />
      <LookbookHero />
    </>
  );
};

export default LookbookPage;

export async function generateMetadata() {
  return createPageMetadata("/lookbook");
}
