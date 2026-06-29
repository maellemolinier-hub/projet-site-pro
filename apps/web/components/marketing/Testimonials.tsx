"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "J'ai rentré 3 mandats supplémentaires le premier mois grâce aux prospects détectés par l'IA. L'outil s'est remboursé en une seule transaction.",
    name: "Alexandre P.",
    role: "Mandataire IAD, Nantes",
    rating: 5,
    initials: "AP",
    color: "bg-brand-100 text-brand-700",
  },
  {
    quote:
      "La carte 3D rue par rue, c'est ce que mes clients attendaient depuis des années. Je l'intègre sur mon site et ça fait vraiment la différence en rendez-vous.",
    name: "Claire M.",
    role: "Directrice d'agence, Paris 11e",
    rating: 5,
    initials: "CM",
    color: "bg-orange-100 text-orange-700",
  },
  {
    quote:
      "En tant que promoteur, l'analyse foncière m'a permis d'identifier 2 opportunités sous-valorisées que mes concurrents avaient ratées. ROI immédiat.",
    name: "Frédéric L.",
    role: "Promoteur immobilier, Lyon",
    rating: 5,
    initials: "FL",
    color: "bg-purple-100 text-purple-700",
  },
  {
    quote:
      "La formation valeur vénale est vraiment sérieuse. Le certificat m'a ouvert des portes avec les notaires et les investisseurs institutionnels.",
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
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block text-xs font-semibold tracking-widest text-brand-600 uppercase mb-3">
            Témoignages
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Ils ont déjà une longueur d&apos;avance
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4 transition-shadow hover:shadow-md"
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <motion.div
                    key={j}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.1 + j * 0.05 + 0.2 }}
                  >
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  </motion.div>
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
