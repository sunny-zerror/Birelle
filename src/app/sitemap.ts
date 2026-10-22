import type { MetadataRoute } from "next";
import { siteRoutes } from "@/config/site";
import { looks } from "@/data/lookbook";
import { products } from "@/data/products";
import { absoluteUrl } from "@/utils/url";

// One timestamp per build, so every URL doesn't look "changed" on each crawl
const lastModified = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
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
    images: [absoluteUrl(product.image), absoluteUrl(product.featured)],
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
