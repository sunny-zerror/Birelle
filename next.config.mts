import { buildSecurityHeaders } from "@zcom/storefront-kit/core";
import type { NextConfig } from "next";

// CSP and security headers from the Zcom kit: the platform media CDN, the payment apps, GA4/GTM and the
// Meta/Google ad tags are built in. 'unsafe-eval' and no HSTS in development. (An .mts file: the kit
// is ESM only, and Next loads a plain next.config.ts as CommonJS.)
const securityHeaders = buildSecurityHeaders({
  development: process.env.NODE_ENV !== "production",
  reportOnly: process.env.CSP_REPORT_ONLY === "true",
});

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Product and lookbook images uploaded in Zcom are served from the Zcom media CDN
  images: {
    remotePatterns: [{ protocol: "https", hostname: "media.zerrorstudios.com" }],
  },
  // The wishlist moved into the account dashboard (which asks for sign-in)
  async redirects() {
    return [{ source: "/wishlist", destination: "/account/wishlist", permanent: true }];
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
