import { LegalPage } from "@/components/sections/legal";
import JsonLd from "@/components/seo/JsonLd";
import { cookiePolicy } from "@/data/legal";
import { createPageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";

const Page = () => (
  <>
    <JsonLd data={breadcrumbSchema([{ name: cookiePolicy.title, path: cookiePolicy.slug }])} />
    <LegalPage doc={cookiePolicy} />
  </>
);

export default Page;

export async function generateMetadata() {
  return createPageMetadata(cookiePolicy.slug);
}
