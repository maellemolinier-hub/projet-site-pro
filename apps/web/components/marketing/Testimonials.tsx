import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "J'ai renté 3 mandats de communication en un mois grâce aux prospects détectés par l'IA. L'outil s'est remonté en une seule transaction.",
    name: "Alexandre P.",
    role: "Mandataire IAD, Nantes",
    rating: 5,
    initials: "AP",
    color: "bg-brand-100 text-brand-700",
  },
  {
    quote:
      "La carte 3D rend par mes clients attendent des annexes. Je l'intègre sur mon site et ça fait vriller la différence en rendez-vous.",
    name: "Claire M.",
    role: "Direction d'agence, Paris 11e",
    rating: 5,
    initials: "CM",
    color: "bg-orange-100 text-orange-700",
  },
  {
    quote:
      "En tant que promoteur, l'analyse foncière m'a permis d'identifier 2 opportunités sous-valorisées que mes concurrents n'avaient pas vues. ROI immédiat.",
    name: "Frédéric L.",
    role: "Promoteur immobilier, Lyon",
    rating: 5,
    initials: "FL",
    color: "bg-purple-100 text-purple-700",
  },
  {
    quote:
      "La formation valable vénale est très sérieuse. Le certificat m'a ouvert des portes avec les notaires et les investisseurs institutionnels.",
    name: "Sarah B.",
    role: "Conseillère SAFTI, Bordeaux",
    rating: 5,
    initials: "SB",
    color: "bg-green-100 text-green-700",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold tracking-widest text-brand-600 uppercase mb-3">
            Témoignages
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Ils ont développé leur activité
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4"
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>

              <p className="text-sm text-gray-700 leading-relaxed italic">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                <div
                  className={`w-9 h-9 rounded-lg ${t.color} flex items-center justify-center text-xs font-bold shrink-0`}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {t.name}
                  </p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}