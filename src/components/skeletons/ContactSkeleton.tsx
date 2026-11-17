import { LoadingLabel, PageIntroSkeleton, Skeleton } from "@/components/ui/skeleton";

// Contact — intro band, the ways to reach us on the left, the message form on the right
const ContactSkeleton = () => (
  <section className="bg-white pb-section pt-[calc(var(--spacing-header)+2.5rem)] md:pt-[calc(var(--spacing-header)+4.5rem)]">
    <LoadingLabel>Loading contact details</LoadingLabel>
    <div className="container">
      <PageIntroSkeleton />

      <div className="mt-12 grid gap-14 border-t border-line pt-10 md:mt-16 md:pt-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20 xl:gap-28">
        <div>
          <Skeleton className="h-3.5 w-32" />
          <span className="mt-6 flex flex-col border-y border-line">
            {Array.from({ length: 3 }, (_, i) => (
              <span key={i} className="flex items-center gap-4 border-b border-line py-5 last:border-b-0">
                <Skeleton className="size-4.5 shrink-0" />
                <span className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-2.5 w-14" />
                  <Skeleton className="h-3 w-2/3" />
                </span>
              </span>
            ))}
          </span>
        </div>

        <div>
          <Skeleton className="h-3.5 w-40" />
          <span className="mt-8 grid gap-x-8 gap-y-8 md:grid-cols-2">
            {Array.from({ length: 4 }, (_, i) => (
              <span key={i} className="flex h-12 items-end border-b border-line pb-2">
                <Skeleton className="h-2.5 w-20" />
              </span>
            ))}
          </span>
          <span className="mt-8 flex h-32 items-start border-b border-line pt-2">
            <Skeleton className="h-2.5 w-24" />
          </span>
          <Skeleton className="mt-8 h-12 w-40" />
        </div>
      </div>
    </div>
  </section>
);

export default ContactSkeleton;
