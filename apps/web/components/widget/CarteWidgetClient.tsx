"use client";

import dynamic from "next/dynamic";

const MapWidget = dynamic(() => import("@/components/widget/MapWidget"), {
  ssr: false,
  loading: () => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "sans-serif", color: "#6B7280" }}>
      Chargement de la carte…
    </div>
  ),
});

interface CarteWidgetClientProps {
  token?: string;
  theme: "light" | "dark";
  initialLat: number;
  initialLng: number;
  initialZoom: number;
}

export function CarteWidgetClient(props: CarteWidgetClientProps) {
  return <MapWidget {...props} />;
}
