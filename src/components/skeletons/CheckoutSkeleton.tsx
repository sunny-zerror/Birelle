import { LoadingLabel, Skeleton } from "@/components/ui/skeleton";

const Field = ({ className = "" }: { className?: string }) => <Skeleton className={`h-12 w-full ${className}`} />;

// Checkout — form left, order summary right (summary stacks first on mobile)
const CheckoutSkeleton = () => (
  <section className="flex min-h-screen flex-col bg-white md:grid md:grid-cols-2">
    <LoadingLabel>Loading checkout</LoadingLabel>
    <div className="px-gutter pb-12 pt-10 md:pb-16 md:pt-[calc(var(--spacing-header)+3.5rem)]">
      <div className="mx-auto w-full max-w-[28rem]">
        <span className="grid grid-cols-3 gap-2 border border-line p-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-10" />
          ))}
        </span>
        <Skeleton className="mx-auto mt-5 h-3 w-2/5" />

        <Skeleton className="mt-8 h-5 w-24" />
        <Field className="mt-3" />

        <Skeleton className="mt-10 h-5 w-36" />
        <span className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2">
          <Field />
          <Field />
          <Field className="col-span-2" />
          <Field className="col-span-2" />
          <Field />
          <Field />
        </span>

        <Skeleton className="mt-10 h-5 w-24" />
        <Skeleton className="mt-3 h-36 w-full" />
        <Skeleton className="mt-8 h-12 w-full" />
      </div>
    </div>

    <div className="order-first border-b border-line px-gutter pb-8 pt-header md:order-none md:border-b-0 md:px-14 md:pt-32 lg:px-20">
      <div className="w-full max-w-[25rem] max-md:mx-auto">
        {[0, 1].map((i) => (
          <span key={i} className="mb-5 flex items-start gap-4">
            <Skeleton className="aspect-3/4 w-16 shrink-0" />
            <span className="flex flex-1 flex-col gap-2 pt-1">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-3 w-1/3" />
            </span>
            <Skeleton className="mt-1 h-4 w-14" />
          </span>
        ))}
        <span className="mt-8 flex gap-2">
          <Field />
          <Skeleton className="h-12 w-24 shrink-0" />
        </span>
        <span className="mt-8 flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <span key={i} className="flex justify-between">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-3.5 w-16" />
            </span>
          ))}
        </span>
      </div>
    </div>
  </section>
);

export default CheckoutSkeleton;
