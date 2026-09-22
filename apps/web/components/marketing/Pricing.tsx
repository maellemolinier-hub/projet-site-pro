"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Zap } from "lucide-react";
import { Reveal } from "@/components/marketing/Reveal";

const plans = [
  {
    name: "Starter",
    tagline: "Pour débuter",
    monthlyPrice: 59,
    annualPrice: 490,
    annualMonthly: 41,
    color: "border-ink-100",
    buttonClass: "bg-ink-950 hover:bg-ink-800 text-white",
    popular: false,
    features: [
      "Carte des prix nationale",
      "Historique DVF 5 ans",
      "10 rapports de marché / mois",
      "Accès web uniquement",
      "Support email",
    ],
    missing: [
      "App terrain prospection",
      "Vue 3D bâtiments",
      "Widget intégration site",
      "Formation certifiante",
      "Badge Expert + référencement",
    ],
  },
  {
    name: "Expert",
    tagline: "Le plus populaire",
    monthlyPrice: 129,
    annualPrice: 990,
    annualMonthly: 83,
    color: "border-brand-600 ring-2 ring-brand-600",
    buttonClass: "bg-brand-600 hover:bg-brand-700 text-white",
    popular: true,
    features: [
      "Tout du Starter",
      "App terrain prospection prédictive IA",
      "Vue 3D bâtiments CesiumJS",
      "Rapports illimités",
      "Widget intégration sur votre site",
      "Formation Expert Valeur Vénale",
      "Badge certifié + référencement annuaire",
      "Support prioritaire",
    ],
    missing: [],
  },
  {
    name: "Agence Pro",
    tagline: "Pour les équipes",
    monthlyPrice: 249,
    annualPrice: 1990,
    annualMonthly: 166,
    color: "border-ink-100",
    buttonClass: "bg-ink-950 hover:bg-ink-800 text-white",
    popular: false,
    features: [
      "Tout du plan Expert",
      "Jusqu'à 10 utilisateurs",
      "Dashboard agence centralisé",
      "Statistiques équipe",
      "Landing page agence branded",
      "Intégration CRM (Apimo, Hektor…)",
      "Onboarding dédié",
      "SLA 99,9%",
    ],
    missing: [],
  },
];

export function Pricing() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="tarifs" className="py-24 bg-cream-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Reveal className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block text-xs font-semibold tracking-widest text-brand-600 uppercase mb-3">
            Tarifs
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-ink-950 mb-4">
            Transparent, sans surprise
          </h2>
          <p className="text-ink-500 text-lg">
            Commencez gratuitement 14 jours. Aucune carte bancaire requise.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span
              className={`text-sm font-medium ${!annual ? "text-ink-950" : "text-ink-300"}`}
            >
              Mensuel
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                annual ? "bg-brand-600" : "bg-ink-200"
              }`}
              aria-label="Facturation annuelle"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                  annual ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium ${annual ? "text-ink-950" : "text-ink-300"}`}
            >
              Annuel{" "}
              <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold ml-1">
                <Zap className="w-3 h-3" />2 mois offerts
              </span>
            </span>
          </div>
        </Reveal>

        {/* Cards */}
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {plans.map((plan, i) => (
            <Reveal
              key={plan.name}
              delay={i * 100}
              className={`bg-white rounded-3xl border-2 ${plan.color} p-8 relative shadow-sm`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-brand-600 text-white text-xs font-semibold px-4 py-1 rounded-full shadow">
                    ⭐ Le plus populaire
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-ink-950">{plan.name}</h3>
                <p className="text-sm text-ink-500 mt-0.5">{plan.tagline}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold text-ink-950">
                    {annual
                      ? `${plan.annualMonthly} €`
                      : `${plan.monthlyPrice} €`}
                  </span>
                  <span className="text-ink-400 text-sm mb-1">
                    / mois HT
                  </span>
                </div>
                {annual && (
                  <p className="text-sm text-ink-500 mt-1">
                    Facturé{" "}
                    <span className="font-semibold text-ink-700">
                      {plan.annualPrice} €
                    </span>{" "}
                    par an
                  </p>
                )}
              </div>

              <Link
                href="/inscription"
                className={`block text-center py-3 px-6 rounded-full font-semibold text-sm transition-all mb-8 ${plan.buttonClass}`}
              >
                Commencer gratuitement
              </Link>

              <ul className="space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-ink-700">{f}</span>
                  </li>
                ))}
                {plan.missing.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 opacity-35">
                    <span className="w-4 h-4 mt-0.5 shrink-0 text-ink-300 text-center leading-none">
                      —
                    </span>
                    <span className="text-sm text-ink-400">{f}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>

        {/* Enterprise */}
        <Reveal className="mt-8 text-center p-8 bg-ink-950 rounded-3xl text-white">
          <h3 className="text-xl font-bold mb-2">
            Réseau d&apos;agences ou Promoteur immobilier ?
          </h3>
          <p className="text-white/70 mb-6">
            Accès API, analyse foncière, multi-agences, SLA dédié. Tarification
            sur mesure à partir de 3 500 €/an.
          </p>
          <Link
            href="/contact-entreprise"
            className="inline-flex items-center gap-2 bg-white text-ink-950 font-semibold px-6 py-3 rounded-full hover:bg-white/90 transition-colors"
          >
            Demander un devis personnalisé
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
