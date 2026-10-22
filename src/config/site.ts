import type { SiteRoute } from "@/types";

export const siteConfig = {
  name: "Birelle",
  legalName: "Birelle",
  tagline: "Contemporary clothing where art meets everyday expression",
  description:
    "Shop Birelle — contemporary clothing built around art and everyday expression. Painterly tees, trousers, joggers and shorts from the Collection 2026, with complimentary express shipping over $250.",
  // Set NEXT_PUBLIC_SITE_URL to the production domain (e.g. https://birelle.com)
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  locale: "en_IN",
  language: "en-IN",
  currency: "USD",
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
  contact: {
    phone: "",
    email: "",
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
    path: "/about",
    label: "About",
    title: "About Birelle",
    description:
      "BIRELLE is a contemporary clothing brand built around the relationship between art and everyday expression. Meet the founder and the vision.",
    priority: 0.6,
  },
];
