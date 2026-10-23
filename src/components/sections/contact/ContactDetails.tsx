import { Link } from "next-view-transitions";
import {
  RiArrowRightUpLine,
  RiMailLine,
  RiMapPinLine,
  RiPhoneLine,
  RiTimeLine,
  RiWhatsappLine,
  type RemixiconComponentType,
} from "@remixicon/react";
import { siteConfig } from "@/config/site";
import { formatPrice } from "@/data/products";

const ease = "ease-[cubic-bezier(0.22,1,0.36,1)]";
const isDev = process.env.NODE_ENV !== "production";

const { contact, address, shipping } = siteConfig;
const fullAddress = [address.street, address.city, address.state, address.postalCode].filter(Boolean).join(", ");

type Channel = { label: string; value: string; href: string; Icon: RemixiconComponentType; setting: string };

const channels: Channel[] = [
  { label: "Call us", value: contact.phone, href: `tel:${contact.phone.replace(/[^\d+]/g, "")}`, Icon: RiPhoneLine, setting: "contact.phone" },
  { label: "Email", value: contact.email, href: `mailto:${contact.email}`, Icon: RiMailLine, setting: "contact.email" },
  {
    label: "WhatsApp",
    value: contact.whatsapp && "Chat with a Client Advisor",
    href: `https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`,
    Icon: RiWhatsappLine,
    setting: "contact.whatsapp",
  },
];

// Development only: shows which config value to fill in. Empty values are simply hidden in production.
const Missing = ({ setting }: { setting: string }) => (
  <span className="border border-dashed border-ink/25 px-2 py-0.5 text-xs text-muted">Set siteConfig.{setting}</span>
);

const quickHelp = [
  { label: "Track an order", href: "/account/orders" },
  { label: "Manage your account", href: "/account/settings" },
  { label: "Our story", href: "/about" },
];

const SubHeading = ({ children }: { children: React.ReactNode }) => (
  <h2 className="secondary-font text-xs uppercase tracking-wide text-ink">{children}</h2>
);

const ContactDetails = () => (
  <div className="contact-details flex flex-col gap-12">
    {/* Direct channels */}
    <section aria-labelledby="contact-advisors">
      <SubHeading>
        <span id="contact-advisors">Speak to a Client Advisor</span>
      </SubHeading>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
        Wherever you are, our Client Advisors will be delighted to help with orders, sizing, styling and anything
        in between.
      </p>

      <ul className="mt-6 divide-y divide-line border-y border-line">
        {channels
          .filter((c) => c.value || isDev)
          .map(({ label, value, href, Icon, setting }) => (
            <li key={label}>
              {value ? (
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="group flex items-center gap-4 py-5"
                >
                  <Icon size={18} aria-hidden="true" className="shrink-0 text-ink" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs text-muted">{label}</span>
                    <span className="mt-1 block truncate text-sm text-ink">{value}</span>
                  </span>
                  <RiArrowRightUpLine
                    size={16}
                    aria-hidden="true"
                    className={`shrink-0 text-ink transition-transform duration-500 ${ease} group-hover:-translate-y-0.5 group-hover:translate-x-0.5`}
                  />
                </a>
              ) : (
                <div className="flex items-center gap-4 py-5">
                  <Icon size={18} aria-hidden="true" className="shrink-0 text-muted" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs text-muted">{label}</span>
                    <span className="mt-1.5 block">
                      <Missing setting={setting} />
                    </span>
                  </span>
                </div>
              )}
            </li>
          ))}
      </ul>
    </section>

    {/* Hours + studio */}
    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      {(contact.hours || isDev) && (
        <section aria-labelledby="contact-hours">
          <SubHeading>
            <span id="contact-hours" className="flex items-center gap-2">
              <RiTimeLine size={14} aria-hidden="true" /> Opening hours
            </span>
          </SubHeading>
          <p className="mt-4 text-sm leading-relaxed text-ink">
            {contact.hours || <Missing setting="contact.hours" />}
          </p>
          <p className="mt-2 text-xs text-muted">Messages sent outside these hours are answered the next working day.</p>
        </section>
      )}

      {(fullAddress || isDev) && (
        <section aria-labelledby="contact-studio">
          <SubHeading>
            <span id="contact-studio" className="flex items-center gap-2">
              <RiMapPinLine size={14} aria-hidden="true" /> Studio
            </span>
          </SubHeading>
          {fullAddress ? (
            <>
              <address className="mt-4 text-sm not-italic leading-relaxed text-ink">
                {siteConfig.legalName}
                <br />
                {fullAddress}
              </address>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-xs text-ink underline underline-offset-4 transition-opacity hover:opacity-60"
              >
                Get directions
              </a>
            </>
          ) : (
            <p className="mt-4">
              <Missing setting="address" />
            </p>
          )}
        </section>
      )}
    </div>

    {/* Delivery promise + shortcuts */}
    <section aria-labelledby="contact-help" className="bg-neutral-100 p-6 md:p-8">
      <SubHeading>
        <span id="contact-help">Quick help</span>
      </SubHeading>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        Complimentary express shipping on orders over {formatPrice(shipping.freeOver)} and {shipping.returnDays}-day
        returns on every piece.
      </p>
      <ul className="mt-6 flex flex-col gap-3">
        {quickHelp.map(({ label, href }) => (
          <li key={href}>
            <Link href={href} className="group inline-flex items-center gap-2 text-sm text-ink">
              <span className="underline-offset-4 group-hover:underline">{label}</span>
              <RiArrowRightUpLine size={14} aria-hidden="true" className={`transition-transform duration-500 ${ease} group-hover:translate-x-0.5`} />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  </div>
);

export default ContactDetails;
