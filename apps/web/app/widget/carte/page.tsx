import { Suspense } from "react";
import MapWidget from "@/components/widget/MapWidgetLoader";

interface Props {
  searchParams: Promise<{ token?: string; theme?: string; lat?: string; lng?: string; zoom?: string }>;
}

export default async function CarteWidgetPage({ searchParams }: Props) {
  const { token, theme = "light", lat = "48.8566", lng = "2.3522", zoom = "13" } = await searchParams;

  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>ImmoExpert — Carte des prix</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body, #map-container { width: 100%; height: 100vh; overflow: hidden; }
        `}</style>
      </head>
      <body>
        <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "sans-serif", color: "#6B7280" }}>Chargement de la carte…</div>}>
          <MapWidget
            token={token}
            theme={theme as "light" | "dark"}
            initialLat={parseFloat(lat)}
            initialLng={parseFloat(lng)}
            initialZoom={parseFloat(zoom)}
          />
        </Suspense>
      </body>
    </html>
  );
}

export const metadata = {
  title: "ImmoExpert — Carte des prix immobiliers",
  robots: "noindex",
};
