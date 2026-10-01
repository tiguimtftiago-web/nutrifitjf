import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/adm/", "/auth/"],
    },
    sitemap: "https://www.nutrifitjf.com.br/sitemap.xml",
  };
}
