import type { SiteRoute } from "@/types";

export const siteConfig = {
  name: "Birelle",
  description: "Website description",
  url: "http://localhost:3000/",
  locale: "en_IN",
  language: "en-IN",
  ogImage: "/og.png",
  keywords: [
    "",
    "",
    "",
    "",
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
};

export const siteRoutes: SiteRoute[] = [
  {
    path: "/",
    label: "Home",
    title: "Home",
    description: siteConfig.description,
    priority: 1,
  },
  {
    path: "/shop",
    label: "All Products",
    title: "All Products",
    description: "Shop the full Birelle Collection 2026.",
    priority: 0.9,
  },
  {
    path: "/lookbook",
    label: "Lookbook",
    title: "Lookbook",
    description: "Pick up a piece — an interactive lookbook of the Birelle Collection 2026.",
    priority: 0.8,
  },
  {
    path: "/about",
    label: "About",
    title: "About",
    description: "BIRELLE is a contemporary clothing brand built around the relationship between art and everyday expression.",
    priority: 0.7,
  },
];
