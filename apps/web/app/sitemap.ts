import { MetadataRoute } from "next";
import { campaignDays, campaignSlug, baseUrl } from "./campagnes/digitalisation-en-7-jours/data";

// Static services — replace with DB fetch when services data source is available
const SERVICES = [
  { slug: "identity-visuelle", updatedAt: new Date() },
  { slug: "creation-site-web", updatedAt: new Date() },
  { slug: "strategie-de-marque", updatedAt: new Date() },
  { slug: "communication-digitale", updatedAt: new Date() },
];

// Static articles — replace with DB fetch when articles data source is available
const ARTICLES = [
  { slug: "ia-productivite-auto-entrepreneurs", updatedAt: new Date() },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    {
      url: `${baseUrl}/contact-entreprise`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const serviceRoutes = SERVICES.map((s) => ({
    url: `${baseUrl}/services/${s.slug}`,
    lastModified: s.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const articleRoutes = ARTICLES.map((a) => ({
    url: `${baseUrl}/articles/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

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

  return [...staticRoutes, ...serviceRoutes, ...articleRoutes, ...campaignRoutes];
}