export const dynamic = "force-dynamic";

import { MetadataRoute } from "next";
import { db } from "@/lib/db";

const SITE_URL = process.env.NEXTAUTH_URL ?? "https://libiduo.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await db.product.findMany({
    where: { deletedAt: null, isActive: true },
    select: { slug: true, updatedAt: true },
  });

  const categories = await db.category.findMany({
    select: { slug: true },
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    ...categories.map((c) => ({
      url: `${SITE_URL}/products?category=${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/products/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}
