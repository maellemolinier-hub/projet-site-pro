import Link from "next/link";
import { BadgeCheck, MapPin, Star } from "lucide-react";

const expertsSample = [
  {
    name: "Sophie Martin",
    city: "Lyon 6e",
    rating: 4.9,
    reviews: 47,
    specialty: "Identité visuelle & branding",
    since: "2024",
    initials: "SM",
    color: "bg-brand-100 text-brand-700",
  },
  {
    name: "Thomas Girard",
    city: "Bordeaux",
    rating: 5.0,
    reviews: 32,
    specialty: "Création de sites web",
    since: "2023",
    initials: "TG",
    color: "bg-orange-100 text-orange-700",
  },
  {
    name: "Marie Dupont",
    city: "Paris 15e",
    rating: 4.8,
    reviews: 61,
    specialty: "Stratégie social media",
    since: "2023",
    initials: "MD",
    color: "bg-purple-100 text-purple-700",
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
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Le badge qui fait la{" "}
              <span className="gradient-text">différence</span>
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed">
              Après votre certification, vous êtes référencé dans notre annuaire
              national. Les vendeurs vous cherchent, vous trouvent, et vous font
              confiance avant même de vous avoir rencontré.
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
                  <span className="text-gray-700 text-sm">{item}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/experts"
              className="inline-flex items-center-center gap-2 text-brand-600 font-semibold text-sm hover:text-brand-700 transition-colors"
            >
              Voir tous les experts certifiés →
            </Link>
          </div>

          {/* Right — sample cards */}
          <div className="space-y-4">
            {expertsSample.map((expert) => (
              <div
                key={expert.name}
                className="flex items-center gap-4 bg-gray-50 hover:bg-white border border-gray-100 hover:border-brand-200 rounded-2xl p-4 transition-all shadow-sm hover:shadow-md group cursor-pointer"
              >
                {/* Avatar */}
                <div
                  className={`w-12 h-12 rounded-xl ${expert.color} flex items-center justify-center font-bold text-sm shrink-0`}
                >
                  {expert.initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 text-sm">
                      {expert.name}
                    </span>
                    <BadgeCheck className="w-4 h-4 text-brand-600 shrink-0" />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {expert.city} · {expert.specialty}
                  </div>
                </div>

                {/* Rating */}
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-bold text-gray-900">
                      {expert.rating}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{expert.reviews} avis</p>
                </div>
              </div>
            ))}

            <p className="text-center text-sm text-gray-400 pt-2">
              + 3 700 experts certifiés dans toute la France
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}