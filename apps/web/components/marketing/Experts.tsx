import Link from "next/link";
import { BadgeCheck, MapPin, Star } from "lucide-react";

const clientsSample = [
  {
    name: "Studio Lumière",
    city: "Grasse",
    rating: 5.0,
    reviews: 12,
    project: "Identité visuelle + site web",
    since: "2024",
    initials: "SL",
    color: "bg-brand-100 text-brand-700",
  },
  {
    name: "Café du Centre",
    city: "Valbonne",
    rating: 4.9,
    reviews: 8,
    project: "Logo + cartes de visite",
    since: "2023",
    initials: "CC",
    color: "bg-orange-100 text-orange-700",
  },
  {
    name: "Atelier Botanique",
    city: "Cannes",
    rating: 5.0,
    reviews: 15,
    project: "Refonte de marque + réseaux sociaux",
    since: "2023",
    initials: "AB",
    color: "bg-purple-100 text-purple-700",
  },
];

export function Experts() {
  return (
    <section id="clients" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div className="space-y-6">
            <span className="inline-block text-xs font-semibold tracking-widest text-brand-600 uppercase">
              Nos clients
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Des entrepreneurs qui{" "}
              <span className="gradient-text">nous font confiance</span>
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed">
              Artisans, commerçants, indépendants et PME : nous accompagnons des
              entrepreneurs de la Côte d&apos;Azur et de toute la France dans leur
              communication. Voici quelques-uns de nos clients.
            </p>

            <ul className="space-y-4">
              {[
                "Identité visuelle sur mesure, du logo à la charte complète",
                "Sites web modernes et optimisés pour le référencement",
                "Gestion des réseaux sociaux et campagnes publicitaires",
                "Supports print : flyers, brochures, cartes de visite",
                "Accompagnement et conseils en stratégie de marque",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <BadgeCheck className="w-5 h-5 text-brand-600 mt-0.5 shrink-0" />
                  <span className="text-gray-700 text-sm">{item}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/contact-entreprise"
              className="inline-flex items-center gap-2 text-brand-600 font-semibold text-sm hover:text-brand-700 transition-colors"
            >
              Devenir client →
            </Link>
          </div>

          {/* Right — sample cards */}
          <div className="space-y-4">
            {clientsSample.map((client) => (
              <div
                key={client.name}
                className="flex items-center gap-4 bg-gray-50 hover:bg-white border border-gray-100 hover:border-brand-200 rounded-2xl p-4 transition-all shadow-sm hover:shadow-md group cursor-pointer"
              >
                {/* Avatar */}
                <div
                  className={`w-12 h-12 rounded-xl ${client.color} flex items-center justify-center font-bold text-sm shrink-0`}
                >
                  {client.initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 text-sm">
                      {client.name}
                    </span>
                    <BadgeCheck className="w-4 h-4 text-brand-600 shrink-0" />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {client.city} · {client.project}
                  </div>
                </div>

                {/* Rating */}
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-bold text-gray-900">
                      {client.rating}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{client.reviews} avis</p>
                </div>
              </div>
            ))}

            <p className="text-center text-sm text-gray-400 pt-2">
              +50 entrepreneurs accompagnés dans toute la France
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}