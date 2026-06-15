import PriceMapWidget from "@/components/widget/PriceMapLoader";

export const metadata = {
  title: "ImmoExpert — Carte des prix immobiliers",
  robots: "noindex",
};

export default function PrixWidgetPage() {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`* { margin: 0; padding: 0; box-sizing: border-box; } html, body, #__next { width: 100%; height: 100vh; overflow: hidden; background: #111827; }`}</style>
      </head>
      <body style={{ width: "100%", height: "100vh" }}>
        <PriceMapWidget />
      </body>
    </html>
  );
}
