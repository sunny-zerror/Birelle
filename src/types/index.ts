import type { CountryCode } from "libphonenumber-js";

export interface SiteRoute {
  path: string;
  label?: string;
  title: string;
  description: string;
  priority: number;
}

// Zcom category slug (e.g. "tees", "bottoms", "shorts")
export type ProductCategory = string;

/** Link from a storefront product to its Zcom record, for the cart and wishlist */
export interface ZcomProductRef {
  productId: string;
  /** Option names in Zcom order, e.g. ["Size", "Colour"] */
  optionNames: string[];
  variants: {
    id: string;
    values: string[];
    price: number;
    purchasable: boolean;
  }[];
}

export interface Product {
  id: string; // URL slug
  title: string;
  category: ProductCategory;
  price: number;
  href: string;
  image: string; // packshot on hanger
  featured: string; // model shot
  colour: string; // default colour
  colours?: string[]; // every colour it comes in — falls back to [colour]
  sizes?: string[]; // sizes from the store's options
  description: string; // plain text
  isNew?: boolean;
  pairsWith?: string; // product id shown in "Complete the look"
  zcom?: ZcomProductRef;
}

export interface LookPhoto {
  src: string;
  width: number;
  height: number;
}

export interface Look {
  id: number;
  slug: string; // /lookbook/[slug]
  title: string;
  src: string; // full-size artwork (look view)
  rain: string; // trimmed light texture (falling cloth)
  category: string;
  season: string;
  story: string[];
  photos: LookPhoto[]; // editorial photography on the look page
}

export interface Country {
  code: CountryCode; // ISO 3166-1 alpha-2, e.g. "IN"
  name: string;
  dialCode: string; // "+91"
  flag: string; // flag image URL
}

// --- Account ---------------------------------------------------------------

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneCountry: CountryCode;
  phone: string; // national number
  createdAt: string; // ISO date
  marketingEmails: boolean;
  smsUpdates: boolean;
}

export interface Address {
  id: string;
  label: string; // "Home", "Work"…
  name: string;
  phoneCountry: CountryCode;
  phone: string;
  country: string;
  city: string;
  line1: string;
  line2: string;
  postalCode: string;
  isDefault: boolean;
}

export type OrderStatus = "processing" | "shipped" | "delivered" | "cancelled";

// Snapshot of the product at the time of purchase, so later catalogue edits don't rewrite history
export interface OrderLine {
  productId: string;
  title: string;
  image: string;
  href: string;
  colour: string;
  size: string;
  qty: number;
  price: number;
}

export interface Order {
  id?: string; // Zcom order id
  number: string; // "BRL-482913"
  placedAt: string; // ISO date
  status: OrderStatus;
  lines: OrderLine[];
  subtotal: number;
  shipping: number;
  total: number;
  payment: string;
  shipTo: Pick<Address, "name" | "line1" | "line2" | "city" | "postalCode" | "country"> & { phone: string };
}
