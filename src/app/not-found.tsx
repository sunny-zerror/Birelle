import Button from "@/components/ui/Button";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Page not found",
  description: "The page you were looking for has moved or no longer exists.",
  noIndex: true,
});

export default function NotFound() {
  return (
    <section className="flex min-h-svh flex-col items-center justify-center bg-white px-gutter pt-header text-center">
      <p className="text-eyebrow text-muted">Error 404</p>
      <h1 className="primary-font mt-4 font-normal uppercase leading-[0.95] text-deep md:text-[4.5rem]">
        Page not found
      </h1>
      <p className="mt-6 max-w-[24rem] text-sm leading-relaxed text-muted">
        The page you were looking for has moved or no longer exists. The collection is still right where you left it.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
        <Button href="/shop">Shop the collection</Button>
        <Button href="/" className="bg-transparent text-deep! ring-1 ring-deep/30 ring-inset">
          Back home
        </Button>
      </div>
    </section>
  );
}
