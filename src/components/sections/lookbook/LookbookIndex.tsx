import { Link } from "next-view-transitions";
import { RiArrowLeftLine } from "@remixicon/react";
import { LOOKBOOK_SEASON } from "@/data/lookbook";
import { ImageSkeleton } from "@/components/ui/skeleton";

export type LookCard = {
  slug: string;
  title: string;
  label: string;
  /** a portrait photo for the portrait spots */
  portrait: string;
  /** a landscape photo for the wide spots, when the look has one */
  landscape: string | null;
};

type Shape = "L" | "P";

/**
 * One height for every photo on the page. A portrait is always a third of the row (minus the gaps) at 4:5, so
 * every portrait is the same size; a landscape takes the rest of its row and matches its row-mate's height
 * (cropped, never stretched — about 1.65:1 at desktop widths).
 */
const ROWS: Shape[][] = [
  ["L", "P"],
  ["P", "P", "P"],
  ["P", "L"],
  ["P", "P", "P"],
];

type Item = { look: LookCard; index: number; shape: Shape };

// Deal the looks into the row pattern, in order
const toRows = (looks: LookCard[]) => {
  const rows: Item[][] = [];
  let index = 0;
  for (let r = 0; index < looks.length; r++) {
    const pattern = ROWS[r % ROWS.length];
    rows.push(pattern.slice(0, looks.length - index).map((shape) => ({ look: looks[index], index: index++, shape })));
  }
  return rows;
};

const ease = "ease-[cubic-bezier(0.22,1,0.36,1)]";
const pad = (n: number) => String(n).padStart(2, "0");
// A third of the row: three portraits and their two 2vw gaps fill it exactly
const THIRD = "md:w-[calc((100%-4vw)/3)] md:flex-none";

const LookbookIndex = ({ looks }: { looks: LookCard[] }) => {
  const rows = toRows(looks);

  return (
    <section className="lookbook-index bg-white pb-section pt-header">
      <div className="container">
        <header className="pt-stack">
          <Link href="/lookbook" className="inline-flex items-center gap-2 text-sm text-ink">
            <RiArrowLeftLine size={16} aria-hidden="true" />
            <span className="link-line">Back to the lookbook</span>
          </Link>

          <div className="mt-10 flex items-end justify-between gap-6 border-b border-line pb-stack md:mt-14">
            <div>
              <p className="text-eyebrow text-muted">{LOOKBOOK_SEASON}</p>
              <h1 className="primary-font mt-3 font-normal uppercase leading-none text-deep">All Looks</h1>
            </div>
            <span className="shrink-0 text-sm tabular-nums text-muted">{pad(looks.length)} looks</span>
          </div>
        </header>

        {/* Phones: one column. Desktop: rows of one height, one gap across and one gap down. */}
        <div className="mt-section flex flex-col gap-y-10 md:gap-y-[3vw]">
          {rows.map((row, r) => {
            // A landscape with no portrait beside it (a short last row) keeps 3:2 at two-thirds width instead
            const alone = !row.some((item) => item.shape === "P");
            return (
              <ul key={r} className="flex flex-col gap-y-10 md:flex-row md:gap-x-[2vw]">
                {row.map(({ look, index, shape }) => {
                  const wide = shape === "L";
                  const size = !wide ? THIRD : alone ? "md:w-[calc((100%-4vw)/3*2+2vw)] md:flex-none" : "md:min-w-0 md:flex-1";
                  return (
                    <li key={look.slug} className={`md:flex md:flex-col ${size}`}>
                      <Link href={`/lookbook/${look.slug}`} className="group flex h-full flex-col">
                        <ImageSkeleton
                          className={`relative overflow-hidden bg-neutral-100 ${
                            !wide ? "aspect-4/5" : alone ? "aspect-3/2" : "aspect-3/2 md:aspect-auto md:flex-1"
                          }`}
                        >
                          <img
                            src={shape === "L" ? (look.landscape ?? look.portrait) : look.portrait}
                            alt={look.title}
                            loading={index < 2 ? "eager" : "lazy"}
                            className={`absolute inset-0 size-full object-cover transition-transform duration-1000 ${ease} group-hover:scale-[1.03]`}
                          />
                        </ImageSkeleton>
                        <div className="mt-3 flex items-baseline justify-between gap-4 md:mt-4">
                          <h2 className="secondary-font flex items-baseline gap-3 text-sm font-normal text-ink md:text-base">
                            <span className="text-xs tabular-nums text-muted">{pad(index + 1)}</span>
                            <span className="link-line">{look.title}</span>
                          </h2>
                          {look.label && (
                            <span className="shrink-0 text-[0.625rem] uppercase tracking-wider text-muted md:text-xs">{look.label}</span>
                          )}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LookbookIndex;
