import { defineZcomConfig, resolveConfig } from "@zcom/storefront-kit/core";
import { siteConfig } from "@/config/site";

// Zcom storefront kit — store facts the backend doesn't expose publicly
export const zcomConfig = defineZcomConfig({
  storeName: siteConfig.name,
  siteUrl: siteConfig.url,
  logoUrl: `${siteConfig.url}${siteConfig.logo}`,
  defaultCurrency: siteConfig.currency,
  locale: siteConfig.language,
  itemIdFrom: "variantId",
  socialLinks: Object.values(siteConfig.socials).filter(Boolean),
});

export const zcomSiteConfig = resolveConfig(zcomConfig);
