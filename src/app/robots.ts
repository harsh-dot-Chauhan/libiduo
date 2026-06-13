import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXTAUTH_URL ?? "https://libiduo.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/products", "/products/"],
        disallow: ["/admin/", "/api/", "/checkout", "/orders", "/account", "/cart"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
