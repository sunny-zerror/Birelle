import { LoadingLabel, PageIntroSkeleton, Skeleton, SkeletonText } from "@/components/ui/skeleton";

// Privacy, Terms, Cookies, Shipping — intro band, contents list on the left, numbered sections on the right
const LegalSkeleton = () => (
  <section className="bg-white pb-section pt-[calc(var(--spacing-header)+2.5rem)] md:pt-[calc(var(--spacing-header)+4.5rem)]">
    <LoadingLabel>Loading page</LoadingLabel>
    <div className="container">
      <PageIntroSkeleton meta />

      <div className="mt-10 grid gap-10 border-t border-line pt-8 md:mt-14 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-20 lg:pt-14 xl:grid-cols-[17rem_minmax(0,1fr)]">
        <span className="hidden flex-col gap-4 border-l border-line pl-4 lg:flex">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className={`h-2.5 ${i % 2 ? "w-3/5" : "w-4/5"}`} />
          ))}
        </span>

        <div className="max-w-3xl">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="border-b border-line py-8 first:pt-0 last:border-b-0 md:py-10">
              <span className="flex items-center gap-4">
                <Skeleton className="h-2.5 w-4" />
                <Skeleton className="h-3.5 w-48" />
              </span>
              <SkeletonText lines={4} className="mt-6 md:pl-9" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default LegalSkeleton;
