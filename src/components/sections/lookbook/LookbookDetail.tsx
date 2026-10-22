import Image from "next/image";
import { Link } from "next-view-transitions";
import { RiArrowLeftLine } from "@remixicon/react";
import Button from "@/components/ui/Button";
import { ImageSkeleton } from "@/components/ui/skeleton";
import type { Look, LookPhoto } from "@/types";

const isLandscape = (p: LookPhoto) => p.width > p.height;

// Landscapes run full width on their own; consecutive portraits pair up two per row
const toRows = (photos: LookPhoto[]) => {
  const rows: { type: "landscape" | "portrait"; photos: LookPhoto[] }[] = [];
  for (const photo of photos) {
    const last = rows[rows.length - 1];
    if (isLandscape(photo)) rows.push({ type: "landscape", photos: [photo] });
    else if (last?.type === "portrait" && last.photos.length < 2) last.photos.push(photo);
    else rows.push({ type: "portrait", photos: [photo] });
  }
  return rows;
};

// A single look — editorial header, then its photography
const LookbookDetail = ({ look }: { look: Look }) => {
  let n = 0;

  return (
    <section id="lookbook-detail" className="bg-white pt-header">
      <div className="container pb-section">
        <Link
          href="/lookbook"
          className="text-cta mt-stack inline-flex items-center gap-2 text-deep"
        >
          <RiArrowLeftLine size={16} />
          Go back
        </Link>

        <header className="flex flex-col items-center py-stack text-center">
          <h1 className="primary-font mt-4 font-normal uppercase leading-[0.95] text-deep md:text-[4.5rem]">
            {look.title}
          </h1>
          {look.story.map((p, i) => (
            <p key={i} className="mt-6 max-w-[32rem] text-sm  text-ink">
              {p}
            </p>
          ))}
          <Button href="/shop" className="mt-8">
            Shop now
          </Button>
        </header>

        <div className="flex flex-col gap-grid">
          {toRows(look.photos).map((row, r) =>
            row.type === "landscape" ? (
              <ImageSkeleton key={r} className="relative aspect-video overflow-hidden bg-neutral-50">
                <Image
                  src={row.photos[0].src}
                  alt={`${look.title} — photo ${++n}`}
                  fill
                  priority={r === 0}
                  sizes="(min-width: 120rem) 113rem, 100vw"
                  className="object-cover"
                />
              </ImageSkeleton>
            ) : (
              <div key={r} className="grid grid-cols-2 gap-grid">
                {row.photos.map((photo) => (
                  <ImageSkeleton key={photo.src} className="relative aspect-3/4 overflow-hidden bg-neutral-50">
                    <Image
                      src={photo.src}
                      alt={`${look.title} — photo ${++n}`}
                      fill
                      priority={r === 0}
                      sizes="(min-width: 120rem) 56rem, 50vw"
                      className="object-cover"
                    />
                  </ImageSkeleton>
                ))}
              </div>
            ),
          )}
        </div>

        <div className="center mt-stack">
          <Button href="/shop">Shop the collection</Button>
        </div>
      </div>
    </section>
  );
};

export default LookbookDetail;
