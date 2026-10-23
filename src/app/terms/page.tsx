import { LegalPage } from "@/components/sections/legal";
import JsonLd from "@/components/seo/JsonLd";
import { termsAndConditions } from "@/data/legal";
import { createPageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";

const Page = () => (
  <>
    <JsonLd data={breadcrumbSchema([{ name: termsAndConditions.title, path: termsAndConditions.slug }])} />
    <LegalPage doc={termsAndConditions} />
  </>
);

export default Page;

export async function generateMetadata() {
  return createPageMetadata(termsAndConditions.slug);
}
