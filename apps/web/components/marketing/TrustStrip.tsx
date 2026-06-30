"use client";

import { Marquee } from "@/components/ui/Marquee";

const items = [
  { label: "Prix au m² rue par rue", icon: "📍" },
  { label: "Heatmap dynamique", icon: "🔥" },
  { label: "Prospection IA terrain", icon: "🤖" },
  { label: "Carte 3D bâtiments", icon: "🏙️" },
  { label: "Données DVF + PERVAL", icon: "📊" },
  { label: "Formation certifiante", icon: "🎓" },
  { label: "Badge Expert certifié", icon: "⭐" },
  { label: "Widget marque blanche", icon: "🔗" },
  { label: "Analyse foncière", icon: "🏗️" },
  { label: "Rapports PDF auto", icon: "📄" },
];

export function TrustStrip() {
  return (
    <div className="bg-brand-950 border-t border-white/5 py-4">
      <Marquee items={items} speed={45} />
    </div>
  );
}
