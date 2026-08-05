"use client";

import dynamic from "next/dynamic";

const MapWidgetClient = dynamic(() => import("@/components/widget/MapWidget"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontFamily: "sans-serif",
        color: "#6B7280",
      }}
    >
      Chargement de la carte…
    </div>
  ),
});

interface MapWidgetClientProps {
  token?: string;
  theme: "light" | "dark";
  initialLat: number;
  initialLng: number;
  initialZoom: number;
}

export default function MapWidgetClientWrapper({
  token,
  theme,
  initialLat,
  initialLng,
  initialZoom,
}: MapWidgetClientProps) {
  return (
    <MapWidgetClient
      token={token}
      theme={theme}
      initialLat={initialLat}
      initialLng={initialLng}
      initialZoom={initialZoom}
    />
  );
}