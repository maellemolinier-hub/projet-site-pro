"use client";

import { useEffect, useMemo, useState } from "react";
import type { AgentCatalogEntry } from "@immoexpert/agents";
import {
  Stethoscope,
  Code2,
  TrendingUp,
  Clapperboard,
  Target,
  PhoneCall,
  Headphones,
  Repeat,
  Sparkles,
  Bot,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  stethoscope: Stethoscope,
  code: Code2,
  "trending-up": TrendingUp,
  clapperboard: Clapperboard,
  target: Target,
  "phone-call": PhoneCall,
  headphones: Headphones,
  repeat: Repeat,
};

interface AgentRunLite {
  role: string;
  status: string;
  summary: string | null;
}
interface OrderLite {
  id: string;
  clientName: string;
  type: string;
  status: string;
  createdAt: string;
  runs: AgentRunLite[];
}

interface Props {
  catalog: AgentCatalogEntry[];
  integrations: Record<string, boolean>;
  userName: string;
}

const INTEGRATION_LABELS: Record<string, string> = {
  anthropic: "Claude",
  gemini: "Gemini",
  make: "Make",
  googleSheets: "Google Sheets",
  hubspot: "HubSpot",
  voice: "Assistant vocal",
};

const STATUS_STYLES: Record<string, string> = {
  RECEIVED: "bg-gray-100 text-gray-600",
  PLANNED: "bg-blue-50 text-blue-600",
  IN_PROGRESS: "bg-amber-50 text-amber-600",
  COMPLETED: "bg-emerald-50 text-emerald-600",
  FAILED: "bg-red-50 text-red-600",
};

export function PilotageDashboard({ catalog, integrations, userName }: Props) {
  const [orders, setOrders] = useState<OrderLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  async function loadOrders() {
    try {
      const res = await fetch("/api/agents/orders", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as { orders: OrderLite[] };
        setOrders(data.orders ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const kpis = useMemo(() => {
    const total = orders.length;
    const inProgress = orders.filter((o) => o.status === "IN_PROGRESS" || o.status === "PLANNED").length;
    const completed = orders.filter((o) => o.status === "COMPLETED").length;
    return { total, inProgress, completed, agents: catalog.length };
  }, [orders, catalog.length]);

  const grouped = useMemo(() => {
    const byCat = new Map<string, AgentCatalogEntry[]>();
    for (const agent of catalog) {
      const arr = byCat.get(agent.category) ?? [];
      arr.push(agent);
      byCat.set(agent.category, arr);
    }
    return [...byCat.entries()];
  }, [catalog]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 leading-tight">Cap Entreprendre France</h1>
              <p className="text-xs text-gray-400">Cerveau central — pilotez vos agents IA</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
          >
            <Plus className="w-4 h-4" />
            Nouvelle commande
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <p className="text-sm text-gray-500">
          Bonjour {userName} — voici votre vue d'ensemble. Objectif : piloter toute l'activité en 1 à 2 h par jour.
        </p>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Commandes" value={kpis.total} icon={Bot} />
          <KpiCard label="En cours" value={kpis.inProgress} icon={Loader2} accent="amber" />
          <KpiCard label="Terminées" value={kpis.completed} icon={CheckCircle2} accent="emerald" />
          <KpiCard label="Agents actifs" value={kpis.agents} icon={Sparkles} accent="indigo" />
        </div>

        {/* Intégrations */}
        <section>
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Connexions</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(integrations).map(([key, active]) => (
              <span
                key={key}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium",
                  active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-400",
                )}
              >
                <span
                  className={cn("w-1.5 h-1.5 rounded-full", active ? "bg-emerald-500" : "bg-gray-300")}
                />
                {INTEGRATION_LABELS[key] ?? key}
                {active ? " · connecté" : " · à brancher"}
              </span>
            ))}
          </div>
        </section>

        {showForm && <NewOrderForm onCreated={() => { setShowForm(false); loadOrders(); }} />}

        {/* Panneau d'agents */}
        <section>
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Vos agents autonomes</h2>
          <div className="space-y-6">
            {grouped.map(([category, agents]) => (
              <div key={category}>
                <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">{category}</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {agents.map((agent) => {
                    const Icon = ICONS[agent.icon] ?? Bot;
                    return (
                      <div
                        key={agent.role}
                        className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition"
                      >
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center mb-3">
                          <Icon className="w-5 h-5 text-indigo-600" />
                        </div>
                        <p className="font-semibold text-sm text-gray-900">{agent.label}</p>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{agent.tagline}</p>
                        <p className="text-[10px] text-gray-400 mt-3 uppercase tracking-wide">
                          {agent.recommendedProvider}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Commandes récentes */}
        <section>
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Commandes récentes</h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-sm text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                Chargement…
              </div>
            ) : orders.length === 0 ? (
              <div className="p-10 text-center">
                <Bot className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Aucune commande pour l'instant.</p>
                <p className="text-xs text-gray-400 mt-1">
                  Créez-en une, ou branchez Google Sheets / Make pour les recevoir automatiquement.
                </p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                    <th className="px-4 py-3 font-medium">Client</th>
                    <th className="px-4 py-3 font-medium">Prestation</th>
                    <th className="px-4 py-3 font-medium">Agents</th>
                    <th className="px-4 py-3 font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-3 font-medium text-gray-900">{order.clientName}</td>
                      <td className="px-4 py-3 text-gray-600">{order.type}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {order.runs.map((run, i) => (
                            <span
                              key={i}
                              title={`${run.role} · ${run.status}`}
                              className={cn(
                                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px]",
                                run.status === "SUCCEEDED"
                                  ? "bg-emerald-50 text-emerald-600"
                                  : run.status === "FAILED"
                                    ? "bg-red-50 text-red-500"
                                    : "bg-gray-100 text-gray-500",
                              )}
                            >
                              {run.status === "SUCCEEDED" ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : run.status === "FAILED" ? (
                                <AlertCircle className="w-3 h-3" />
                              ) : (
                                <Loader2 className="w-3 h-3" />
                              )}
                              {run.role}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-block px-2 py-1 rounded-lg text-xs font-medium",
                            STATUS_STYLES[order.status] ?? "bg-gray-100 text-gray-600",
                          )}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  accent = "gray",
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  accent?: "gray" | "amber" | "emerald" | "indigo";
}) {
  const accents: Record<string, string> = {
    gray: "bg-gray-100 text-gray-500",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", accents[accent])}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
    </div>
  );
}

function NewOrderForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({ clientName: "", type: "", description: "", budget: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/agents/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          clientName: form.clientName,
          type: form.type,
          description: form.description,
          budget: form.budget ? Number(form.budget) : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Erreur");
      }
      onCreated();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
      <h3 className="text-sm font-semibold text-gray-900">Nouvelle commande</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          required
          placeholder="Nom du client / entreprise"
          value={form.clientName}
          onChange={(e) => setForm({ ...form, clientName: e.target.value })}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        <input
          required
          placeholder="Prestation (ex: site + réseaux sociaux)"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>
      <textarea
        required
        placeholder="Brief détaillé de la commande…"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        rows={3}
        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />
      <input
        type="number"
        placeholder="Budget (€, optionnel)"
        value={form.budget}
        onChange={(e) => setForm({ ...form, budget: e.target.value })}
        className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
      >
        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
        Lancer les agents
      </button>
    </form>
  );
}
