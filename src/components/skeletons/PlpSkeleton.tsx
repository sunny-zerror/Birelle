import { LoadingLabel, ProductCardSkeleton, Skeleton } from "@/components/ui/skeleton";

// Shop — hero, toolbar and the 2 / 4 column product grid
const PlpSkeleton = () => (
  <>
    <LoadingLabel>Loading the collection</LoadingLabel>
    <Skeleton className="h-[70vh] w-full" />
    <section className="section bg-white">
      <div className="container">
        <div className="flex flex-col gap-6 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center">
          <span className="flex flex-col gap-2">
            <Skeleton className="h-9 w-44 md:h-11" />
            <Skeleton className="h-9 w-24 md:h-11" />
          </span>
          <span className="flex gap-2 md:gap-3">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-9 w-20 md:w-24" />
            ))}
          </span>
          <Skeleton className="h-3 w-16 md:justify-self-end" />
        </div>
        <ul className="mt-stack grid grid-cols-2 gap-x-4 gap-y-12 md:mt-20 md:grid-cols-4 md:gap-x-8 md:gap-y-20">
          {Array.from({ length: 8 }, (_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </ul>
      </div>
    </section>
  </>
);

export default PlpSkeleton;
