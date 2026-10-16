import { AboutHero, AboutFounder, AboutVision, AboutExpression } from "@/components/sections/about";
import { createPageMetadata } from "@/lib/seo";

const AboutPage = () => {
  return (
    <>
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
