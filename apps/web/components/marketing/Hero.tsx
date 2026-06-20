"use client";

import Link from "next/link";
import { ArrowRight, TrendingUp, Users, Award } from "lucide-react";
import { MapPreview } from "@/components/map/MapPreview";

const stats = [
  { icon: TrendingUp, value: "3×", label: "plus de mandats rentrés en moyenne" },
  { icon: Users, value: "44 000+", label: "agents immobiliers en France" },
  { icon: Award, value: "14 jours", label: "d'essai gratuit, sans CB" },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 pt-16">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #7c96f8 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, #fb923c 0%, transparent 50%)`,
          }}
        />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px),
                           linear-gradient(to right, #ffffff 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left — copy */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-white/90 backdrop-blur-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Conçu pour les agents immobiliers français
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight text-balance">
              Rentrez plus de mandats{" "}
              <span className="text-accent-400">grâce aux données</span>{" "}
              <span className="underline decoration-accent-400 decoration-4 underline-offset-4">
                officielles
              </span>
            </h1>

            <p className="text-lg text-white/70 max-w-xl leading-relaxed">
              ImmoExpert donne aux agents immobiliers une longueur d&apos;avance :
              carte des prix rue par rue, prospection prédictive, rapports de marché
              personnalisés et badge Expert pour convaincre chaque vendeur.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/inscription"
                className="inline-flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-accent-500/30 hover:shadow-accent-500/50 hover:-translate-y-0.5"
              >
                Essayer gratuitement — 14 jours
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#demo"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3.5 rounded-xl transition-all border border-white/20"
              >
                Voir la carte en direct
              </Link>
            </div>

            {/* Trust */}
            <p className="text-sm text-white/50">
              Sans carte bancaire · Données DVF officielles · Résiliation en 1 clic
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
              {stats.map(({ icon: Icon, value, label }) => (
                <div key={label} className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-4 h-4 text-accent-400" />
                    <span className="text-2xl font-bold text-white">
                      {value}
                    </span>
                  </div>
                  <p className="text-xs text-white/50">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — map preview */}
          <div className="relative lg:h-[560px] h-[360px] rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-white/10">
            <MapPreview />

            {/* Floating price card */}
            <div className="absolute top-4 left-4 glass rounded-xl p-3 shadow-lg border border-white/50">
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
            </div>

            {/* Floating prospect card */}
            <div className="absolute bottom-4 right-4 glass rounded-xl p-3 shadow-lg border border-white/50">
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
