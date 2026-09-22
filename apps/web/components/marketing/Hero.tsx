"use client";

import Link from "next/link";
import { ArrowRight, TrendingUp, Users, Award, ShieldCheck, Gift } from "lucide-react";
import { MapPreview } from "@/components/map/MapPreview";
import { Reveal } from "@/components/marketing/Reveal";

const stats = [
  { icon: TrendingUp, value: "98%", label: "de précision sur les prix" },
  { icon: Users, value: "44 000+", label: "conseillers en France" },
  { icon: Award, value: "3 700+", label: "experts certifiés" },
];

const badges = [
  { icon: Gift, label: "Essai gratuit 14 jours" },
  { icon: ShieldCheck, label: "Sans carte bancaire" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream-100 pt-32 pb-16 lg:pt-40 lg:pb-24">
      {/* Grid overlay discret */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#0d0d0e 1px, transparent 1px),
                           linear-gradient(to right, #0d0d0e 1px, transparent 1px)`,
          backgroundSize: "56px 56px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — copy */}
          <div className="space-y-7">
            {/* Badges */}
            <Reveal>
              <div className="flex flex-wrap gap-2">
                {badges.map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 bg-white border border-ink-100 rounded-full px-3.5 py-1.5 text-xs font-medium text-ink-600 shadow-sm"
                  >
                    <Icon className="w-3.5 h-3.5 text-ink-400" />
                    {label}
                  </span>
                ))}
              </div>
            </Reveal>

            {/* Headline */}
            <Reveal delay={80}>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-ink-950 leading-[1.08] tracking-tight text-balance">
                Les prix de l&apos;immo{" "}
                <span className="text-brand-600">rue par rue</span>, en temps
                réel
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="text-lg text-ink-500 max-w-xl leading-relaxed">
                La première plateforme tout-en-un pour les professionnels de
                l&apos;immobilier. Carte interactive 3D, prospection prédictive,
                formations certifiantes et annuaire des experts.
              </p>
            </Reveal>

            {/* CTA buttons — pilules, comme la ref */}
            <Reveal delay={240}>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/inscription"
                  className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 ease-premium shadow-md shadow-brand-600/20 hover:-translate-y-0.5"
                >
                  Commencer gratuitement
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="#comment-ca-marche"
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-ink-50 text-ink-900 font-semibold px-6 py-3 rounded-full transition-all duration-300 ease-premium border border-ink-200"
                >
                  Voir la démo
                </Link>
              </div>
            </Reveal>

            {/* Stats */}
            <Reveal delay={320}>
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-ink-100">
                {stats.map(({ icon: Icon, value, label }) => (
                  <div key={label} className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Icon className="w-4 h-4 text-brand-600" />
                      <span className="text-2xl font-bold text-ink-950">
                        {value}
                      </span>
                    </div>
                    <p className="text-xs text-ink-400">{label}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Right — map preview (équivalent de la démo produit) */}
          <Reveal
            delay={160}
            className="relative lg:h-[520px] h-[340px] rounded-3xl overflow-hidden shadow-xl shadow-ink-950/10 border border-ink-100"
          >
            <MapPreview />

            {/* Floating price card */}
            <div className="absolute top-4 left-4 glass rounded-xl p-3 shadow-lg border border-white/60">
              <p className="text-xs text-ink-400 font-medium">
                Rue de Rivoli, Paris 1er
              </p>
              <p className="text-xl font-bold text-ink-950">
                14 800{" "}
                <span className="text-sm font-normal text-ink-400">
                  €/m²
                </span>
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs text-green-600 font-medium">
                  ▲ +3,2%
                </span>
                <span className="text-xs text-ink-300">sur 12 mois</span>
              </div>
            </div>

            {/* Floating prospect card */}
            <div className="absolute bottom-4 right-4 glass rounded-xl p-3 shadow-lg border border-white/60">
              <p className="text-xs text-ink-400 font-medium">
                Prospect IA détecté
              </p>
              <p className="text-sm font-bold text-ink-950">
                12, Bd Haussmann
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-2 h-2 bg-brand-500 rounded-full" />
                <span className="text-xs text-brand-700 font-medium">
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
