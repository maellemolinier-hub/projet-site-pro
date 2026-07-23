import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@immoexpert/ui", "@immoexpert/types", "@immoexpert/agents"],
  images: {
    remotePatterns: [
      { hostname: "images.unsplash.com" },
      { hostname: "image.mux.com" },
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "mapbox-gl": "maplibre-gl",
    };
    return config;
  },
};

export default nextConfig;
