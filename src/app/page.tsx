import {
  HomeHero,
  HomeLookbook,
  HomeManifesto,
  HomeCurated,
  HomeMaking,
  HomeCollection,
  HomeSeenOnYou,
} from "@/components/sections/home";
import { createPageMetadata } from "@/lib/seo";

const HomePage = () => {
  return (
    <>
      <HomeHero />
      <HomeLookbook />
      <HomeManifesto />
      <HomeCurated />
      <HomeMaking />
      <HomeCollection />
      <HomeSeenOnYou />
    </>
  );
};

export default HomePage;

export async function generateMetadata() {
  return createPageMetadata("/");
}
