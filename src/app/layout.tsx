import type { Metadata, Viewport } from "next";
import "lenis/dist/lenis.css";
import "../styles/globals.css";
import "../styles/fonts.css";
import SiteLayout from "@/components/layout/SiteLayout";
import JsonLd from "@/components/seo/JsonLd";
import { siteConfig } from "@/config/site";
import { createRootMetadata } from "@/lib/seo";
import { organizationSchema, websiteSchema } from "@/lib/schema";

export const experimental = {
  viewTransition: true,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={siteConfig.language}>
      <body suppressHydrationWarning>
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <SiteLayout>{children}</SiteLayout>
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
