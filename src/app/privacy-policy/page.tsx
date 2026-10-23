import { LegalPage } from "@/components/sections/legal";
import JsonLd from "@/components/seo/JsonLd";
import { privacyPolicy } from "@/data/legal";
import { createPageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";

const Page = () => (
  <>
    <JsonLd data={breadcrumbSchema([{ name: privacyPolicy.title, path: privacyPolicy.slug }])} />
    <LegalPage doc={privacyPolicy} />
  </>
);

export default Page;

export async function generateMetadata() {
  return createPageMetadata(privacyPolicy.slug);
}
