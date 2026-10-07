import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/adm/", "/auth/", "/agente/", "/assistente/"],
    },
    sitemap: "https://www.nutrifitjf.com.br/sitemap.xml",
    host: "https://www.nutrifitjf.com.br",
  };
}
