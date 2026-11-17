import { LoadingLabel, Skeleton, SkeletonText } from "@/components/ui/skeleton";

// About — centred title over the wide film still, then the intro paragraph
const AboutSkeleton = () => (
  <section className="bg-white pb-section pt-[calc(var(--spacing-header)+2.5rem)] md:pt-[calc(var(--spacing-header)+1rem)]">
    <LoadingLabel>Loading our story</LoadingLabel>
    <div className="container">
      <div className="flex flex-col items-center">
        <Skeleton className="h-11 w-3/4 max-w-xl md:h-16" />
        <Skeleton className="mt-5 h-3 w-32" />
      </div>
      <Skeleton className="mx-auto mt-10 block aspect-video w-full md:mt-14" />
      <SkeletonText lines={3} className="mx-auto mt-stack max-w-[32rem] md:mt-20" />
    </div>
  </section>
);

export default AboutSkeleton;
