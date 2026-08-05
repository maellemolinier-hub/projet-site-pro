"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Zap } from "lucide-react";

const plans = [
  {
    name: "Starter",
    tagline: "Pour débuter",
    monthlyPrice: 59,
    annualPrice: 490,
    annualMonthly: 41,
    color: "border-gray-200",
    buttonClass: "bg-gray-900 hover:bg-gray-800 text-white",
    popular: false,
    features: [
      "Identité visuelle de base",
      "Bibliothèque de modèles",
      "10 maquettes de création / mois",
      "Accès web uniquement",
      "Support email",
    ],
    missing: [
      "Accompagnement personnalisé",
      "Studio de création visuelle",
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
      "Accompagnement personnalisé prédictif IA",
      "Studio de création visuelle",
      "Rapports illimités",
      "Widget intégration sur votre site",
      "Formation Expert certifiante",
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
    color: "border-gray-200",
    buttonClass: "bg-gray-900 hover:bg-gray-800 text-white",
    popular: false,
    features: [
      "Tout du plan Expert",
      "Jusqu'à 10 utilisateurs",
      "Dashboard équipe centralisé",
      "Statistiques d'équipe",
      "Landing page personnalisée",
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
    <section id="tarifs" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block text-xs font-semibold tracking-widest text-brand-600 uppercase mb-3">
            Tarifs
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Transparent, sans surprise
          </h2>
          <p className="text-gray-500 text-lg">
            Commencez gratuitement 14 jours. Aucune carte bancaire requise.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <span
            className={`text-sm font-medium ${!annual ? "text-gray-900" : "text-gray-400"}`}
          >
            Mensuel
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              annual ? "bg-brand-600" : "bg-gray-300"
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
            className={`text-sm font-medium ${annual ? "text-gray-900" : "text-gray-400"}`}
          >
            Annuel
            <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold ml-1">
              <Zap className="w-3 h-3" />2 mois offerts
            </span>
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl border-2 ${plan.color} p-8 relative shadow-sm`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-brand-600 text-white text-xs font-semibold px-4 py-1 rounded-full shadow">
                    ★ Le plus populaire
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{plan.tagline}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold text-gray-900">
                    {annual
                      ? `${plan.annualMonthly} €`
                      : `${plan.monthlyPrice} €`}
                  </span>
                  <span className="text-gray-400 text-sm mb-1">
                    /mois HT
                  </span>
                </div>
                {annual && (
                  <p className="text-sm text-gray-500 mt-1">
                    Facturé{" "}
                    <span className="font-semibold text-gray-700">
                      {plan.annualPrice} €
                    </span>{" "}
                    par an
                  </p>
                )}
              </div>

              <Link
                href="/inscription"
                className={`block text-center py-3 px-6 rounded-xl font-semibold text-sm transition-all mb-8 ${plan.buttonClass}`}
              >
                Commencer gratuitement
              </Link>

              <ul className="space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-700">{f}</span>
                  </li>
                ))}
                {plan.missing.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2.5 opacity-35"
                  >
                    <span className="w-4 h-4 mt-0.5 shrink-0 text-gray-300 text-center leading-none">
                      ✕
                    </span>
                    <span className="text-sm text-gray-400">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Enterprise */}
        <div className="mt-8 text-center p-8 bg-brand-950 rounded-2xl text-white">
          <h3 className="text-xl font-bold mb-2">
            Réseau d&apos;agences ou grande entreprise ?
          </h3>
          <p className="text-white/70 mb-6">
            Accès API, multi-équipes, SLA dédié. Tarification
            sur mesure à partir de 3 500 €/an.
          </p>
          <Link
            href="/contact-entreprise"
            className="inline-flex items-center gap-2 bg-white text-brand-900 font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors"
          >
            Demander un devis personnalisé
          </Link>
        </div>
      </div>
    </section>
  );
}