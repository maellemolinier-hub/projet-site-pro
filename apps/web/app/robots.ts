import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/connexion", "/inscription", "/api/"],
      },
    ],
    sitemap: "https://cap-entreprendre-france.fr/sitemap.xml",
    host: "https://cap-entreprendre-france.fr",
  };
}