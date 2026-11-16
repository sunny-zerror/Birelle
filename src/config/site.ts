import type { SiteRoute } from "@/types";

export const siteConfig = {
  name: "Birelle",
  legalName: "Birelle",
  tagline: "Contemporary clothing where art meets everyday expression",
  description:
    "Shop Birelle — contemporary clothing built around art and everyday expression. Painterly tees, trousers, joggers and shorts from the Collection 2026, with complimentary express shipping over $250.",
  // Where the site is served (canonical links, sitemap, social cards, payment return), set here as in
  // SAVA; change it to https://birelle.in once the site moves there. NEXT_PUBLIC_SITE_URL overrides it
  // (e.g. http://localhost:3000 in .env.local)
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://birelle.vercel.app",
  locale: "en_IN",
  language: "en-IN",
  // Store currency (the Zcom API charges in it): the Birelle store's, set here as in SAVA
  currency: "INR",
  ogImage: "/og.png",
  logo: "/logo.svg",
  themeColor: "#ffffff",
  keywords: [
    "Birelle",
    "contemporary clothing",
    "designer streetwear",
    "printed t-shirts",
    "art-inspired fashion",
    "wide-leg trousers",
    "joggers",
    "shorts",
    "Collection 2026",
    "luxury menswear",
  ],
  // Fill these in — they appear on /contact and in the Organization structured data.
  // Empty values are hidden on the live site (in development they show as a dashed hint).
  contact: {
    phone: "", // international format, e.g. "+91 22 0000 0000"
    email: "",
    whatsapp: "", // digits with country code, e.g. "919800000000"
    hours: "", // e.g. "Monday to Saturday, 10:00 – 19:00 IST"
  },
  address: {
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "IN",
  },
  socials: {
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    youtube: "",
  },
  /** @handle for Twitter / X cards, e.g. "@birelle" */
  twitterHandle: "",
  shipping: {
    freeOver: 250,
    returnDays: 14,
  },
};

export const siteRoutes: SiteRoute[] = [
  {
    path: "/",
    label: "Home",
    title: "Birelle — Contemporary Clothing & Art-Led Streetwear",
    description: siteConfig.description,
    priority: 1,
  },
  {
    path: "/shop",
    label: "All Products",
    title: "Shop All — Tees, Trousers, Joggers & Shorts",
    description:
      "Shop the full Birelle Collection 2026: painterly printed tees, wide-leg trousers, joggers and shorts. Free express shipping over $250 and 14-day returns.",
    priority: 0.9,
  },
  {
    path: "/lookbook",
    label: "Lookbook",
    title: "Lookbook — Collection 2026",
    description:
      "Pick up a piece in the interactive Birelle lookbook and explore every look from the Collection 2026, styled and photographed.",
    priority: 0.8,
  },
  {
    path: "/contact",
    label: "Contact",
    title: "Contact Us — Client Services",
    description:
      "Questions about an order, sizing, delivery or returns? Contact Birelle Client Services by phone, email or WhatsApp, or send us a message.",
    priority: 0.5,
  },
  {
    path: "/faq",
    label: "FAQ",
    title: "FAQ — Orders, Delivery, Returns & Sizing",
    description:
      "Answers to common questions about ordering from Birelle: payment, delivery times, free shipping, returns and exchanges, sizing, and caring for printed pieces.",
    priority: 0.5,
  },
  {
    path: "/privacy-policy",
    label: "Privacy Policy",
    title: "Privacy Policy",
    description: "How Birelle collects, uses and protects your personal information when you shop with us.",
    priority: 0.2,
  },
  {
    path: "/terms",
    label: "Terms and Conditions",
    title: "Terms and Conditions",
    description: "The terms that apply to browsing and buying from the Birelle online store — orders, payment, delivery and returns.",
    priority: 0.2,
  },
  {
    path: "/cookie-policy",
    label: "Cookie Policy",
    title: "Cookie Policy",
    description: "What Birelle stores in your browser, why, and how you can control it.",
    priority: 0.2,
  },
  {
    path: "/about",
    label: "About",
    title: "About Birelle",
    description:
      "BIRELLE is a contemporary clothing brand built around the relationship between art and everyday expression. Meet the founder and the vision.",
    priority: 0.6,
  },
];
