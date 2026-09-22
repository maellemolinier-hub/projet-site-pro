import Link from "next/link";
import { BadgeCheck, Star } from "lucide-react";

// Fonds pastels tournants pour les cartes portrait (style "annuaire"
// observé dans les captures partagées : photo/avatar sur aplat pastel).
const PORTRAIT_BG = [
  "bg-[#EFE1CB]", // sable
  "bg-[#D8E0CE]", // sauge
  "bg-[#EAD3CC]", // rose poudré
];

const expertsSample = [
  {
    name: "Sophie Martin",
    city: "Lyon 6e",
    rating: 4.9,
    reviews: 47,
    specialty: "Résidentiel ancien",
    initials: "SM",
  },
  {
    name: "Thomas Girard",
    city: "Bordeaux",
    rating: 5.0,
    reviews: 32,
    specialty: "Investissement locatif",
    initials: "TG",
  },
  {
    name: "Marie Dupont",
    city: "Paris 15e",
    rating: 4.8,
    reviews: 61,
    specialty: "Transactions de prestige",
    initials: "MD",
  },
];

export function Experts() {
  return (
    <section id="experts" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div className="space-y-6">
            <span className="inline-block text-xs font-semibold tracking-widest text-brand-600 uppercase">
              Annuaire des Experts
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-ink-950">
              Le badge qui fait la{" "}
              <span className="gradient-text">différence</span>
            </h2>
            <p className="text-ink-500 text-lg leading-relaxed">
              Après votre certification, vous êtes référencé dans notre annuaire
              national. Les vendeurs vous cherchent, vous trouvent, et vous font
              confiance avant même de vous avoir parlé.
            </p>

            <ul className="space-y-4">
              {[
                "Profil public avec zone de compétence sur carte",
                "Badge certifié visible sur votre propre site",
                "Formulaire de contact direct (leads entrants gratuits)",
                "Pages SEO optimisées par ville et quartier",
                "Mise en avant sur les requêtes locales Google",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <BadgeCheck className="w-5 h-5 text-brand-600 mt-0.5 shrink-0" />
                  <span className="text-ink-700 text-sm">{item}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/experts"
              className="inline-flex items-center gap-2 text-brand-600 font-semibold text-sm hover:text-brand-700 transition-colors"
            >
              Voir tous les experts certifiés →
            </Link>
          </div>

          {/* Right — cartes portrait sur fond pastel */}
          <div className="grid grid-cols-3 gap-4">
            {expertsSample.map((expert, i) => (
              <div
                key={expert.name}
                className="group flex flex-col rounded-2xl overflow-hidden border border-ink-100 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Portrait pastel */}
                <div
                  className={`relative aspect-square ${PORTRAIT_BG[i % PORTRAIT_BG.length]} flex items-center justify-center`}
                >
                  <span className="text-3xl font-bold text-ink-900/70">
                    {expert.initials}
                  </span>
                  <BadgeCheck className="absolute top-2 right-2 w-5 h-5 text-brand-600 bg-white rounded-full p-0.5 shadow-sm" />
                </div>

                {/* Info */}
                <div className="p-3 space-y-1">
                  <p className="font-semibold text-ink-950 text-sm truncate">
                    {expert.name}
                  </p>
                  <p className="text-xs text-ink-400 truncate">
                    {expert.city} · {expert.specialty}
                  </p>
                  <div className="flex items-center gap-1 pt-0.5">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-bold text-ink-900">
                      {expert.rating}
                    </span>
                    <span className="text-xs text-ink-300">
                      ({expert.reviews})
                    </span>
                  </div>
                </div>

                {/* CTA pilule noire, comme la ref */}
                <button className="mx-3 mb-3 bg-ink-950 hover:bg-ink-800 text-white text-xs font-semibold py-2 rounded-full transition-colors">
                  Voir le profil
                </button>
              </div>
            ))}

            <p className="col-span-3 text-center text-sm text-ink-400 pt-2">
              +3 700 experts certifiés dans toute la France
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
