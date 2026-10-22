import { LoadingLabel, Skeleton } from "@/components/ui/skeleton";

// Look page — back link, centred header, then landscape / portrait-pair rows
const LookSkeleton = () => (
  <section className="bg-white pt-header">
    <LoadingLabel>Loading look</LoadingLabel>
    <div className="container pb-section">
      <Skeleton className="mt-stack h-3.5 w-20" />

      <div className="flex flex-col items-center py-stack">
        <Skeleton className="mt-4 h-10 w-56 md:h-16 md:w-96" />
        <Skeleton className="mt-6 h-3 w-full max-w-[32rem]" />
        <Skeleton className="mt-2.5 h-3 w-2/3 max-w-[22rem]" />
        <Skeleton className="mt-8 h-10 w-36" />
      </div>

      <div className="flex flex-col gap-grid">
        <Skeleton className="aspect-video w-full" />
        <div className="grid grid-cols-2 gap-grid">
          <Skeleton className="aspect-3/4" />
          <Skeleton className="aspect-3/4" />
        </div>
      </div>
    </div>
  </section>
);

export default LookSkeleton;
