import { LoadingLabel, Skeleton, SkeletonText } from "@/components/ui/skeleton";

// Single-message pages (order status, payment, review, reset password…) — a centred notice and its action
const NoticeSkeleton = () => (
  <section className="flex min-h-screen flex-col items-center justify-center bg-white px-gutter py-section">
    <LoadingLabel>Loading</LoadingLabel>
    <div className="flex w-full max-w-[26rem] flex-col items-center">
      <Skeleton className="h-2.5 w-24" />
      <Skeleton className="mt-5 h-8 w-64" />
      <SkeletonText lines={2} className="mt-6 w-full items-center" />
      <Skeleton className="mt-10 h-11 w-44" />
    </div>
  </section>
);

export default NoticeSkeleton;
