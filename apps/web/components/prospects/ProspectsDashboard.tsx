"use client";

import { useState } from "react";
import {
  Search, Filter, MapPin, TrendingUp, Phone,
  CheckCircle, XCircle, Clock, AlertCircle, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ProspectStatus = "NEW" | "CONTACTED" | "IN_PROGRESS" | "CONVERTED" | "LOST";

interface Prospect {
  id: string;
  address: string;
  city: string;
  postalCode: string;
  saleScore: number;
  scoreLabel: string;
  reasons: string[];
  status: ProspectStatus;
  yearsOwned?: number;
  lastMutation?: string;
}

const MOCK_PROSPECTS: Prospect[] = [
  {
    id: "1", address: "23 Rue de la Paix", city: "Paris 2e", postalCode: "75002",
    saleScore: 0.91, scoreLabel: "Très probable", status: "NEW", yearsOwned: 18,
    reasons: ["Détenu depuis 18 ans", "Hausse de prix récente +8% sur 6 mois", "Profil retraite probable"],
  },
  {
    id: "2", address: "7 Avenue Foch", city: "Paris 16e", postalCode: "75016",
    saleScore: 0.84, scoreLabel: "Très probable", status: "CONTACTED", yearsOwned: 24,
    reasons: ["Détenu depuis 24 ans", "Signaux de marché favorables"],
  },
  {
    id: "3", address: "15 Bd des Capucines", city: "Paris 2e", postalCode: "75002",
    saleScore: 0.77, scoreLabel: "Probable", status: "IN_PROGRESS", yearsOwned: 11,
    reasons: ["Mutations nombreuses dans un rayon 300m", "Hausse +5% sur 6 mois"],
  },
  {
    id: "4", address: "44 Rue du Faubourg St-Antoine", city: "Paris 11e", postalCode: "75011",
    saleScore: 0.72, scoreLabel: "Probable", status: "NEW", yearsOwned: 9,
    reasons: ["Ancienneté de détention significative"],
  },
  {
    id: "5", address: "3 Place des Vosges", city: "Paris 4e", postalCode: "75004",
    saleScore: 0.68, scoreLabel: "Probable", status: "CONVERTED", yearsOwned: 15,
    reasons: ["Mutations proches récentes", "Profil successoral potentiel"],
  },
  {
    id: "6", address: "89 Rue de Rivoli", city: "Paris 1er", postalCode: "75001",
    saleScore: 0.61, scoreLabel: "Possible", status: "LOST", yearsOwned: 7,
    reasons: ["Signaux modérés de mise en vente"],
  },
];

const STATUS_CONFIG: Record<ProspectStatus, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  NEW: { label: "Nouveau", icon: AlertCircle, color: "text-blue-600", bg: "bg-blue-50" },
  CONTACTED: { label: "Contacté", icon: Phone, color: "text-orange-600", bg: "bg-orange-50" },
  IN_PROGRESS: { label: "En cours", icon: Clock, color: "text-purple-600", bg: "bg-purple-50" },
  CONVERTED: { label: "Converti ✓", icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
  LOST: { label: "Perdu", icon: XCircle, color: "text-gray-400", bg: "bg-gray-50" },
};

const SCORE_COLORS = {
  high: "bg-red-500",
  med: "bg-orange-400",
  low: "bg-yellow-400",
};

function scoreColor(score: number) {
  if (score >= 0.8) return SCORE_COLORS.high;
  if (score >= 0.65) return SCORE_COLORS.med;
  return SCORE_COLORS.low;
}

export function ProspectsDashboard() {
  const [filter, setFilter] = useState<ProspectStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Prospect | null>(null);
  const [scanning, setScanning] = useState(false);

  const filtered = MOCK_PROSPECTS.filter((p) => {
    if (filter !== "ALL" && p.status !== filter) return false;
    if (search && !p.address.toLowerCase().includes(search.toLowerCase()) &&
        !p.city.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const runScan = async () => {
    setScanning(true);
    await new Promise((r) => setTimeout(r, 2500));
    setScanning(false);
  };

  return (
    <div className="flex h-full">
      {/* Left panel */}
      <div className="w-96 border-r border-gray-100 bg-white flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Prospection IA</h2>
            <button
              onClick={runScan}
              disabled={scanning}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
            >
              {scanning
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Scan en cours…</>
                : <><Search className="w-3.5 h-3.5" /> Scanner ma zone</>
              }
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une adresse…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Status filters */}
          <div className="flex gap-1.5 flex-wrap">
            {(["ALL", "NEW", "CONTACTED", "IN_PROGRESS", "CONVERTED", "LOST"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cn(
                  "text-xs px-2.5 py-1 rounded-full font-medium transition-colors border",
                  filter === s
                    ? "bg-brand-600 text-white border-brand-600"
                    : "bg-white text-gray-500 border-gray-200 hover:border-brand-300"
                )}
              >
                {s === "ALL" ? "Tous" : STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>
        </div>

        {/* Prospects list */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {filtered.length === 0 && (
            <p className="p-6 text-sm text-gray-400 text-center">
              Aucun prospect dans cette catégorie
            </p>
          )}
          {filtered.map((prospect) => {
            const statusCfg = STATUS_CONFIG[prospect.status];
            return (
              <button
                key={prospect.id}
                onClick={() => setSelected(prospect)}
                className={cn(
                  "w-full text-left p-4 hover:bg-gray-50 transition-colors",
                  selected?.id === prospect.id && "bg-brand-50 border-l-2 border-brand-600"
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Score badge */}
                  <div className="flex flex-col items-center gap-0.5 shrink-0 mt-0.5">
                    <div className={`w-9 h-9 rounded-xl ${scoreColor(prospect.saleScore)} flex items-center justify-center`}>
                      <span className="text-white text-xs font-bold">
                        {Math.round(prospect.saleScore * 100)}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 leading-none">score</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{prospect.address}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {prospect.city}
                      {prospect.yearsOwned && (
                        <span className="text-gray-400 ml-1">· {prospect.yearsOwned} ans</span>
                      )}
                    </div>
                    <div className={cn(
                      "inline-flex items-center gap-1 mt-1.5 text-xs px-2 py-0.5 rounded-full",
                      statusCfg.bg, statusCfg.color
                    )}>
                      <statusCfg.icon className="w-3 h-3" />
                      {statusCfg.label}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Stats bar */}
        <div className="p-3 border-t border-gray-100 bg-gray-50 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-sm font-bold text-gray-900">{MOCK_PROSPECTS.length}</p>
            <p className="text-xs text-gray-400">Total</p>
          </div>
          <div>
            <p className="text-sm font-bold text-orange-600">
              {MOCK_PROSPECTS.filter((p) => p.saleScore >= 0.8).length}
            </p>
            <p className="text-xs text-gray-400">Très probables</p>
          </div>
          <div>
            <p className="text-sm font-bold text-green-600">
              {MOCK_PROSPECTS.filter((p) => p.status === "CONVERTED").length}
            </p>
            <p className="text-xs text-gray-400">Convertis</p>
          </div>
        </div>
      </div>

      {/* Detail panel */}
      <div className="flex-1 p-6 overflow-y-auto">
        {selected ? (
          <ProspectDetail prospect={selected} onStatusChange={() => {}} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-orange-400" />
            </div>
            <h3 className="font-semibold text-gray-900">Sélectionnez un prospect</h3>
            <p className="text-sm text-gray-400 max-w-xs">
              Cliquez sur un prospect dans la liste pour voir ses détails et gérer votre suivi.
            </p>
            <button
              onClick={runScan}
              disabled={scanning}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Scanner une nouvelle zone
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProspectDetail({
  prospect,
  onStatusChange,
}: {
  prospect: Prospect;
  onStatusChange: (id: string, status: ProspectStatus) => void;
}) {
  const statusCfg = STATUS_CONFIG[prospect.status];

  return (
    <div className="max-w-lg space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 rounded-2xl ${scoreColor(prospect.saleScore)} flex flex-col items-center justify-center`}>
          <span className="text-white text-xl font-bold leading-none">
            {Math.round(prospect.saleScore * 100)}
          </span>
          <span className="text-white/70 text-[10px] leading-none mt-0.5">%</span>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">{prospect.address}</h2>
          <p className="text-gray-500 text-sm">{prospect.city} · {prospect.postalCode}</p>
          <span className={cn(
            "inline-flex items-center gap-1 mt-1 text-xs px-2.5 py-1 rounded-full font-medium",
            statusCfg.bg, statusCfg.color
          )}>
            <statusCfg.icon className="w-3 h-3" />
            {statusCfg.label}
          </span>
        </div>
      </div>

      {/* Signals */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
        <h3 className="font-semibold text-gray-900 text-sm">Signaux détectés par l'IA</h3>
        <ul className="space-y-2">
          {prospect.reasons.map((r) => (
            <li key={r} className="flex items-start gap-2.5 text-sm text-gray-600">
              <TrendingUp className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
              {r}
            </li>
          ))}
        </ul>
      </div>

      {/* Property info */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm grid grid-cols-2 gap-4">
        {[
          { label: "Score de vente", value: `${Math.round(prospect.saleScore * 100)}% — ${prospect.scoreLabel}` },
          { label: "Ancienneté propriétaire", value: prospect.yearsOwned ? `~${prospect.yearsOwned} ans` : "Inconnue" },
          { label: "Dernière transaction DVF", value: prospect.lastMutation ?? "N/D" },
          { label: "Code postal", value: prospect.postalCode },
        ].map((info) => (
          <div key={info.label}>
            <p className="text-xs text-gray-400">{info.label}</p>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">{info.value}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
        <h3 className="font-semibold text-gray-900 text-sm">Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          {(["CONTACTED", "IN_PROGRESS", "CONVERTED", "LOST"] as ProspectStatus[]).map((s) => {
            const cfg = STATUS_CONFIG[s];
            return (
              <button
                key={s}
                onClick={() => onStatusChange(prospect.id, s)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors",
                  prospect.status === s
                    ? `${cfg.bg} ${cfg.color} border-current`
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                )}
              >
                <cfg.icon className="w-3.5 h-3.5" />
                {cfg.label}
              </button>
            );
          })}
        </div>

        <textarea
          placeholder="Notes sur ce prospect…"
          rows={3}
          className="w-full text-sm border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />
        <button className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
          Sauvegarder
        </button>
      </div>
    </div>
  );
}
