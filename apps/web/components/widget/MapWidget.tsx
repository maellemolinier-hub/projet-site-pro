"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface Props {
  token?: string;
  theme?: "light" | "dark";
  initialLat?: number;
  initialLng?: number;
  initialZoom?: number;
}

const STYLE_LIGHT = "https://demotiles.maplibre.org/style.json";
const STYLE_DARK = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.cap-entreprendre-france.fr";

export default function MapWidget({
  theme = "light",
  initialLat = 48.8566,
  initialLng = 2.3522,
  initialZoom = 13,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: theme === "dark" ? STYLE_DARK : STYLE_LIGHT,
      center: [initialLng, initialLat],
      zoom: initialZoom,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "bottom-left"
    );

    map.on("load", () => {
      // Add price tile source
      map.addSource("prices", {
        type: "vector",
        tiles: [`${API_URL}/tiles/{z}/{x}/{y}.mvt`],
        minzoom: 10,
        maxzoom: 18,
      });

      // Heatmap layer
      map.addLayer({
        id: "prices-heat",
        type: "heatmap",
        source: "prices",
        "source-layer": "prices",
        maxzoom: 15,
        paint: {
          "heatmap-weight": [
            "interpolate", ["linear"],
            ["get", "price_per_sqm"],
            2000, 0,
            10000, 1,
          ],
          "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 10, 0.4, 15, 1.5],
          "heatmap-color": [
            "interpolate", ["linear"], ["heatmap-density"],
            0, "rgba(33,102,172,0)",
            0.2, "rgb(103,169,207)",
            0.4, "rgb(209,229,240)",
            0.6, "rgb(253,219,199)",
            0.8, "rgb(239,138,98)",
            1, "rgb(178,24,43)",
          ],
          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 10, 20, 15, 40],
          "heatmap-opacity": 0.75,
        },
      });

      // Cap Entreprendre France watermark
      const wm = document.createElement("div");
      wm.innerHTML = '<a href="https://cap-entreprendre-france.fr" target="_blank" rel="noopener" style="font-family:sans-serif;font-size:11px;color:#6B7280;text-decoration:none;background:rgba(255,255,255,0.9);padding:4px 8px;border-radius:6px;display:block;">Données · <strong style=\'color:#1D4ED8\'>Cap Entreprendre France</strong></a>';
      wm.style.cssText = "position:absolute;bottom:36px;right:8px;z-index:10;";
      containerRef.current?.appendChild(wm);
    });

    mapRef.current = map;
    return () => map.remove();
  }, [theme, initialLat, initialLng, initialZoom]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}