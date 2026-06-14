"use client";

import { useEffect, useRef } from "react";

export function MapPreview() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const initMap = async () => {
      const maplibregl = (await import("maplibre-gl")).default;
      await import("maplibre-gl/dist/maplibre-gl.css");

      const map = new maplibregl.Map({
        container: mapRef.current!,
        style: "https://demotiles.maplibre.org/style.json",
        center: [2.3488, 48.8534],
        zoom: 13,
        interactive: true,
        attributionControl: false,
      });

      mapInstance.current = map;

      map.on("load", () => {
        // Fake price heatmap data
        const points = Array.from({ length: 200 }, (_, i) => ({
          type: "Feature" as const,
          properties: {
            price: 8000 + Math.random() * 10000,
            intensity: Math.random(),
          },
          geometry: {
            type: "Point" as const,
            coordinates: [
              2.3488 + (Math.random() - 0.5) * 0.05,
              48.8534 + (Math.random() - 0.5) * 0.03,
            ],
          },
        }));

        map.addSource("prices", {
          type: "geojson",
          data: { type: "FeatureCollection", features: points },
        });

        map.addLayer({
          id: "price-heat",
          type: "heatmap",
          source: "prices",
          paint: {
            "heatmap-weight": ["get", "intensity"],
            "heatmap-intensity": 1.2,
            "heatmap-color": [
              "interpolate",
              ["linear"],
              ["heatmap-density"],
              0, "rgba(67, 73, 231, 0)",
              0.2, "rgba(124, 150, 248, 0.5)",
              0.5, "rgba(251, 146, 60, 0.7)",
              1, "rgba(239, 68, 68, 0.9)",
            ],
            "heatmap-radius": 20,
          },
        });

        // Sample markers
        const locations = [
          { lng: 2.3488, lat: 48.853, label: "14 200 €/m²" },
          { lng: 2.352, lat: 48.856, label: "12 800 €/m²" },
          { lng: 2.345, lat: 48.851, label: "16 500 €/m²" },
        ];

        locations.forEach(({ lng, lat, label }) => {
          const el = document.createElement("div");
          el.className =
            "bg-white text-gray-900 text-xs font-bold px-2 py-1 rounded-lg shadow-lg border border-gray-200 whitespace-nowrap";
          el.textContent = label;
          new maplibregl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map);
        });
      });
    };

    initMap().catch(console.error);

    return () => {
      if (mapInstance.current) {
        (mapInstance.current as { remove: () => void }).remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="map-container" />
      {/* Overlay gradient at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-brand-950/60 to-transparent pointer-events-none" />
    </div>
  );
}
