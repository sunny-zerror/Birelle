import { Link } from "next-view-transitions";
import { RiFacebookCircleFill, RiInstagramLine, RiYoutubeFill } from "@remixicon/react";
import { siteConfig } from "@/config/site";

const columns = [
  {
    title: "Support",
    links: [
      { label: "Delivery & returns", href: "/delivery-returns" },
      { label: "Your account", href: "/account" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Who We Are", href: "/about" },
      { label: "Campaign", href: "/campaign" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms and Conditions", href: "/terms" },
      { label: "Cookie Policy", href: "/cookie-policy" },
    ],
  },
];

const socials = [
  { label: "Facebook", href: siteConfig.socials.facebook, Icon: RiFacebookCircleFill },
  { label: "Instagram", href: siteConfig.socials.instagram, Icon: RiInstagramLine },
  { label: "YouTube", href: siteConfig.socials.youtube, Icon: RiYoutubeFill },
];

const Footer = () => {
  return (
    <footer className="site-footer relative flex h-dvh flex-col overflow-hidden text-ink md:block">
      {/* Painted garden scene — transparent sky leaves room for the links (mobile: below them) */}
      <img
        src="/images/footer/footer_bg.png"
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
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <Link href="/newsletter" className="group inline-flex items-center gap-1 text-sm font-semibold transition-opacity hover:opacity-60">
              Newsletter
              <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>

        <div className=" mt-12 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-[16vw_16vw_14.5vw_auto] md:gap-0">
          <ul className="flex items-center gap-4">
            {socials.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="block transition-opacity hover:opacity-60"
                >
                  <Icon size={22} />
                </a>
              </li>
            ))}
          </ul>
          <div className=""></div>
          <p className="text-sm ">
            ©{new Date().getFullYear()} {siteConfig.name}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
