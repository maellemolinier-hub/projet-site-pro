"use client";

import { useState } from "react";
// auth managed via dashboard layout
import { CreditCard, Bell, Shield, Plug, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const SECTIONS = ["Compte", "Abonnement", "Notifications", "Intégrations"] as const;
type Section = typeof SECTIONS[number];

export function ParametresPage() {
  const [section, setSection] = useState<Section>("Compte");
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Paramètres</h1>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {SECTIONS.map((s) => {
              const icons: Record<Section, React.ElementType> = {
                Compte: Shield,
                Abonnement: CreditCard,
                Notifications: Bell,
                Intégrations: Plug,
              };
              const Icon = icons[s];
              return (
                <button
                  key={s}
                  onClick={() => setSection(s)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors text-left border-b border-gray-50 last:border-0",
                    section === s
                      ? "bg-brand-50 text-brand-700 border-l-2 border-l-brand-600"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <Icon className={cn("w-4 h-4", section === s ? "text-brand-600" : "text-gray-400")} />
                  {s}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-4">
          {section === "Compte" && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
              <h2 className="font-semibold text-gray-900">Informations personnelles</h2>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                  SM
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Sophie Martin</p>
                  <p className="text-xs text-gray-400">sophie.martin@example.fr</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Prénom", value: "Sophie" },
                  { label: "Nom", value: "Martin" },
                  { label: "Email", value: "sophie.martin@example.fr" },
                  { label: "Téléphone", value: "06 12 34 56 78" },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                    <input
                      type="text"
                      defaultValue={f.value}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={save}
                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                {saved ? <><Check className="w-4 h-4" /> Sauvegardé</> : "Mettre à jour"}
              </button>
            </div>
          )}

          {section === "Abonnement" && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-900">Plan actuel</h2>
                    <p className="text-gray-500 text-sm mt-0.5">Gérez votre abonnement</p>
                  </div>
                  <span className="bg-brand-100 text-brand-700 text-sm font-bold px-3 py-1 rounded-full">
                    Expert
                  </span>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  {[
                    { label: "Plan", value: "Expert" },
                    { label: "Facturation", value: "Annuelle — 990 € HT/an" },
                    { label: "Prochain renouvellement", value: "14 juin 2027" },
                    { label: "Statut", value: "Actif ✓" },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between text-sm">
                      <span className="text-gray-500">{row.label}</span>
                      <span className="font-medium text-gray-900">{row.value}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 text-sm font-medium text-gray-700 border border-gray-200 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                    Changer de plan
                  </button>
                  <button className="flex-1 text-sm font-medium text-red-500 border border-red-200 py-2.5 rounded-xl hover:bg-red-50 transition-colors">
                    Résilier
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Historique de facturation</h3>
                <div className="space-y-2">
                  {[
                    { date: "14 juin 2026", amount: "990,00 €", status: "Payé" },
                    { date: "14 juin 2025", amount: "990,00 €", status: "Payé" },
                  ].map((invoice) => (
                    <div key={invoice.date} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Plan Expert annuel</p>
                          <p className="text-xs text-gray-400">{invoice.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-900">{invoice.amount}</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{invoice.status}</span>
                        <button className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                          PDF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {section === "Notifications" && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
              <h2 className="font-semibold text-gray-900">Préférences de notification</h2>
              <div className="space-y-3">
                {[
                  { label: "Nouveaux prospects IA", desc: "Alertes quand un prospect avec score >80% est détecté", default: true },
                  { label: "Mises à jour des prix", desc: "Notification quand les prix évoluent de plus de 5% dans vos zones", default: true },
                  { label: "Avis clients", desc: "Un client a laissé un avis sur votre profil", default: true },
                  { label: "Newsletter hebdomadaire", desc: "Synthèse hebdomadaire du marché immobilier", default: false },
                  { label: "Offres et promotions", desc: "Nouvelles fonctionnalités et offres spéciales", default: false },
                ].map((notif) => (
                  <div key={notif.label} className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0">
                    <div className="pr-4">
                      <p className="text-sm font-medium text-gray-900">{notif.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{notif.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input type="checkbox" defaultChecked={notif.default} className="sr-only peer" />
                      <div className="w-10 h-5 bg-gray-200 peer-checked:bg-brand-600 rounded-full transition-colors peer-focus:ring-2 peer-focus:ring-brand-500/30" />
                      <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5 shadow-sm" />
                    </label>
                  </div>
                ))}
              </div>
              <button onClick={save} className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                {saved ? "✓ Sauvegardé" : "Enregistrer"}
              </button>
            </div>
          )}

          {section === "Intégrations" && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
              <h2 className="font-semibold text-gray-900">Intégrations CRM</h2>
              <p className="text-sm text-gray-500">Connectez ImmoExpert à votre logiciel immobilier existant</p>
              <div className="space-y-3">
                {[
                  { name: "Apimo", desc: "Synchronisation des mandats et contacts", status: "Connecté" },
                  { name: "Hektor", desc: "Import/export des biens et transactions", status: "Disponible" },
                  { name: "Perizia", desc: "Export des avis de valeur", status: "Disponible" },
                  { name: "Facilogi", desc: "Sync mandats", status: "Bientôt" },
                  { name: "Salesforce", desc: "CRM entreprise", status: "Enterprise" },
                ].map((integ) => (
                  <div key={integ.name} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500">
                        {integ.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{integ.name}</p>
                        <p className="text-xs text-gray-400">{integ.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        integ.status === "Connecté" ? "bg-green-100 text-green-700"
                          : integ.status === "Bientôt" ? "bg-gray-100 text-gray-400"
                            : integ.status === "Enterprise" ? "bg-purple-100 text-purple-700"
                              : "bg-gray-100 text-gray-600"
                      )}>
                        {integ.status}
                      </span>
                      {integ.status === "Disponible" && (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
