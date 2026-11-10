import { LegalPage } from "@/components/sections/legal";
import JsonLd from "@/components/seo/JsonLd";
import { shippingAndReturns } from "@/data/shipping-returns";
import { createMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";

const Page = () => (
  <>
    <JsonLd data={breadcrumbSchema([{ name: shippingAndReturns.title, path: shippingAndReturns.slug }])} />
    <LegalPage doc={shippingAndReturns} />
  </>
);

export default Page;

export async function generateMetadata() {
  return createMetadata({
    title: shippingAndReturns.title,
    description: shippingAndReturns.intro,
    path: shippingAndReturns.slug,
  });
}
