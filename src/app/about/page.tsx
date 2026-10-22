import { AboutHero, AboutFounder, AboutVision, AboutExpression } from "@/components/sections/about";
import JsonLd from "@/components/seo/JsonLd";
import { createPageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";

const AboutPage = () => {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "About", path: "/about" }])} />
      <AboutHero />
      <AboutFounder />
      <AboutVision />
      <AboutExpression />
    </>
  );
};

export default AboutPage;

export async function generateMetadata() {
  return createPageMetadata("/about");
}
