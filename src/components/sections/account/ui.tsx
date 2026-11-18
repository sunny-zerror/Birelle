import NextLink from "next/link";
import { RiArrowRightLine } from "@remixicon/react";
import Button from "@/components/ui/Button";
import type { OrderStatus } from "@/types";

export const ease = "ease-[cubic-bezier(0.22,1,0.36,1)]";

// Title for each dashboard tab (the page's h1 is the "Hello" band above), with an optional action on the right
export const AccountHeading = ({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) => (
  <header className="account-heading flex flex-wrap items-end justify-between gap-4">
    <div>
      <h2 className="primary-font text-2xl font-normal text-ink md:text-3xl">{title}</h2>
      {description && <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">{description}</p>}
    </div>
    {action}
  </header>
);

// Hairline-bordered block — the dashboard's only container style (as the Contact form)
export const Panel = ({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => (
  <section className={`account-panel border border-line p-6 md:p-8 ${className}`}>
    {(title || action) && (
      <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-line pb-4">
        {title && <h3 className="secondary-font text-sm uppercase tracking-wide text-ink">{title}</h3>}
        {action}
      </div>
    )}
    {children}
  </section>
);

// Small link with the site's drawn underline and an arrow that nudges on hover. A plain Next link: it moves between
// account tabs, which swap only the content column rather than fading the whole page
export const ArrowLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <NextLink href={href} className="group inline-flex shrink-0 items-center gap-1.5 text-xs text-ink">
    <span className="link-line">{children}</span>
    <RiArrowRightLine size={12} className={`transition-transform duration-500 ${ease} group-hover:translate-x-0.5`} />
  </NextLink>
);

export const EmptyState = ({
  title,
  text,
  cta = { label: "Shop the collection", href: "/shop" },
  action,
}: {
  title: string;
  text: string;
  cta?: { label: string; href: string };
  /** Replaces the link button, e.g. a button that opens a form */
  action?: React.ReactNode;
}) => (
  <div className="mt-8 flex animate-panel-in flex-col items-center border border-line px-6 py-16 text-center md:mt-10 md:py-24">
    <p className="primary-font text-2xl text-ink">{title}</p>
    <p className="mt-3 max-w-[22rem] text-sm leading-relaxed text-muted">{text}</p>
    <div className="mt-8">{action ?? <Button href={cta.href}>{cta.label}</Button>}</div>
  </div>
);

const statusStyles: Record<OrderStatus, { label: string; className: string }> = {
  processing: { label: "Processing", className: "text-deep before:bg-deep" },
  shipped: { label: "Shipped", className: "text-accent before:bg-accent" },
  delivered: { label: "Delivered", className: "text-forest before:bg-forest" },
  cancelled: { label: "Cancelled", className: "text-danger before:bg-danger" },
};

export const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const { label, className } = statusStyles[status];
  return (
    <span
      className={`inline-flex items-center gap-2 text-xs before:block before:size-1.5 before:rounded-full before:content-[''] ${className}`}
    >
      {label}
    </span>
  );
};
