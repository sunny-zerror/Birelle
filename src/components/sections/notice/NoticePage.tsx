import Button from "@/components/ui/Button";

type NoticePageProps = {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
  action?: { href: string; label: string };
};

// Full-screen message in the checkout "Thank you" style — used by the token pages
// (password reset, unsubscribe, back-in-stock confirm, payment return, payment links)
const NoticePage = ({ eyebrow, title, children, action }: NoticePageProps) => (
  <section className="flex min-h-screen flex-col items-center justify-center bg-white px-gutter py-section text-center">
    <div className="flex w-full max-w-[26rem] animate-panel-in flex-col items-center">
      {eyebrow && <p className="text-xs uppercase tracking-wide text-forest">{eyebrow}</p>}
      <h1 className="primary-font mt-4 text-3xl font-normal uppercase text-ink">{title}</h1>
      {children && <div className="mt-4 w-full text-sm text-muted">{children}</div>}
      {action && (
        <Button href={action.href} className="mt-10">
          {action.label}
        </Button>
      )}
    </div>
  </section>
);

export default NoticePage;
