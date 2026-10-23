import { Link } from "next-view-transitions";
import { RiArrowRightLine } from "@remixicon/react";
import Button from "@/components/ui/Button";
import type { OrderStatus } from "@/types";

export const ease = "ease-[cubic-bezier(0.22,1,0.36,1)]";

// Page title for each dashboard tab, with an optional action on the right
export const AccountHeading = ({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) => (
  <header className="account-heading flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
    <div>
      <h1 className="primary-font text-2xl font-normal uppercase text-ink md:text-3xl">{title}</h1>
      {description && <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">{description}</p>}
    </div>
    {action}
  </header>
);

// Hairline-bordered block — the dashboard's only container style
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
  <section className={`account-panel border border-line p-5 md:p-6 ${className}`}>
    {(title || action) && (
      <div className="mb-5 flex items-baseline justify-between gap-4">
        {title && <h2 className="secondary-font text-xs uppercase tracking-wide text-ink">{title}</h2>}
        {action}
      </div>
    )}
    {children}
  </section>
);

// Small underlined link with an arrow that nudges on hover
export const ArrowLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link
    href={href}
    className="group inline-flex shrink-0 items-center gap-1.5 text-xs text-ink underline-offset-4 transition-opacity hover:underline"
  >
    {children}
    <RiArrowRightLine size={12} className={`transition-transform duration-500 ${ease} group-hover:translate-x-0.5`} />
  </Link>
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
  <div className="flex animate-panel-in flex-col items-center px-4 py-16 text-center md:py-24">
    <p className="primary-font text-xl text-ink">{title}</p>
    <p className="mt-3 max-w-[20rem] text-sm leading-relaxed text-muted">{text}</p>
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
