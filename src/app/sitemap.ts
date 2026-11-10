import type { MetadataRoute } from "next";
import { siteRoutes } from "@/config/site";
import { getCatalog, getLooks } from "@/lib/zcom/catalog";
import { absoluteUrl } from "@/utils/url";

// Rebuilt every hour from the Zcom store
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const [{ products }, looks] = await Promise.all([getCatalog(), getLooks()]);

  const pages: MetadataRoute.Sitemap = siteRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.path === "/" || route.path === "/shop" ? "weekly" : "monthly",
    priority: route.priority,
  }));

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: absoluteUrl(product.href),
    lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
    images: [...new Set([absoluteUrl(product.image), absoluteUrl(product.featured)])],
  }));

  const lookPages: MetadataRoute.Sitemap = looks.map((look) => ({
    url: absoluteUrl(`/lookbook/${look.slug}`),
    lastModified,
    changeFrequency: "monthly",
    priority: 0.6,
    images: look.photos.map((p) => absoluteUrl(p.src)),
  }));

  return [...pages, ...productPages, ...lookPages];
}
