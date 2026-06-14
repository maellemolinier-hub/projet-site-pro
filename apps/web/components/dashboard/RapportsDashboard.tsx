"use client";

import { useState } from "react";
import { FileText, Download, Plus, BarChart3, MapPin, Calendar, Loader2 } from "lucide-react";

const SAVED_REPORTS = [
  { id: "r1", title: "Marché Lyon 6e", zone: "Lyon 6e (69006)", date: "14 juin 2026", pages: 4, status: "ready" },
  { id: "r2", title: "Analyse Bordeaux Chartrons", zone: "Bordeaux (33000)", date: "10 juin 2026", pages: 5, status: "ready" },
  { id: "r3", title: "Paris 15e — T2/T3", zone: "Paris 15e (75015)", date: "2 juin 2026", pages: 3, status: "ready" },
  { id: "r4", title: "Secteur Nantes Île de Nantes", zone: "Nantes (44000)", date: "28 mai 2026", pages: 4, status: "ready" },
];

export function RapportsDashboard() {
  const [generating, setGenerating] = useState(false);
  const [zone, setZone] = useState("");
  const [type, setType] = useState("résidentiel");

  const generate = async () => {
    if (!zone) return;
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 3000));
    setGenerating(false);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rapports de marché</h1>
        <p className="text-gray-500 mt-1">
          Générez des PDF professionnels pour impressionner vos clients vendeurs
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Generator form */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Plus className="w-5 h-5 text-brand-600" />
            <h2 className="font-semibold text-gray-900">Nouveau rapport</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Zone géographique</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  placeholder="Adresse, ville, CP…"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Type de bien</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option>Résidentiel (tous types)</option>
                <option>Appartements uniquement</option>
                <option>Maisons uniquement</option>
                <option>Locatif / investissement</option>
                <option>Commercial</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Période d'analyse</label>
              <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option>12 derniers mois</option>
                <option>6 derniers mois</option>
                <option>24 derniers mois</option>
                <option>36 derniers mois</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Rayon</label>
              <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option>500 m autour du point</option>
                <option>1 km autour du point</option>
                <option>Quartier complet</option>
                <option>Commune entière</option>
              </select>
            </div>
          </div>

          <button
            onClick={generate}
            disabled={!zone || generating}
            className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            {generating
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Génération en cours…</>
              : <><BarChart3 className="w-4 h-4" /> Générer le rapport PDF</>
            }
          </button>

          <p className="text-xs text-gray-400 text-center">
            Données DVF + annonces actives · Personnalisé à votre logo
          </p>
        </div>

        {/* Reports list */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="font-semibold text-gray-900">Rapports sauvegardés</h2>
          <div className="space-y-3">
            {SAVED_REPORTS.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 hover:border-brand-200 transition-colors"
              >
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{report.title}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <MapPin className="w-3 h-3" /> {report.zone}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar className="w-3 h-3" /> {report.date}
                    </span>
                    <span className="text-xs text-gray-400">{report.pages} pages</span>
                  </div>
                </div>
                <button className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors">
                  <Download className="w-3.5 h-3.5" /> Télécharger
                </button>
              </div>
            ))}
          </div>

          {/* Usage */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Rapports ce mois</span>
              <span className="text-sm font-bold text-gray-900">4 / illimité</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-brand-600 rounded-full" style={{ width: "4%" }} />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Plan Expert · Rapports illimités</p>
          </div>
        </div>
      </div>
    </div>
  );
}
