import { MetadataRoute } from "next";

const BASE_URL = "https://cap-entreprendre-france.fr";

// Static services — replace with DB fetch when services data source is available
const SERVICES = [
  { slug: "identite-visuelle", updatedAt: new Date() },
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
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    {
      url: `${BASE_URL}/contact-entreprise`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const serviceRoutes = SERVICES.map((s) => ({
    url: `${BASE_URL}/services/${s.slug}`,
    lastModified: s.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const articleRoutes = ARTICLES.map((a) => ({
    url: `${BASE_URL}/articles/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...serviceRoutes, ...articleRoutes];
}