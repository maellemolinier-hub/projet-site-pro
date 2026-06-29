"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Link from "next/link";

import { ArrowRight, TrendingUp, Users, Award } from "lucide-react";
import { MapPreview } from "@/components/map/MapPreview";

const HeroBackground = dynamic(
  () =>
    import("@/components/three/HeroBackground").then((m) => m.HeroBackground),
  { ssr: false },
);

const stats = [
  { icon: TrendingUp, value: "98%", label: "de précision sur les prix" },
  { icon: Users, value: "44 000+", label: "conseillers en France" },
  { icon: Award, value: "3 700+", label: "experts certifiés" },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 pt-16">
      {/* Three.js network background */}
      <HeroBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left — copy */}
          <div className="space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-white/90 backdrop-blur-sm"
            >
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Données mises à jour en quasi temps réel
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.2, ease: "easeOut" }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight text-balance"
            >
              Les prix de l&apos;immo{" "}
              <span className="text-accent-400">rue par rue</span>,{" "}
              <span className="underline decoration-accent-400 decoration-4 underline-offset-4">
                en temps réel
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
              className="text-lg text-white/70 max-w-xl leading-relaxed"
            >
              La première plateforme tout-en-un pour les professionnels de
              l&apos;immobilier. Carte interactive 3D, prospection prédictive,
              formations certifiantes et annuaire des experts.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/inscription"
                className="inline-flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-accent-500/30 hover:shadow-accent-500/50 hover:-translate-y-0.5"
              >
                Commencer — 14 jours gratuits
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#comment-ca-marche"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3.5 rounded-xl transition-all border border-white/20"
              >
                Voir la démo
              </Link>
            </motion.div>

            {/* Trust */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.65 }}
              className="text-sm text-white/50"
            >
              Sans carte bancaire · Résiliation en 1 clic · Données DVF + PERVAL
            </motion.p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
              {stats.map(({ icon: Icon, value, label }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.75 + i * 0.1 }}
                  className="space-y-1"
                >
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-4 h-4 text-accent-400" />
                    <span className="text-2xl font-bold text-white">
                      {value}
                    </span>
                  </div>
                  <p className="text-xs text-white/50">{label}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right — map preview */}
          <motion.div
            initial={{ opacity: 0, x: 48 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, delay: 0.3, ease: "easeOut" }}
            className="relative lg:h-[560px] h-[360px] rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-white/10"
          >
            <MapPreview />

            {/* Floating price card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
              transition={{
                opacity: { duration: 0.4, delay: 0.9 },
                scale: { duration: 0.4, delay: 0.9 },
                y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 },
              }}
              className="absolute top-4 left-4 glass rounded-xl p-3 shadow-lg border border-white/50"
            >
              <p className="text-xs text-gray-500 font-medium">
                Rue de Rivoli, Paris 1er
              </p>
              <p className="text-xl font-bold text-gray-900">
                14 800{" "}
                <span className="text-sm font-normal text-gray-500">
                  €/m²
                </span>
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs text-green-600 font-medium">
                  ▲ +3,2%
                </span>
                <span className="text-xs text-gray-400">sur 12 mois</span>
              </div>
            </motion.div>

            {/* Floating prospect card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
              transition={{
                opacity: { duration: 0.4, delay: 1.1 },
                scale: { duration: 0.4, delay: 1.1 },
                y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 3 },
              }}
              className="absolute bottom-4 right-4 glass rounded-xl p-3 shadow-lg border border-white/50"
            >
              <p className="text-xs text-gray-500 font-medium">
                Prospect IA détecté
              </p>
              <p className="text-sm font-bold text-gray-900">
                12, Bd Haussmann
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-2 h-2 bg-orange-400 rounded-full" />
                <span className="text-xs text-orange-600 font-medium">
                  Score 87% — Mise en vente probable
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
