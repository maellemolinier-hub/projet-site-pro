import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, MapPin, Star, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Experts certifiés en Valeur Vénale — Annuaire national",
  description:
    "Trouvez un expert immobilier certifié Cap Entreprendre France près de chez vous. Tous ont suivi la formation Expert en Valeur Vénale.",
};

const SAMPLE_EXPERTS = Array.from({ length: 12 }, (_, i) => ({
  id: `expert-${i + 1}`,
  slug: `expert-${i + 1}`,
  name: [
    "Sophie Martin", "Thomas Girard", "Marie Dupont", "Paul Leroy",
    "Emma Bernard", "Lucas Petit", "Chloé Moreau", "Hugo Simon",
    "Léa Laurent", "Nathan Michel", "Sarah Roux", "Antoine Durand",
  ][i],
  city: [
    "Paris 6e", "Lyon 2e", "Bordeaux", "Marseille 8e",
    "Nantes", "Toulouse", "Nice", "Rennes",
    "Montpellier", "Strasbourg", "Lille", "Grenoble",
  ][i],
  specialty: [
    "Résidentiel prestige", "Investissement locatif", "Neuf & VEFA", "Côte d'Azur",
    "Maisons & pavillons", "Résidentiel ancien", "Appartements", "Bureaux & commerces",
    "Résidentiel", "Alsace & frontalier", "Résidentiel", "Montagne & ski",
  ][i],
  rating: 4.7 + Math.random() * 0.3,
  reviews: 20 + Math.floor(Math.random() * 60),
  initials: "AB",
  certifiedSince: "2023",
  color: [
    "bg-brand-100 text-brand-700",
    "bg-orange-100 text-orange-700",
    "bg-purple-100 text-purple-700",
    "bg-green-100 text-green-700",
    "bg-red-100 text-red-700",
    "bg-teal-100 text-teal-700",
    "bg-yellow-100 text-yellow-700",
    "bg-pink-100 text-pink-700",
    "bg-indigo-100 text-indigo-700",
    "bg-cyan-100 text-cyan-700",
    "bg-lime-100 text-lime-700",
    "bg-rose-100 text-rose-700",
  ][i],
})).map((e) => ({
  ...e,
  initials: e.name
    .split(" ")
    .map((n) => n[0])
    .join(""),
}));

export default function ExpertsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-brand-950 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1 text-sm">
            <BadgeCheck className="w-4 h-4 text-brand-300" />
            Annuaire national des Experts certifiés
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold">
            Trouvez votre expert{" "}
            <span className="text-accent-400">certifié</span>
          </h1>
          <p className="text-white/60 max-w-xl mx-auto">
            Tous les experts référencés ont obtenu la certification Cap Entreprendre France
            en Valeur Vénale. Ils utilisent les mêmes données temps réel que
            vous voyez sur cette carte.
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto mt-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Ville, département..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-sm text-gray-500 mb-6">
          {SAMPLE_EXPERTS.length} experts certifiés trouvés
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {SAMPLE_EXPERTS.map((expert) => (
            <Link
              key={expert.id}
              href={`/experts/${expert.slug}`}
              className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-brand-200 hover:shadow-md transition-all group"
            >
              {/* Avatar + badge */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl ${expert.color} flex items-center justify-center font-bold`}
                >
                  {expert.initials}
                </div>
                <BadgeCheck className="w-5 h-5 text-brand-600" />
              </div>

              <h3 className="font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">
                {expert.name}
              </h3>

              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1 mb-1">
                <MapPin className="w-3 h-3" />
                {expert.city}
              </div>
              <p className="text-xs text-gray-400 mb-3">{expert.specialty}</p>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-bold text-gray-900">
                    {expert.rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-400">
                    ({expert.reviews})
                  </span>
                </div>
                <span className="text-xs text-brand-600 font-medium">
                  Certifié {expert.certifiedSince}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
