import { LoadingLabel, Skeleton, SkeletonText } from "@/components/ui/skeleton";

// Product page — gallery left, sticky info column right
const PdpSkeleton = () => (
  <section className="bg-white md:grid md:grid-cols-2">
    <LoadingLabel>Loading product</LoadingLabel>
    <div className="flex flex-col gap-1">
      <Skeleton className="aspect-3/4 w-full md:aspect-auto md:h-screen" />
    </div>

    <div className="px-gutter pb-16 pt-8 md:flex md:min-h-screen md:items-center md:pt-header">
      <div className="mx-auto w-full max-w-[30rem] pt-12">
        <Skeleton className="h-3 w-14" />
        <div className="mt-4 flex items-center justify-between gap-6">
          <Skeleton className="h-7 w-3/5" />
          <Skeleton className="h-4 w-24" />
        </div>

        <div className="mt-8 flex items-center justify-between gap-6 border-t border-line pt-5">
          <Skeleton className="h-4 w-28" />
          <span className="flex gap-2.5">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="size-7 rounded-full" />
            ))}
          </span>
        </div>

        <div className="mt-6 border-t border-line pt-5">
          <Skeleton className="h-4 w-16" />
          <span className="mt-4 grid grid-cols-5 gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-11" />
            ))}
          </span>
        </div>

        <Skeleton className="mt-8 h-12 w-full" />
        <SkeletonText lines={3} className="mt-8" />

        <div className="mt-8 flex flex-col">
          {[0, 1, 2].map((i) => (
            <span key={i} className="flex items-center justify-between border-t border-line py-4">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="size-3" />
            </span>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default PdpSkeleton;
