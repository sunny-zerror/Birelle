// Skeleton building blocks — warm off-white blocks with a slow sweep (see .skeleton in globals.css)

type SkeletonProps = { className?: string };

export const Skeleton = ({ className = "" }: SkeletonProps) => <span aria-hidden="true" className={`skeleton ${className}`} />;

// A run of text lines; the last one is shorter, like a real paragraph
export const SkeletonText = ({ lines = 3, className = "" }: SkeletonProps & { lines?: number }) => (
  <span aria-hidden="true" className={`flex flex-col gap-2.5 ${className}`}>
    {Array.from({ length: lines }, (_, i) => (
      <Skeleton key={i} className={`h-3 ${i === lines - 1 ? "w-3/5" : "w-full"}`} />
    ))}
  </span>
);

// Mirrors the shop / wishlist card: 3:4 tile, then a short uppercase title and the price, centred
export const ProductCardSkeleton = ({ action = false }: { action?: boolean }) => (
  <li aria-hidden="true" className="flex flex-col items-center">
    <Skeleton className="aspect-3/4 w-full" />
    <Skeleton className="mt-4 h-2.5 w-1/2 max-w-32" />
    <Skeleton className="mt-2 h-2.5 w-1/4 max-w-16" />
    {action && <Skeleton className="mt-5 h-9 w-full max-w-[13.5rem]" />}
  </li>
);

// The intro band of the content pages (contact, FAQ, legal): eyebrow, big title, a line of intro
export const PageIntroSkeleton = ({ meta = false }: { meta?: boolean }) => (
  <span aria-hidden="true" className="block max-w-3xl">
    <Skeleton className="h-2.5 w-20" />
    <Skeleton className="mt-5 h-8 w-3/4 max-w-md md:h-12" />
    <Skeleton className="mt-6 h-3 w-full max-w-xl" />
    <Skeleton className="mt-2.5 h-3 w-2/3 max-w-sm" />
    {meta && <Skeleton className="mt-7 h-2.5 w-28" />}
  </span>
);

// Screen-reader announcement for a skeleton region
export const LoadingLabel = ({ children = "Loading" }: { children?: React.ReactNode }) => (
  <span role="status" className="sr-only">
    {children}
  </span>
);
