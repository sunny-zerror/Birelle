import type { Metadata } from "next";
import { siteConfig, siteRoutes } from "@/config/site";
import type { SiteRoute } from "@/types";
import { absoluteUrl, normalizePath } from "@/utils/url";

interface CreateMetadataOptions {
  title?: string;
  /** skip the "| Birelle" title template (home page, brand-led titles) */
  absoluteTitle?: boolean;
  description?: string;
  path?: string;
  image?: string;
  imageAlt?: string;
  keywords?: string[];
  type?: "website" | "article";
  noIndex?: boolean;
  /** extra <meta> tags, e.g. product price */
  other?: Record<string, string>;
}

export function getPageSeo(path = "/"): SiteRoute {
  const normalizedPath = normalizePath(path);
  return (
    siteRoutes.find((route) => route.path === normalizedPath) || {
      path: normalizedPath,
      title: siteConfig.name,
      description: siteConfig.description,
      priority: 0.5,
    }
  );
}

export function createMetadata({
  title,
  absoluteTitle = false,
  description = siteConfig.description,
  path = "/",
  image = siteConfig.ogImage,
  imageAlt,
  keywords = siteConfig.keywords,
  type = "website",
  noIndex = false,
  other,
}: CreateMetadataOptions = {}): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);
  const pageTitle = title || siteConfig.name;
  // Titles that already carry the brand skip the "| Birelle" template (social cards get it added by hand)
  const branded = absoluteTitle || pageTitle.includes(siteConfig.name);
  const socialTitle = branded ? pageTitle : `${pageTitle} | ${siteConfig.name}`;
  const isDefaultImage = image === siteConfig.ogImage;

  return {
    metadataBase: new URL(siteConfig.url),
    title: branded ? { absolute: pageTitle } : pageTitle,
    description,
    keywords,
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.name, url: absoluteUrl("/") }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    category: "shopping",
    formatDetection: { telephone: false, address: false, email: false },
    robots: noIndex
      ? { index: false, follow: true, googleBot: { index: false, follow: true } }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    // Hidden pages (checkout, wishlist, 404) clear the canonical they would inherit from the root
    alternates: { canonical: noIndex ? null : url },
    openGraph: {
      type,
      locale: siteConfig.locale,
      siteName: siteConfig.name,
      title: socialTitle,
      description,
      url,
      images: [
        {
          url: imageUrl,
          // Only the shared OG card has known dimensions
          ...(isDefaultImage ? { width: 1200, height: 628 } : {}),
          alt: imageAlt || pageTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [imageUrl],
      ...(siteConfig.twitterHandle ? { site: siteConfig.twitterHandle, creator: siteConfig.twitterHandle } : {}),
    },
    icons: {
      icon: [{ url: "/favicon.ico", sizes: "any" }, { url: "/logo.svg", type: "image/svg+xml" }],
      shortcut: "/favicon.ico",
      apple: "/logo.PNG",
    },
    other,
  };
}

export function createRootMetadata(): Metadata {
  return {
    ...createMetadata(),
    title: {
      default: `${siteConfig.name} — ${siteConfig.tagline}`,
      template: `%s | ${siteConfig.name}`,
    },
  };
}

export function createPageMetadata(path: string): Metadata {
  const page = getPageSeo(path);

  return createMetadata({
    title: page.title,
    absoluteTitle: page.path === "/",
    description: page.description,
    path: page.path,
  });
}
