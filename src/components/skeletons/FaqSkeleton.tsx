import { LoadingLabel, PageIntroSkeleton, Skeleton } from "@/components/ui/skeleton";

// FAQ — intro band, search + topics on the left, topic groups of question rows on the right
const FaqSkeleton = () => (
  <section className="bg-white pb-section pt-[calc(var(--spacing-header)+2.5rem)] md:pt-[calc(var(--spacing-header)+4.5rem)]">
    <LoadingLabel>Loading questions</LoadingLabel>
    <div className="container">
      <PageIntroSkeleton />

      <div className="mt-10 grid gap-10 border-t border-line pt-8 md:mt-14 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-20 lg:pt-14 xl:grid-cols-[17rem_minmax(0,1fr)]">
        <span className="flex flex-col">
          <span className="flex h-12 items-center border-b border-line">
            <Skeleton className="h-3 w-32" />
          </span>
          <span className="mt-6 flex gap-2 overflow-hidden lg:flex-col lg:gap-3">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-9 w-24 shrink-0 lg:h-3 lg:w-28" />
            ))}
          </span>
        </span>

        <div className="flex max-w-3xl flex-col gap-12 md:gap-16">
          {Array.from({ length: 2 }, (_, g) => (
            <div key={g}>
              <span className="block border-b border-line pb-4">
                <Skeleton className="h-3.5 w-36" />
              </span>
              {Array.from({ length: 4 }, (_, i) => (
                <span key={i} className="flex items-center justify-between border-b border-line py-5">
                  <Skeleton className={`h-3 ${i % 2 ? "w-1/2" : "w-2/3"}`} />
                  <Skeleton className="size-3" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default FaqSkeleton;
