import type { MetadataRoute } from "next";

const baseUrl = "https://www.nutrifitjf.com.br";
const lastModified = new Date("2026-10-07T00:00:00-03:00");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/marmitas-fit-juiz-de-fora`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/b2b`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
