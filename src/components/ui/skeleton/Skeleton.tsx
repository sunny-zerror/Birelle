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

// Mirrors the shop / wishlist card: 3:4 frame, centred title and price
export const ProductCardSkeleton = ({ action = false }: { action?: boolean }) => (
  <li aria-hidden="true" className="flex flex-col items-center">
    <Skeleton className="aspect-3/4 w-full" />
    <Skeleton className="mt-4 h-3 w-2/3 max-w-40" />
    <Skeleton className="mt-2 h-3 w-1/3 max-w-20" />
    {action && <Skeleton className="mt-5 h-9 w-full max-w-[13.5rem]" />}
  </li>
);

// Screen-reader announcement for a skeleton region
export const LoadingLabel = ({ children = "Loading" }: { children?: React.ReactNode }) => (
  <span role="status" className="sr-only">
    {children}
  </span>
);
