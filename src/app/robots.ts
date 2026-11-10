import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { absoluteUrl } from "@/utils/url";

export default function robots(): MetadataRoute.Robots {
  // Test deployments (SITE_NOINDEX=true) stay out of search engines
  if (process.env.SITE_NOINDEX === "true") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Personal, session-only pages
      disallow: ["/checkout", "/account", "/api/", "/v1/", "/pay/", "/reset-password", "/unsubscribe", "/back-in-stock/", "/review"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteConfig.url,
  };
}
