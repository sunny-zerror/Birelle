import { LookbookHero } from "@/components/sections/lookbook";
import { createPageMetadata } from "@/lib/seo";

const LookbookPage = () => {
  return <LookbookHero />;
};

export default LookbookPage;

export async function generateMetadata() {
  return createPageMetadata("/lookbook");
}
