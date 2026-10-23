import { FaqContent } from "@/components/sections/faq";
import JsonLd from "@/components/seo/JsonLd";
import { faqGroups } from "@/data/faq";
import { createPageMetadata } from "@/lib/seo";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";

const FaqPage = () => {
  return (
    <>
      <JsonLd
        data={[breadcrumbSchema([{ name: "FAQ", path: "/faq" }]), faqSchema(faqGroups.flatMap((g) => g.items))]}
      />
      <section className="faq bg-white pb-section pt-[calc(var(--spacing-header)+2.5rem)] md:pt-[calc(var(--spacing-header)+4.5rem)]">
        <div className="container">
          <header className="max-w-3xl animate-panel-in">
            <p className="text-xs uppercase tracking-wide text-muted">Help</p>
            <h1 className="primary-font mt-4 text-3xl font-normal uppercase text-ink md:text-5xl">
              Frequently asked questions
            </h1>
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              Orders, delivery, returns, sizing and caring for your pieces — the answers to what we&apos;re asked most.
            </p>
          </header>
          <FaqContent />
        </div>
      </section>
    </>
  );
};

export default FaqPage;

export async function generateMetadata() {
  return createPageMetadata("/faq");
}
