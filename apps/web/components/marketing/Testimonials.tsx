import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "Cap Entreprendre France a transformé notre image. Le nouveau logo et le site web ont donné un coup de jeune à notre studio. Les clients nous trouvent plus professionnels.",
    name: "Julie R.",
    role: "Gérante, Studio Lumière, Grasse",
    rating: 5,
    initials: "JR",
    color: "bg-brand-100 text-brand-700",
  },
  {
    quote:
      "Accompagnement au top, du logo à la stratégie de réseaux sociaux. On a doublé notre visibilité en 3 mois. Je recommande vivement.",
    name: "Marc D.",
    role: "Commerçant, Café du Centre, Valbonne",
    rating: 5,
    initials: "MD",
    color: "bg-orange-100 text-orange-700",
  },
  {
    quote:
      "La refonte de notre marque a été un vrai succès. Le suivi personnalisé et les conseils en communication font toute la différence.",
    name: "Sophie L.",
    role: "Fondatrice, Atelier Botanique, Cannes",
    rating: 5,
    initials: "SL",
    color: "bg-purple-100 text-purple-700",
  },
  {
    quote:
      "Site web rapide, beau, et bien référencé. On reçoit des demandes de devis via le site chaque semaine. Un investissement vite rentabilisé.",
    name: "Thomas P.",
    role: "Artisan menuisier, Mouans-Sartoux",
    rating: 5,
    initials: "TP",
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
            Ils ont déjà une longueur d&apos;avance
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