import type { MetadataRoute } from "next";
import { campaignDays, campaignSlug, baseUrl } from "./campagnes/digitalisation-en-7-jours/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const campaignRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/campagnes/${campaignSlug}`,
      priority: 0.7,
      changeFrequency: "weekly",
    },
    ...campaignDays.map((day) => ({
      url: `${baseUrl}/campagnes/${campaignSlug}/${day.slug}`,
      priority: 0.6,
      changeFrequency: "weekly" as const,
    })),
  ];

  return [
    {
      url: baseUrl,
      priority: 1.0,
      changeFrequency: "monthly",
    },
    ...campaignRoutes,
  ];
}