/*
 * schema.org structured data (JSON-LD) for rich results — products with price
 * and availability, breadcrumbs, the brand and the catalogue listing.
 */
import { siteConfig } from "@/config/site";
import { getColours } from "@/data/products";
import type { Look, Product } from "@/types";
import { absoluteUrl } from "@/utils/url";

type Crumb = { name: string; path: string };

const ORG_ID = absoluteUrl("/#organization");
const SITE_ID = absoluteUrl("/#website");

const sameAs = () => Object.values(siteConfig.socials).filter(Boolean);

// Prices stay valid for a year from the build; refreshed on every deploy
const priceValidUntil = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
};

export const organizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "ClothingStore",
  "@id": ORG_ID,
  name: siteConfig.name,
  legalName: siteConfig.legalName,
  description: siteConfig.description,
  url: absoluteUrl("/"),
  logo: absoluteUrl(siteConfig.logo),
  image: absoluteUrl(siteConfig.ogImage),
  currenciesAccepted: siteConfig.currency,
  ...(siteConfig.contact.email ? { email: siteConfig.contact.email } : {}),
  ...(siteConfig.contact.phone ? { telephone: siteConfig.contact.phone } : {}),
  ...(siteConfig.address.city
    ? {
        address: {
          "@type": "PostalAddress",
          streetAddress: siteConfig.address.street,
          addressLocality: siteConfig.address.city,
          addressRegion: siteConfig.address.state,
          postalCode: siteConfig.address.postalCode,
          addressCountry: siteConfig.address.country,
        },
      }
    : {}),
  ...(sameAs().length ? { sameAs: sameAs() } : {}),
});

export const websiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": SITE_ID,
  name: siteConfig.name,
  url: absoluteUrl("/"),
  inLanguage: siteConfig.language,
  publisher: { "@id": ORG_ID },
});

export const breadcrumbSchema = (crumbs: Crumb[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [{ name: "Home", path: "/" }, ...crumbs].map((c, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: c.name,
    item: absoluteUrl(c.path),
  })),
});

const offerFor = (product: Product) => ({
  "@type": "Offer",
  url: absoluteUrl(product.href),
  priceCurrency: siteConfig.currency,
  price: product.price.toFixed(2),
  priceValidUntil: priceValidUntil(),
  availability: "https://schema.org/InStock",
  itemCondition: "https://schema.org/NewCondition",
  seller: { "@id": ORG_ID },
  // Only the free-shipping threshold is known; add a paid rate here once it's set
  ...(product.price >= siteConfig.shipping.freeOver
    ? {
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingRate: { "@type": "MonetaryAmount", value: 0, currency: siteConfig.currency },
          shippingDestination: { "@type": "DefinedRegion", addressCountry: siteConfig.address.country },
        },
      }
    : {}),
  hasMerchantReturnPolicy: {
    "@type": "MerchantReturnPolicy",
    applicableCountry: siteConfig.address.country,
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: siteConfig.shipping.returnDays,
    returnMethod: "https://schema.org/ReturnByMail",
  },
});

export const productSchema = (product: Product) => {
  const colours = getColours(product);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": absoluteUrl(`${product.href}#product`),
    name: product.title,
    description: product.description,
    sku: product.id,
    url: absoluteUrl(product.href),
    image: [absoluteUrl(product.image), absoluteUrl(product.featured)],
    brand: { "@type": "Brand", name: siteConfig.name },
    category: `Apparel > ${product.category[0].toUpperCase()}${product.category.slice(1)}`,
    color: colours.join(", "),
    offers: offerFor(product),
  };
};

export const productListSchema = (products: Product[], name: string, path: string) => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name,
  url: absoluteUrl(path),
  isPartOf: { "@id": SITE_ID },
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(p.href),
      name: p.title,
    })),
  },
});

export const lookSchema = (look: Look) => ({
  "@context": "https://schema.org",
  "@type": "ImageGallery",
  name: `${look.title} — ${siteConfig.name} Lookbook`,
  description: look.story[0],
  url: absoluteUrl(`/lookbook/${look.slug}`),
  isPartOf: { "@id": SITE_ID },
  image: look.photos.map((p) => ({
    "@type": "ImageObject",
    contentUrl: absoluteUrl(p.src),
    width: p.width,
    height: p.height,
  })),
});
