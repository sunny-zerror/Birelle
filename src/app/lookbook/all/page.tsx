import { LookbookIndex, type LookCard } from "@/components/sections/lookbook";
import JsonLd from "@/components/seo/JsonLd";
import { createPageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { getLookDetail, getLooks } from "@/lib/zcom/catalog";

// Looks come from the Zcom store's lookbooks, refreshed every minute (as the look pages are)
export const revalidate = 60;

const AllLooksPage = async () => {
  const looks = await getLooks();
  // The list carries only covers; each look's editorial photos come with its detail
  const details = await Promise.all(
    looks.map((l) =>
      getLookDetail(l.slug)
        .then((d) => d.look)
        .catch(() => null),
    ),
  );

  // One portrait (the index preview, portrait grid slots) and one landscape (wide grid slots) per look
  const cards: LookCard[] = looks.map((look, i) => {
    const photos = details[i]?.photos.length ? details[i]!.photos : look.photos;
    const portrait = photos.find((p) => p.height >= p.width);
    const landscape = photos.find((p) => p.width > p.height);
    return {
      slug: look.slug,
      title: look.title,
      label: look.category || look.season,
      portrait: portrait?.src ?? landscape?.src ?? look.src,
      landscape: landscape?.src ?? null,
    };
  });

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Lookbook", path: "/lookbook" },
          { name: "All Looks", path: "/lookbook/all" },
        ])}
      />
      <LookbookIndex looks={cards} />
    </>
  );
};

export default AllLooksPage;

export async function generateMetadata() {
  return createPageMetadata("/lookbook/all");
}
