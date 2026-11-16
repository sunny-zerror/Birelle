import { CONSENT_DEFAULT_SCRIPT } from "@zcom/storefront-kit/core";
import type { Metadata, Viewport } from "next";
import "lenis/dist/lenis.css";
import "../styles/globals.css";
import "../styles/fonts.css";
import SiteLayout from "@/components/layout/SiteLayout";
import JsonLd from "@/components/seo/JsonLd";
import { siteConfig } from "@/config/site";
import { createRootMetadata } from "@/lib/seo";
import { organizationSchema, websiteSchema } from "@/lib/schema";
import { getCatalog, getLooks } from "@/lib/zcom/catalog";

// Catalogue from the Zcom store, refreshed every minute
export const revalidate = 60;

export const experimental = {
  viewTransition: true,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [{ products, categories }, looks] = await Promise.all([getCatalog(), getLooks()]);
  return (
    // suppressHydrationWarning: the consent script below stamps data-zcom-consent on <html> before React loads
    <html lang={siteConfig.language} suppressHydrationWarning>
      <head>
        {/* Zcom consent defaults (a returning shopper's stored choice) before any tag loads; a plain
            <script>, since next/script's beforeInteractive runs after the first paint (kit README §4) */}
        <script id="zcom-consent" dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULT_SCRIPT }} />
      </head>
      <body suppressHydrationWarning>
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <SiteLayout products={products} categories={categories} looks={looks}>
          {children}
        </SiteLayout>
      </body>
    </html>
  );
}

export const metadata: Metadata = createRootMetadata();

export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};
