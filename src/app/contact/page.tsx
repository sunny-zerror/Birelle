import { ContactDetails, ContactForm } from "@/components/sections/contact";
import JsonLd from "@/components/seo/JsonLd";
import { createPageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";

// Company details on the left, enquiry form on the right — stacked in the same order on smaller screens
const ContactPage = () => {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Contact", path: "/contact" }])} />
      <section className="contact bg-white pb-section pt-[calc(var(--spacing-header)+2.5rem)] md:pt-[calc(var(--spacing-header)+4.5rem)]">
        <div className="container">
          <header className="contact__intro max-w-2xl animate-panel-in">
            <p className="text-xs uppercase tracking-wide text-muted">Client Services</p>
            <h1 className="primary-font mt-4 text-3xl font-normal uppercase text-ink md:text-5xl">Contact us</h1>
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              A question about an order, a fit, or a piece you have your eye on? Reach us directly or send a message
              below — we read every one.
            </p>
          </header>

          <div className="mt-12 grid gap-14 border-t border-line pt-10 md:mt-16 md:pt-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20 xl:gap-28">
            <ContactDetails />
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactPage;

export async function generateMetadata() {
  return createPageMetadata("/contact");
}
