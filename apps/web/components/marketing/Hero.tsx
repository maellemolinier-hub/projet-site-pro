"use client";

import Link from "next/link";
import { ArrowRight, TrendingUp, Users, Award } from "lucide-react";
import { MapPreview } from "@/components/map/MapPreview";
import { Reveal } from "@/components/marketing/Reveal";

const stats = [
  { icon: TrendingUp, value: "98%", label: "de précision sur les prix" },
  { icon: Users, value: "44 000+", label: "conseillers en France" },
  { icon: Award, value: "3 700+", label: "experts certifiés" },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-ink-950 via-ink-900 to-ink-800 pt-16">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #6b7690 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, #c9a24c 0%, transparent 50%)`,
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
            <Reveal>
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-[11px] font-medium uppercase tracking-widest text-white/60 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                Données mises à jour en quasi temps réel
              </div>
            </Reveal>

            {/* Headline */}
            <Reveal delay={80}>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] font-medium text-white leading-[1.08] tracking-tight text-balance">
                Les prix de l&apos;immo{" "}
                <span className="gradient-gold-text">rue par rue</span>,{" "}
                <span className="underline decoration-gold-500/70 decoration-1 underline-offset-8">
                  en temps réel
                </span>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="text-lg text-white/60 max-w-xl leading-relaxed">
                La première plateforme tout-en-un pour les professionnels de
                l&apos;immobilier. Carte interactive 3D, prospection prédictive,
                formations certifiantes et annuaire des experts.
              </p>
            </Reveal>

            {/* CTA buttons */}
            <Reveal delay={240}>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/inscription"
                  className="inline-flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-ink-950 font-semibold px-6 py-3.5 rounded-xl transition-all duration-300 ease-premium shadow-lg shadow-gold-500/20 hover:shadow-gold-500/30 hover:-translate-y-0.5"
                >
                  Commencer — 14 jours gratuits
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="#comment-ca-marche"
                  className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-medium px-6 py-3.5 rounded-xl transition-all duration-300 ease-premium border border-white/10"
                >
                  Voir la démo
                </Link>
              </div>
            </Reveal>

            {/* Trust */}
            <Reveal delay={280}>
              <p className="text-sm text-white/35">
                Sans carte bancaire · Résiliation en 1 clic · Données DVF + PERVAL
              </p>
            </Reveal>

            {/* Stats */}
            <Reveal delay={320}>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                {stats.map(({ icon: Icon, value, label }) => (
                  <div key={label} className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Icon className="w-4 h-4 text-gold-400" />
                      <span className="text-2xl font-display font-medium text-white">
                        {value}
                      </span>
                    </div>
                    <p className="text-xs text-white/40">{label}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Right — map preview */}
          <Reveal
            delay={160}
            className="relative lg:h-[560px] h-[360px] rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-white/10"
          >
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
                <span className="w-2 h-2 bg-gold-500 rounded-full" />
                <span className="text-xs text-gold-700 font-medium">
                  Score 87% — Mise en vente probable
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
