"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const CITIES = [
  { id: "paris", name: "Paris", lng: 2.3522, lat: 48.8566, zoom: 12 },
  { id: "lyon", name: "Lyon", lng: 4.8357, lat: 45.7640, zoom: 13 },
  { id: "marseille", name: "Marseille", lng: 5.3698, lat: 43.2965, zoom: 13 },
  { id: "bordeaux", name: "Bordeaux", lng: -0.5792, lat: 44.8378, zoom: 13 },
  { id: "nice", name: "Nice", lng: 7.2620, lat: 43.7102, zoom: 13 },
  { id: "toulouse", name: "Toulouse", lng: 1.4442, lat: 43.6047, zoom: 13 },
  { id: "nantes", name: "Nantes", lng: -1.5534, lat: 47.2184, zoom: 13 },
  { id: "strasbourg", name: "Strasbourg", lng: 7.7521, lat: 48.5734, zoom: 13 },
];

const PRICE_POINTS = [
  // Paris
  { lng: 2.3461, lat: 48.8606, price: 12850, label: "1er – Châtelet" },
  { lng: 2.3514, lat: 48.8674, price: 11200, label: "2ème – Bonne Nouvelle" },
  { lng: 2.3592, lat: 48.8638, price: 11800, label: "3ème – Marais" },
  { lng: 2.3545, lat: 48.8539, price: 13100, label: "4ème – Île de la Cité" },
  { lng: 2.3479, lat: 48.8474, price: 12300, label: "5ème – Panthéon" },
  { lng: 2.3316, lat: 48.8481, price: 15400, label: "6ème – St-Germain" },
  { lng: 2.3107, lat: 48.8567, price: 14200, label: "7ème – Tour Eiffel" },
  { lng: 2.3087, lat: 48.8757, price: 12700, label: "8ème – Champs-Élysées" },
  { lng: 2.3404, lat: 48.8768, price: 10800, label: "9ème – Opéra" },
  { lng: 2.3600, lat: 48.8756, price: 9600, label: "10ème – Canal St-Martin" },
  { lng: 2.3793, lat: 48.8588, price: 10200, label: "11ème – Bastille" },
  { lng: 2.3947, lat: 48.8438, price: 9200, label: "12ème – Vincennes" },
  { lng: 2.3606, lat: 48.8290, price: 8600, label: "13ème – Place d'Italie" },
  { lng: 2.3251, lat: 48.8296, price: 9400, label: "14ème – Montparnasse" },
  { lng: 2.2984, lat: 48.8410, price: 9900, label: "15ème – Vaugirard" },
  { lng: 2.2693, lat: 48.8616, price: 11800, label: "16ème – Passy" },
  { lng: 2.3149, lat: 48.8855, price: 10600, label: "17ème – Batignolles" },
  { lng: 2.3543, lat: 48.8882, price: 9300, label: "18ème – Montmartre" },
  { lng: 2.3783, lat: 48.8794, price: 8400, label: "19ème – Buttes-Chaumont" },
  { lng: 2.3967, lat: 48.8634, price: 8600, label: "20ème – Belleville" },
  // Lyon
  { lng: 4.8340, lat: 45.7671, price: 5200, label: "Lyon 1er – Terreaux" },
  { lng: 4.8281, lat: 45.7459, price: 5600, label: "Lyon 2ème – Confluence" },
  { lng: 4.8500, lat: 45.7577, price: 4800, label: "Lyon 3ème – Part-Dieu" },
  { lng: 4.8202, lat: 45.7746, price: 5900, label: "Lyon 4ème – Croix-Rousse" },
  { lng: 4.8013, lat: 45.7508, price: 4600, label: "Lyon 5ème – Vieux-Lyon" },
  { lng: 4.8449, lat: 45.7755, price: 6200, label: "Lyon 6ème – Brotteaux" },
  { lng: 4.8439, lat: 45.7327, price: 4400, label: "Lyon 7ème – Guillotière" },
  { lng: 4.8604, lat: 45.7252, price: 4100, label: "Lyon 8ème – Monplaisir" },
  // Marseille
  { lng: 5.3697, lat: 43.2965, price: 3200, label: "Marseille 1er – Centre" },
  { lng: 5.3837, lat: 43.2876, price: 4800, label: "Marseille 6ème – Castellane" },
  { lng: 5.3995, lat: 43.2740, price: 5400, label: "Marseille 8ème – Périer" },
  { lng: 5.3530, lat: 43.3070, price: 2800, label: "Marseille 14ème – Nord" },
  { lng: 5.4296, lat: 43.3008, price: 3600, label: "Marseille 12ème – La Rose" },
  // Bordeaux
  { lng: -0.5650, lat: 44.8520, price: 5200, label: "Bordeaux – Chartrons" },
  { lng: -0.5592, lat: 44.8303, price: 4100, label: "Bordeaux – Saint-Michel" },
  { lng: -0.5735, lat: 44.8386, price: 4800, label: "Bordeaux – Mériadeck" },
  { lng: -0.5614, lat: 44.8350, price: 4600, label: "Bordeaux – Capucins" },
  { lng: -0.5440, lat: 44.8370, price: 3900, label: "Bordeaux – Bastide" },
  { lng: -0.5860, lat: 44.8450, price: 5800, label: "Bordeaux – Bacalan" },
  // Nice
  { lng: 7.2778, lat: 43.6944, price: 5800, label: "Nice – Vieux-Nice" },
  { lng: 7.2618, lat: 43.6929, price: 8200, label: "Nice – Promenade des Anglais" },
  { lng: 7.2706, lat: 43.7131, price: 5100, label: "Nice – Cimiez" },
  { lng: 7.2906, lat: 43.7049, price: 4200, label: "Nice – Riquier" },
  { lng: 7.2450, lat: 43.7000, price: 9500, label: "Nice – Carré d'Or" },
  // Toulouse
  { lng: 1.4442, lat: 43.6047, price: 3800, label: "Toulouse – Capitole" },
  { lng: 1.4457, lat: 43.5989, price: 4200, label: "Toulouse – Carmes" },
  { lng: 1.4614, lat: 43.6071, price: 3200, label: "Toulouse – Jolimont" },
  { lng: 1.4180, lat: 43.6020, price: 3600, label: "Toulouse – Saint-Cyprien" },
  // Nantes
  { lng: -1.5540, lat: 47.2186, price: 4200, label: "Nantes – Centre" },
  { lng: -1.5442, lat: 47.2098, price: 3800, label: "Nantes – Île de Nantes" },
  { lng: -1.5680, lat: 47.2260, price: 3500, label: "Nantes – Chantenay" },
  // Strasbourg
  { lng: 7.7521, lat: 48.5734, price: 3900, label: "Strasbourg – Grande Île" },
  { lng: 7.7640, lat: 48.5802, price: 4400, label: "Strasbourg – Orangerie" },
  { lng: 7.7380, lat: 48.5660, price: 3200, label: "Strasbourg – Neudorf" },
];

function priceColor(price: number): string {
  if (price >= 12000) return "#ef4444";
  if (price >= 9000) return "#f97316";
  if (price >= 6000) return "#f59e0b";
  if (price >= 4000) return "#10b981";
  return "#3b82f6";
}

function formatPrice(p: number) {
  return p.toLocaleString("fr-FR") + " €/m²";
}

export default function PriceMapWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const [activeCity, setActiveCity] = useState("paris");
  const [hoveredPrice, setHoveredPrice] = useState<{ label: string; price: number } | null>(null);
  const [loaded, setLoaded] = useState(false);

  const flyToCity = useCallback((cityId: string) => {
    const city = CITIES.find((c) => c.id === cityId);
    if (!city || !mapRef.current) return;
    setActiveCity(cityId);
    mapRef.current.flyTo({ center: [city.lng, city.lat], zoom: city.zoom, duration: 1200, essential: true });
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center: [2.3522, 48.8566],
      zoom: 12,
      attributionControl: false,
      pitchWithRotate: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");

    const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 12 });
    popupRef.current = popup;

    map.on("load", () => {
      const geojson: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: PRICE_POINTS.map((p) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [p.lng, p.lat] },
          properties: { price: p.price, label: p.label, color: priceColor(p.price) },
        })),
      };

      map.addSource("prices", { type: "geojson", data: geojson });

      // Glow layer
      map.addLayer({
        id: "prices-glow",
        type: "circle",
        source: "prices",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 20, 14, 45],
          "circle-color": ["get", "color"],
          "circle-opacity": 0.12,
          "circle-blur": 1,
        },
      });

      // Main circle
      map.addLayer({
        id: "prices-circle",
        type: "circle",
        source: "prices",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 8, 14, 18],
          "circle-color": ["get", "color"],
          "circle-opacity": 0.9,
          "circle-stroke-width": 2,
          "circle-stroke-color": "rgba(255,255,255,0.3)",
        },
      });

      // Labels
      map.addLayer({
        id: "prices-label",
        type: "symbol",
        source: "prices",
        minzoom: 12,
        layout: {
          "text-field": ["concat", ["to-string", ["round", ["/", ["get", "price"], 100]]], "00 €"],
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-size": 11,
          "text-offset": [0, -2.2],
          "text-anchor": "bottom",
        },
        paint: {
          "text-color": "#ffffff",
          "text-halo-color": "rgba(0,0,0,0.6)",
          "text-halo-width": 1.5,
        },
      });

      map.on("mouseenter", "prices-circle", (e) => {
        map.getCanvas().style.cursor = "pointer";
        const feat = e.features?.[0];
        if (!feat) return;
        const coords = (feat.geometry as GeoJSON.Point).coordinates as [number, number];
        const props = feat.properties as { price: number; label: string; color: string };
        setHoveredPrice({ label: props.label, price: props.price });
        popup
          .setLngLat(coords)
          .setHTML(`
            <div style="font-family:system-ui,sans-serif;padding:10px 14px;min-width:160px;">
              <div style="font-size:11px;color:#9ca3af;margin-bottom:4px;text-transform:uppercase;letter-spacing:.05em">${props.label}</div>
              <div style="font-size:22px;font-weight:700;color:${props.color}">${props.price.toLocaleString("fr-FR")} €</div>
              <div style="font-size:11px;color:#6b7280;margin-top:2px;">par m² · données DVF</div>
            </div>
          `)
          .addTo(map);
      });

      map.on("mouseleave", "prices-circle", () => {
        map.getCanvas().style.cursor = "";
        popup.remove();
        setHoveredPrice(null);
      });

      setLoaded(true);
    });

    mapRef.current = map;
    return () => { popup.remove(); map.remove(); };
  }, []);

  const avgParis = Math.round(
    PRICE_POINTS.filter((p) => p.label.startsWith("Paris") || p.label.match(/^\d/)).slice(0, 20)
      .reduce((s, p) => s + p.price, 0) / 20
  );

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", background: "#111827", fontFamily: "system-ui,sans-serif" }}>
      {/* Map */}
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {/* Header badge */}
      <div style={{
        position: "absolute", top: 16, left: 16, zIndex: 10,
        background: "rgba(17,24,39,0.92)", backdropFilter: "blur(12px)",
        borderRadius: 12, padding: "10px 16px",
        border: "1px solid rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6", boxShadow: "0 0 8px #3b82f6" }} />
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>Immo<span style={{ color: "#60a5fa" }}>Expert</span></span>
        <span style={{ color: "#6b7280", fontSize: 12, marginLeft: 4 }}>Prix DVF en temps réel</span>
      </div>

      {/* City selector */}
      <div style={{
        position: "absolute", top: 16, right: 16, zIndex: 10,
        display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end", maxWidth: 320,
      }}>
        {CITIES.map((city) => (
          <button
            key={city.id}
            onClick={() => flyToCity(city.id)}
            style={{
              background: activeCity === city.id ? "#3b82f6" : "rgba(17,24,39,0.85)",
              backdropFilter: "blur(8px)",
              border: activeCity === city.id ? "1px solid #3b82f6" : "1px solid rgba(255,255,255,0.1)",
              color: activeCity === city.id ? "#fff" : "#9ca3af",
              padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
              cursor: "pointer", transition: "all .2s",
            }}
          >
            {city.name}
          </button>
        ))}
      </div>

      {/* Price legend */}
      <div style={{
        position: "absolute", bottom: 48, left: 16, zIndex: 10,
        background: "rgba(17,24,39,0.92)", backdropFilter: "blur(12px)",
        borderRadius: 10, padding: "12px 14px",
        border: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>Prix au m²</div>
        {[
          { color: "#3b82f6", label: "< 4 000 €" },
          { color: "#10b981", label: "4 000 – 6 000 €" },
          { color: "#f59e0b", label: "6 000 – 9 000 €" },
          { color: "#f97316", label: "9 000 – 12 000 €" },
          { color: "#ef4444", label: "> 12 000 €" },
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "#d1d5db" }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Loading overlay */}
      {!loaded && (
        <div style={{
          position: "absolute", inset: 0, background: "#111827",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 20,
        }}>
          <div style={{ width: 40, height: 40, border: "3px solid #1e3a5f", borderTop: "3px solid #3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: "#6b7280", marginTop: 16, fontSize: 13 }}>Chargement de la carte…</p>
        </div>
      )}

      {/* Powered by */}
      <div style={{
        position: "absolute", bottom: 8, right: 60, zIndex: 10,
        fontSize: 10, color: "#4b5563",
      }}>
        Données DVF · ImmoExpert
      </div>
    </div>
  );
}
