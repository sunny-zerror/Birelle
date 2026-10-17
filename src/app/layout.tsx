import type { Metadata } from "next";
import "lenis/dist/lenis.css";
import "../styles/globals.css";
import "../styles/fonts.css";
import SiteLayout from "@/components/layout/SiteLayout";
import { createRootMetadata } from "@/lib/seo";

export const experimental = {
  viewTransition: true,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <SiteLayout>{children}</SiteLayout>
      </body>
    </html>
  );
}

export const metadata: Metadata = createRootMetadata();
