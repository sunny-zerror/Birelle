import { LoadingLabel, Skeleton } from "@/components/ui/skeleton";

// Lookbook playground — heading and "view all" on top, the drop note, and the bag standing on the floor
const LookbookSkeleton = () => (
  <section className="bg-white pt-header">
    <LoadingLabel>Loading the lookbook</LoadingLabel>
    <div className="relative h-[calc(100svh-var(--spacing-header))] min-h-[32rem] overflow-hidden">
      <div className="container flex items-center justify-between gap-6 pt-5">
        <span className="flex flex-col gap-2">
          <Skeleton className="h-8 w-40 md:h-11 md:w-56" />
          <Skeleton className="h-8 w-48 md:h-11 md:w-72" />
        </span>
        <Skeleton className="h-10 w-40 md:w-48" />
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="mt-3 h-2.5 w-36" />
        {/* The bag: 264 × 314, two-thirds of the screen tall (see --lookbook-bag-h) */}
        <Skeleton className="mt-8 mb-9 aspect-264/314 h-[min(65svh,calc(36vw*314/264))] max-md:h-[min(65svh,calc(70vw*314/264))]" />
      </div>
    </div>
  </section>
);

export default LookbookSkeleton;
