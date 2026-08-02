"use client";

import { useMemo, useState } from "react";
import {
  Bot, Search, MessageCircle, CheckCircle, XCircle, Clock,
  AlertCircle, CalendarCheck, Sparkles, Send, Slack,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type {
  LeadAssistantSettings, LeadConversation, LeadMessage, LeadProposal, LeadStatus,
} from "@immoexpert/db";

type ConversationWithDetails = LeadConversation & {
  messages: LeadMessage[];
  proposals: LeadProposal[];
};

const STATUS_CONFIG: Record<LeadStatus, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  NEW: { label: "Nouveau", icon: AlertCircle, color: "text-blue-600", bg: "bg-blue-50" },
  QUALIFYING: { label: "En qualification", icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
  QUALIFIED: { label: "Qualifié", icon: Sparkles, color: "text-purple-600", bg: "bg-purple-50" },
  PROPOSAL_SENT: { label: "Proposition envoyée", icon: Send, color: "text-brand-600", bg: "bg-brand-50" },
  MEETING_REQUESTED: { label: "RDV demandé", icon: CalendarCheck, color: "text-amber-600", bg: "bg-amber-50" },
  MEETING_BOOKED: { label: "RDV pris ✓", icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
  LOST: { label: "Perdu", icon: XCircle, color: "text-gray-400", bg: "bg-gray-50" },
};

function scoreColor(score: number) {
  if (score >= 0.8) return "bg-red-500";
  if (score >= 0.6) return "bg-orange-400";
  return "bg-yellow-400";
}

export function LeadAssistantDashboard({
  settings,
  conversations,
}: {
  settings: LeadAssistantSettings | null;
  conversations: ConversationWithDetails[];
}) {
  const [filter, setFilter] = useState<LeadStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(conversations[0]?.id ?? null);
  const [items, setItems] = useState(conversations);

  const filtered = useMemo(() => {
    return items.filter((c) => {
      if (filter !== "ALL" && c.status !== filter) return false;
      const name = (c.contactName ?? c.contactHandle ?? "").toLowerCase();
      if (search && !name.includes(search.toLowerCase())) return false;
      return true;
    });
  }, [items, filter, search]);

  const selected = items.find((c) => c.id === selectedId) ?? null;

  const updateStatus = async (id: string, status: LeadStatus) => {
    setItems((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    await fetch(`/api/lead-assistant/conversations/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
  };

  if (!settings?.slackBotToken) {
    return <NoIntegrationState />;
  }

  return (
    <div className="flex h-full">
      {/* Left panel */}
      <div className="w-96 border-r border-gray-100 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Bot className="w-4 h-4 text-brand-600" /> Assistant IA
            </h2>
            <Link
              href="/dashboard/assistant-ia/parametres"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              Paramètres
            </Link>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un contact…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex gap-1.5 flex-wrap">
            {(["ALL", "QUALIFYING", "QUALIFIED", "PROPOSAL_SENT", "MEETING_REQUESTED", "MEETING_BOOKED", "LOST"] as const).map((s) => (
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

        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {filtered.length === 0 && (
            <p className="p-6 text-sm text-gray-400 text-center">
              Aucune conversation dans cette catégorie
            </p>
          )}
          {filtered.map((conv) => {
            const statusCfg = STATUS_CONFIG[conv.status];
            return (
              <button
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={cn(
                  "w-full text-left p-4 hover:bg-gray-50 transition-colors",
                  selectedId === conv.id && "bg-brand-50 border-l-2 border-brand-600"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-0.5 shrink-0 mt-0.5">
                    <div className={`w-9 h-9 rounded-xl ${scoreColor(conv.intentScore)} flex items-center justify-center`}>
                      <span className="text-white text-xs font-bold">{Math.round(conv.intentScore * 100)}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 leading-none">intérêt</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {conv.contactName ?? conv.contactHandle ?? "Contact Slack"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                      {conv.intentSummary ?? "En attente de qualification…"}
                    </p>
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

        <div className="p-3 border-t border-gray-100 bg-gray-50 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-sm font-bold text-gray-900">{items.length}</p>
            <p className="text-xs text-gray-400">Total</p>
          </div>
          <div>
            <p className="text-sm font-bold text-purple-600">
              {items.filter((c) => c.intentScore >= (settings.minIntentScore ?? 0.6)).length}
            </p>
            <p className="text-xs text-gray-400">Qualifiés</p>
          </div>
          <div>
            <p className="text-sm font-bold text-green-600">
              {items.filter((c) => c.status === "MEETING_BOOKED").length}
            </p>
            <p className="text-xs text-gray-400">RDV pris</p>
          </div>
        </div>
      </div>

      {/* Detail panel */}
      <div className="flex-1 p-6 overflow-y-auto">
        {selected ? (
          <ConversationDetail conversation={selected} onStatusChange={updateStatus} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-brand-400" />
            </div>
            <h3 className="font-semibold text-gray-900">Sélectionnez une conversation</h3>
            <p className="text-sm text-gray-400 max-w-xs">
              Dès qu'un message arrive sur Slack, l'assistant le qualifie automatiquement et l'affiche ici.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ConversationDetail({
  conversation,
  onStatusChange,
}: {
  conversation: ConversationWithDetails;
  onStatusChange: (id: string, status: LeadStatus) => void;
}) {
  const statusCfg = STATUS_CONFIG[conversation.status];
  const proposal = conversation.proposals[0];

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 rounded-2xl ${scoreColor(conversation.intentScore)} flex flex-col items-center justify-center`}>
          <span className="text-white text-xl font-bold leading-none">{Math.round(conversation.intentScore * 100)}</span>
          <span className="text-white/70 text-[10px] leading-none mt-0.5">%</span>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            {conversation.contactName ?? conversation.contactHandle ?? "Contact Slack"}
          </h2>
          <p className="text-gray-500 text-sm flex items-center gap-1">
            <Slack className="w-3.5 h-3.5" /> Canal Slack
          </p>
          <span className={cn(
            "inline-flex items-center gap-1 mt-1 text-xs px-2.5 py-1 rounded-full font-medium",
            statusCfg.bg, statusCfg.color
          )}>
            <statusCfg.icon className="w-3 h-3" />
            {statusCfg.label}
          </span>
        </div>
      </div>

      {conversation.intentSummary && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-2">
          <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-600" /> Analyse de l'assistant
          </h3>
          <p className="text-sm text-gray-600">{conversation.intentSummary}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
        <h3 className="font-semibold text-gray-900 text-sm">Conversation</h3>
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {conversation.messages.map((m: LeadMessage) => (
            <div key={m.id} className={cn("flex", m.direction === "OUT" ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[80%] text-sm rounded-xl px-3 py-2",
                m.direction === "OUT" ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-800"
              )}>
                {m.body}
              </div>
            </div>
          ))}
        </div>
      </div>

      {proposal && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-2">
          <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
            <Send className="w-4 h-4 text-brand-600" /> Proposition envoyée automatiquement
          </h3>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{proposal.content}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
        <h3 className="font-semibold text-gray-900 text-sm">Actions</h3>
        <div className="flex gap-3">
          <button
            onClick={() => onStatusChange(conversation.id, "MEETING_BOOKED")}
            className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 py-2.5 rounded-xl transition-colors"
          >
            <CalendarCheck className="w-4 h-4" /> Marquer RDV pris
          </button>
          <button
            onClick={() => onStatusChange(conversation.id, "LOST")}
            className="flex-1 text-sm font-medium text-gray-700 border border-gray-200 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Marquer perdu
          </button>
        </div>
      </div>
    </div>
  );
}

function NoIntegrationState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 p-8">
      <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center">
        <Bot className="w-8 h-8 text-brand-500" />
      </div>
      <h3 className="font-semibold text-gray-900 text-lg">Connectez Slack pour activer l'assistant</h3>
      <p className="text-sm text-gray-500 max-w-md">
        L'assistant IA surveille vos conversations Slack entrantes, qualifie l'intention d'achat,
        rédige et envoie une proposition, puis invite le prospect à réserver un rendez-vous — automatiquement.
      </p>
      <Link
        href="/dashboard/assistant-ia/parametres"
        className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
      >
        <Slack className="w-4 h-4" /> Configurer l'assistant
      </Link>
    </div>
  );
}
