import { Link } from "next-view-transitions";
import { siteConfig } from "@/config/site";

const columns = [
    {
    title: "Company",
    links: [
      { label: "Who We Are", href: "/about" },
      { label: "Campaign", href: "/campaign" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Delivery & returns", href: "/faq#delivery" },
      { label: "FAQ", href: "/faq" },
      { label: "Your account", href: "/account" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms and Conditions", href: "/terms" },
      { label: "Cookie Policy", href: "/cookie-policy" },
      { label: "Faq", href: "/faq" },
    ],
  },
];

// Accounts come from src/config/site.ts — each one links once its URL is filled in
const socials = [
  { label: "Instagram", href: siteConfig.socials.instagram },
  { label: "Facebook", href: siteConfig.socials.facebook },
  { label: "YouTube", href: siteConfig.socials.youtube },
];

const STUDIO_URL = "https://zerrorstudios.com";

const Footer = () => {
  return (
    <footer className="site-footer relative flex h-[calc(100dvh-var(--spacing-header-bar))] flex-col overflow-hidden text-ink md:block">
      {/* Painted garden scene — transparent sky leaves room for the links (mobile: below them) */}
      <img
        src="/images/footer/footer.webp"
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="site-footer__art pointer-events-none order-last -mt-[15vw] block min-h-0 w-full flex-1 object-cover object-bottom md:absolute md:inset-0 md:mt-0 md:h-full"
      />

      <div className="site-footer__inner container relative z-10 pt-section md:px-[7vw] ">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-[16vw_16vw_14.5vw_auto] md:gap-0">
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="secondary-font text-sm font-semibold">{col.title}</h2>
              <ul className="mt-4 space-y-3 text-sm">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="transition-opacity hover:opacity-60">
                      <span className="link-line">{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <nav aria-label="Follow us">
            <h2 className="secondary-font text-sm font-semibold">Follow</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {socials.map(({ label, href }) => (
                <li key={label}>
                  {href ? (
                    <Link href={href} target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-60">
                      <span className="link-line">{label}</span>
                    </Link>
                  ) : (
                    <span>{label}</span>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Legal line + studio credit */}
        <div className="mt-12 space-y-1.5 text-sm  ">
          <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
          <p>
            Developed by{" "}
            <Link href={STUDIO_URL} target="_blank" rel="noopener noreferrer" className="text-ink transition-opacity hover:opacity-60">
              <span className="link-line">Zerror Studios</span>
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
