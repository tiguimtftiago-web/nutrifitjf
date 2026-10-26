import type { MetadataRoute } from "next";

const baseUrl = "https://www.nutrifitjf.com.br";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: baseUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/marmitas-fit-juiz-de-fora`,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/b2b`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacidade`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
