import { LoadingLabel, Skeleton } from "@/components/ui/skeleton";

const THIRD = "md:w-[calc((100%-4vw)/3)] md:flex-none";

// One look tile: a photo then its number · title and category on one line
const Tile = ({ wide = false }: { wide?: boolean }) => (
  <span className={`flex flex-col ${wide ? "md:min-w-0 md:flex-1" : THIRD}`}>
    <Skeleton className={wide ? "aspect-3/2 md:aspect-auto md:flex-1" : "aspect-4/5"} />
    <span className="mt-3 flex items-center justify-between md:mt-4">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-2.5 w-14" />
    </span>
  </span>
);

// All Looks — back link, title band, then rows of one height (landscape + portrait, three portraits)
const LookbookIndexSkeleton = () => (
  <section className="bg-white pb-section pt-header">
    <LoadingLabel>Loading all looks</LoadingLabel>
    <div className="container">
      <div className="pt-stack">
        <Skeleton className="h-3 w-40" />
        <div className="mt-10 flex items-end justify-between gap-6 border-b border-line pb-stack md:mt-14">
          <span className="flex flex-col gap-4">
            <Skeleton className="h-2.5 w-24" />
            <Skeleton className="h-9 w-48 md:h-11 md:w-64" />
          </span>
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      <div className="mt-section flex flex-col gap-y-10 md:gap-y-[3vw]">
        <div className="flex flex-col gap-y-10 md:flex-row md:gap-x-[2vw]">
          <Tile wide />
          <Tile />
        </div>
        <div className="hidden md:flex md:flex-row md:gap-x-[2vw]">
          <Tile />
          <Tile />
          <Tile />
        </div>
      </div>
    </div>
  </section>
);

export default LookbookIndexSkeleton;
