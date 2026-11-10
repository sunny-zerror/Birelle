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
    <html lang={siteConfig.language}>
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
