"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Layers, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { formatPriceSqm, formatPercent } from "@/lib/utils";

interface ZoneInfo {
  address: string;
  priceSqm: number;
  trend: number;
  transactions: number;
}

export function MapDashboard() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<unknown>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ZoneInfo | null>(null);
  const [is3D, setIs3D] = useState(false);
  const [layer, setLayer] = useState<"heat" | "circles">("heat");

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const initMap = async () => {
      const maplibregl = (await import("maplibre-gl")).default;
      await import("maplibre-gl/dist/maplibre-gl.css");

      const map = new maplibregl.Map({
        container: mapRef.current!,
        style: "https://demotiles.maplibre.org/style.json",
        center: [2.3488, 48.8534],
        zoom: 12,
        attributionControl: false,
      });

      map.addControl(new maplibregl.AttributionControl({ compact: true }));
      mapInstance.current = map;

      map.on("load", () => {
        // Source tuiles vectorielles prix (notre API)
        map.addSource("price-tiles", {
          type: "vector",
          tiles: [`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/tiles/{z}/{x}/{y}.mvt`],
          maxzoom: 18,
        });

        // Heatmap layer
        map.addLayer({
          id: "price-heat",
          type: "heatmap",
          source: "price-tiles",
          "source-layer": "prices",
          paint: {
            "heatmap-weight": ["interpolate", ["linear"], ["get", "avg_price"], 3000, 0, 20000, 1],
            "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 8, 1, 16, 3],
            "heatmap-color": [
              "interpolate", ["linear"], ["heatmap-density"],
              0, "rgba(67,73,231,0)",
              0.3, "rgba(124,150,248,0.6)",
              0.6, "rgba(251,146,60,0.7)",
              1, "rgba(239,68,68,0.9)",
            ],
            "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 8, 15, 16, 40],
          },
        });

        // Click handler
        map.on("click", (e) => {
          setSelected({
            address: `${e.lngLat.lat.toFixed(4)}, ${e.lngLat.lng.toFixed(4)}`,
            priceSqm: 8000 + Math.random() * 8000,
            trend: (Math.random() - 0.3) * 10,
            transactions: Math.floor(10 + Math.random() * 90),
          });
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

  const toggle3D = () => {
    const map = mapInstance.current as {
      setPitch: (p: number) => void;
      setBearing: (b: number) => void;
    } | null;
    if (!map) return;
    if (!is3D) {
      map.setPitch(45);
      map.setBearing(-20);
    } else {
      map.setPitch(0);
      map.setBearing(0);
    }
    setIs3D(!is3D);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 p-4 bg-white border-b border-gray-100">
        <div className="flex-1 relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Adresse, ville, code postal..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={() => setLayer(layer === "heat" ? "circles" : "heat")}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Layers className="w-4 h-4" />
          {layer === "heat" ? "Heatmap" : "Points"}
        </button>

        <button
          onClick={toggle3D}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
            is3D
              ? "bg-brand-600 text-white border-brand-600"
              : "text-gray-700 bg-gray-50 border-gray-200 hover:bg-gray-100"
          }`}
        >
          Vue {is3D ? "2D" : "3D"}
        </button>
      </div>

      {/* Map container */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="absolute inset-0" />

        {/* Info panel */}
        {selected && (
          <div className="absolute top-4 right-4 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-64">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">
              Zone sélectionnée
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-400">Prix médian</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPriceSqm(selected.priceSqm)}
                </p>
              </div>
              <div className="flex justify-between">
                <div>
                  <p className="text-xs text-gray-400">Tendance 12 mois</p>
                  <p
                    className={`text-sm font-semibold ${
                      selected.trend > 0 ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {formatPercent(selected.trend)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Transactions</p>
                  <p className="text-sm font-semibold text-gray-700">
                    {selected.transactions}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="mt-3 w-full text-xs text-gray-400 hover:text-gray-600"
            >
              Fermer
            </button>
          </div>
        )}

        {/* Zoom controls */}
        <div className="absolute bottom-8 right-4 flex flex-col gap-1">
          <button
            onClick={() => {
              const m = mapInstance.current as { zoomIn: () => void } | null;
              m?.zoomIn();
            }}
            className="w-9 h-9 bg-white rounded-lg shadow border border-gray-200 flex items-center justify-center hover:bg-gray-50"
          >
            <ZoomIn className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => {
              const m = mapInstance.current as { zoomOut: () => void } | null;
              m?.zoomOut();
            }}
            className="w-9 h-9 bg-white rounded-lg shadow border border-gray-200 flex items-center justify-center hover:bg-gray-50"
          >
            <ZoomOut className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => {
              const m = mapInstance.current as {
                setCenter: (c: [number, number]) => void;
                setZoom: (z: number) => void;
              } | null;
              m?.setCenter([2.3488, 48.8534]);
              m?.setZoom(12);
            }}
            className="w-9 h-9 bg-white rounded-lg shadow border border-gray-200 flex items-center justify-center hover:bg-gray-50"
          >
            <RotateCcw className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
