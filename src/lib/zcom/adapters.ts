/**
 * Zcom → Birelle shapes. The design components keep their own types
 * (Product, User, Address, Order, Look); only these adapters know the API.
 */

import { getCountryCallingCode, parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";
import {
  getAssets,
  getDefaultVariant,
  getFeaturedImage,
  getHoverImage,
  getVariants,
  htmlToText,
  isVariantPurchasable,
} from "@zcom/storefront-kit/core";
import type {
  AddressFieldsFragment,
  AddressInput,
  GetLookbookQuery,
  GetLookbooksQuery,
  OrderSummaryFieldsFragment,
  ProductCardFieldsFragment,
  ProductDetailFieldsFragment,
  ProfileFieldsFragment,
} from "@zcom/storefront-kit/graphql";
import type { Address, Look, Order, OrderStatus, Product, User } from "@/types";

// ─── Options ──────────────────────────────────────────────────────────────────

const SIZE_OPTION = /^sizes?$/i;
const COLOUR_OPTION = /^colou?rs?$/i;
export const ONE_SIZE = "One Size";

type ZcomProduct = ProductCardFieldsFragment | ProductDetailFieldsFragment;

const optionIndex = (product: ZcomProduct, pattern: RegExp) =>
  (product.productOptions ?? []).findIndex((o) => !!o && pattern.test(o.optionName));

const choicesOf = (product: ZcomProduct, index: number): string[] =>
  index < 0
    ? []
    : (product.productOptions?.[index]?.choices ?? []).flatMap((c) => (c?.name ? [c.name] : []));

// ─── Products ─────────────────────────────────────────────────────────────────

const PLACEHOLDER_IMAGE = "/og.png";

export const toProduct = (p: ZcomProduct, extra: { isNew?: boolean; categorySlugs?: Record<string, string> } = {}): Product => {
  const slug = p.slug ?? p._id;
  const variant = getDefaultVariant(p);
  const sizeAt = optionIndex(p, SIZE_OPTION);
  const colourAt = optionIndex(p, COLOUR_OPTION);
  const images = getAssets(p).filter((a) => a.type !== "VIDEO");
  const image = getFeaturedImage(p)?.path ?? images[0]?.path ?? PLACEHOLDER_IMAGE;
  const featured =
    getHoverImage(p)?.path ?? images.find((a) => a.path !== image)?.path ?? image;
  const categoryId = p.categoryIds?.find(Boolean) ?? "";
  const detail = p as Partial<ProductDetailFieldsFragment>;
  const categorySlug =
    detail.categories?.find(Boolean)?.slug ?? extra.categorySlugs?.[categoryId] ?? "";

  return {
    id: slug,
    title: p.name,
    category: categorySlug,
    price: variant?.price ?? 0,
    href: `/shop/${slug}`,
    image,
    featured,
    colour: colourAt >= 0 ? (variant?.optionValues?.[colourAt] ?? choicesOf(p, colourAt)[0] ?? "") : "",
    colours: choicesOf(p, colourAt),
    sizes: sizeAt >= 0 ? choicesOf(p, sizeAt) : [ONE_SIZE],
    description: htmlToText(detail.description ?? "", 2000),
    isNew: extra.isNew,
    zcom: {
      productId: p._id,
      optionNames: (p.productOptions ?? []).map((o) => o?.optionName ?? ""),
      variants: getVariants(p).flatMap((v) =>
        v._id
          ? [{
              id: v._id,
              values: (v.optionValues ?? []).map((x) => x ?? ""),
              price: v.price,
              purchasable: isVariantPurchasable(v),
            }]
          : [],
      ),
    },
  };
};

/** The Zcom variant for a size + colour picked in the design. */
export const findVariantId = (product: Product, size: string, colour?: string): string | null => {
  const ref = product.zcom;
  if (!ref) return null;
  const sizeAt = ref.optionNames.findIndex((n) => SIZE_OPTION.test(n));
  const colourAt = ref.optionNames.findIndex((n) => COLOUR_OPTION.test(n));
  const same = (a = "", b = "") => a.toLowerCase() === b.toLowerCase();
  const match = ref.variants.find(
    (v) =>
      (sizeAt < 0 || size === ONE_SIZE || same(v.values[sizeAt], size)) &&
      (colourAt < 0 || !colour || same(v.values[colourAt], colour)),
  );
  return match?.id ?? ref.variants[0]?.id ?? null;
};

/** Size and colour of a variant, for cart and order lines. */
export const variantLabels = (product: Product | undefined, variantId: string | null | undefined) => {
  const ref = product?.zcom;
  const variant = ref?.variants.find((v) => v.id === variantId);
  if (!ref || !variant) return { size: ONE_SIZE, colour: product?.colour ?? "" };
  const sizeAt = ref.optionNames.findIndex((n) => SIZE_OPTION.test(n));
  const colourAt = ref.optionNames.findIndex((n) => COLOUR_OPTION.test(n));
  return {
    size: sizeAt >= 0 ? (variant.values[sizeAt] ?? ONE_SIZE) : ONE_SIZE,
    colour: colourAt >= 0 ? (variant.values[colourAt] ?? "") : (product?.colour ?? ""),
  };
};

/** Whether a size (with the chosen colour) can still be bought. */
export const isSizeAvailable = (product: Product, size: string, colour?: string) => {
  const ref = product.zcom;
  if (!ref) return true;
  const sizeAt = ref.optionNames.findIndex((n) => SIZE_OPTION.test(n));
  const colourAt = ref.optionNames.findIndex((n) => COLOUR_OPTION.test(n));
  const same = (a = "", b = "") => a.toLowerCase() === b.toLowerCase();
  return ref.variants.some(
    (v) =>
      v.purchasable &&
      (sizeAt < 0 || size === ONE_SIZE || same(v.values[sizeAt], size)) &&
      (colourAt < 0 || !colour || same(v.values[colourAt], colour)),
  );
};

// ─── Phone (Zcom keeps "+91" dial codes, the design keeps "IN") ────────────────

export const toDialCode = (country: CountryCode) => `+${getCountryCallingCode(country)}`;

export const fromDialCode = (dial: string | null | undefined, national: string | null | undefined, fallback: CountryCode = "IN"): CountryCode => {
  if (!dial) return fallback;
  if (/^[A-Z]{2}$/.test(dial)) return dial as CountryCode;
  const parsed = parsePhoneNumberFromString(`${dial.startsWith("+") ? dial : `+${dial}`}${national ?? ""}`);
  return parsed?.country ?? fallback;
};

// ─── Account ──────────────────────────────────────────────────────────────────

export const toUser = (p: ProfileFieldsFragment): User => ({
  id: p._id,
  firstName: p.firstName ?? "",
  lastName: p.lastName ?? "",
  email: p.email,
  phoneCountry: fromDialCode(p.countryCode, p.phoneNumber),
  phone: p.phoneNumber ?? "",
  createdAt: p.createdAt ?? new Date().toISOString(),
  marketingEmails: p.emailSubscribedStatus === 1,
  smsUpdates: false,
});

const splitName = (name: string) => {
  const parts = name.trim().split(/\s+/);
  return { firstname: parts[0] ?? "", lastname: parts.slice(1).join(" ") };
};

export const toAddress = (a: AddressFieldsFragment): Address => ({
  id: a._id,
  label: a.addressType ?? "",
  name: [a.firstname, a.lastname].filter(Boolean).join(" "),
  phoneCountry: fromDialCode(a.countryCode, a.phone),
  phone: a.phone ?? "",
  country: a.country ?? "",
  city: a.city ?? "",
  line1: a.addressline1 ?? "",
  line2: a.addressline2 ?? "",
  postalCode: a.pincode ?? "",
  isDefault: a.primary === true,
});

export const fromAddress = (a: Omit<Address, "id">, email?: string): AddressInput => ({
  ...splitName(a.name),
  email,
  addressType: a.label || undefined,
  phone: a.phone,
  countryCode: toDialCode(a.phoneCountry),
  country: a.country,
  city: a.city,
  addressline1: a.line1,
  addressline2: a.line2 || undefined,
  pincode: a.postalCode,
  primary: a.isDefault,
});

// ─── Orders ───────────────────────────────────────────────────────────────────

const STATUS: Record<string, OrderStatus> = {
  AWAITING_PAYMENT: "processing",
  CONFIRMED: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  RETURN_IN_PROGRESS: "delivered",
  RETURNED: "delivered",
  REFUNDED: "cancelled",
  PARTIALLY_REFUNDED: "delivered",
  RETURNED_TO_ORIGIN: "cancelled",
  DELIVERY_ISSUE: "shipped",
};

export const toOrder = (o: OrderSummaryFieldsFragment, findProduct: (zcomId: string) => Product | undefined): Order => {
  const lines = (o.cart ?? []).flatMap((l) => {
    if (!l) return [];
    const product = findProduct(l.productId);
    const { size, colour } = variantLabels(product, l.variantId);
    return [{
      productId: product?.id ?? l.productId,
      title: l.name,
      image: l.asset?.path ?? product?.image ?? PLACEHOLDER_IMAGE,
      href: product?.href ?? "/shop",
      colour,
      size,
      qty: l.qty,
      price: l.finalPrice ?? l.price,
    }];
  });
  const subtotal = o.discountedPrice ?? o.totalprice ?? 0;
  const shipping = o.shippingAmount ?? 0;
  const a = o.shippingAddress;
  return {
    id: o._id,
    number: o.orderNo ?? o._id,
    placedAt: o.createdAt ?? new Date().toISOString(),
    status: STATUS[o.displayStatus ?? ""] ?? "processing",
    lines,
    subtotal,
    shipping,
    total: o.orderPrice ?? subtotal + shipping,
    payment: o.paymentMethod ?? (o.paymentStatus === "PAID" ? "Paid online" : "Awaiting payment"),
    shipTo: {
      name: [a?.firstname, a?.lastname].filter(Boolean).join(" "),
      line1: a?.addressline1 ?? "",
      line2: a?.addressline2 ?? "",
      city: a?.city ?? "",
      postalCode: a?.pincode ?? "",
      country: a?.country ?? "",
      phone: a?.phone ?? "",
    },
  };
};

// ─── Lookbook ─────────────────────────────────────────────────────────────────

type ListLookbook = GetLooksbooksItem;
type GetLooksbooksItem = GetLookbooksQuery["getClientSideLookbooks"]["lookbooks"][number];
type DetailLookbook = NonNullable<GetLookbookQuery["getClientSideLookbook"]>;

const paragraphs = (html: string | null | undefined) =>
  (html ?? "")
    .split(/<\/p>|<br\s*\/?>|\n{2,}/i)
    .map((part) => htmlToText(part, 2000))
    .filter(Boolean);

/**
 * A same-origin copy of a CDN image, served through the Next image optimizer. The 3D hero and the
 * curated carousel read their artwork in WebGL, which needs CORS headers the media CDN doesn't send.
 * `width` must be one of the optimizer's sizes.
 */
export const sameOrigin = (url: string, width = 640) =>
  /^https?:\/\//.test(url) ? `/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=75` : url;

export const toLook = (l: ListLookbook | DetailLookbook, index: number): Look => {
  const detail = l as Partial<DetailLookbook>;
  const photos = (detail.looks ?? []).flatMap((look) =>
    look.media
      .filter((m) => m.type === "IMAGE")
      .map((m) => ({ src: m.url, width: m.width ?? 1600, height: m.height ?? 2400 })),
  );
  const cover = l.cover?.url ?? photos[0]?.src ?? "";
  return {
    id: index + 1,
    slug: l.slug,
    title: l.title,
    // The 3D hero drops the cut-out artwork: the mobile cover when set, else the cover
    src: cover,
    rain: sameOrigin(l.coverMobile?.url ?? cover),
    category: l.tags[0] ?? "",
    season: l.subtitle ?? "",
    story: paragraphs(detail.intro).length ? paragraphs(detail.intro) : [l.seo?.description ?? ""].filter(Boolean),
    photos,
  };
};
