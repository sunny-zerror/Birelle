import {
  HomeHero,
  HomeLookbook,
  HomeCurated,
  HomeMaking,
  HomeCollection,
  HomeSeenOnYou,
  HomeNewIn,
} from "@/components/sections/home";
import { siteConfig } from "@/config/site";
import { createPageMetadata } from "@/lib/seo";

const HomePage = () => {
  return (
    <>
      {/* The hero shows the wordmark as an image — this gives the page its text heading */}
      <h1 className="sr-only">
        {siteConfig.name} — {siteConfig.tagline}
      </h1>
      <HomeHero />
      <HomeCollection />
      <HomeCurated />
      <HomeNewIn />
      <HomeLookbook />
    </>
  );
};

export default HomePage;

export async function generateMetadata() {
  return createPageMetadata("/");
}
