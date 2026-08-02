"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Slack, Bot, Check, Link2, Unlink } from "lucide-react";
import type { LeadAssistantSettings } from "@immoexpert/db";

export function LeadAssistantSettingsForm({
  settings,
  slackConnected,
  slackError,
}: {
  settings: LeadAssistantSettings | null;
  slackConnected: boolean;
  slackError: string | null;
}) {
  const [businessDescription, setBusinessDescription] = useState(settings?.businessDescription ?? "");
  const [bookingLink, setBookingLink] = useState(settings?.bookingLink ?? "");
  const [minIntentScore, setMinIntentScore] = useState(settings?.minIntentScore ?? 0.6);
  const [saving, setSaving] = useState(false);
  const [connected, setConnected] = useState(!!settings?.slackTeamId);

  useEffect(() => {
    if (slackConnected) toast.success("Slack connecté avec succès");
    if (slackError) toast.error("Échec de la connexion Slack — réessayez");
  }, [slackConnected, slackError]);

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/lead-assistant/settings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        businessDescription,
        bookingLink: bookingLink || null,
        minIntentScore,
      }),
    });
    setSaving(false);
    if (res.ok) toast.success("Paramètres enregistrés");
    else toast.error("Erreur lors de l'enregistrement");
  };

  const disconnectSlack = async () => {
    await fetch("/api/lead-assistant/settings", { method: "DELETE" });
    setConnected(false);
    toast.success("Slack déconnecté");
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Bot className="w-6 h-6 text-brand-600" /> Assistant IA — Paramètres
      </h1>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Connexion Slack</h2>
              <p className="text-gray-500 text-sm mt-0.5">
                L'assistant lit les messages entrants de votre workspace et y répond automatiquement.
              </p>
            </div>
            {connected ? (
              <span className="flex items-center gap-1.5 bg-green-50 text-green-700 text-sm font-semibold px-3 py-1.5 rounded-full">
                <Check className="w-4 h-4" /> Connecté
              </span>
            ) : null}
          </div>

          {connected ? (
            <button
              onClick={disconnectSlack}
              className="flex items-center gap-2 text-sm font-medium text-red-600 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors"
            >
              <Unlink className="w-4 h-4" /> Déconnecter Slack
            </button>
          ) : (
            <a
              href="/api/lead-assistant/slack/install"
              className="flex items-center gap-2 w-fit bg-[#4A154B] hover:bg-[#3a1039] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
            >
              <Slack className="w-4 h-4" /> Connecter Slack
            </a>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-900">Votre activité</h2>
          <p className="text-gray-500 text-sm">
            Décrivez ce que vous vendez : l'IA s'en sert pour qualifier les prospects et rédiger les propositions.
          </p>
          <textarea
            value={businessDescription}
            onChange={(e) => setBusinessDescription(e.target.value)}
            rows={4}
            placeholder="Ex : agence immobilière spécialisée dans l'estimation et la vente de biens en Île-de-France, mandats exclusifs, accompagnement de A à Z."
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Link2 className="w-4 h-4 text-brand-600" /> Lien de prise de rendez-vous
          </h2>
          <p className="text-gray-500 text-sm">
            Une fois un lead qualifié, l'assistant l'inclut dans sa proposition (Calendly, Cal.com…).
          </p>
          <input
            type="url"
            value={bookingLink}
            onChange={(e) => setBookingLink(e.target.value)}
            placeholder="https://calendly.com/votre-nom/rdv"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-900">Seuil de qualification</h2>
          <p className="text-gray-500 text-sm">
            Score d'intention minimum (0 à 100 %) à partir duquel l'assistant considère un contact comme un
            lead qualifié et envoie automatiquement une proposition.
          </p>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={minIntentScore}
              onChange={(e) => setMinIntentScore(Number(e.target.value))}
              className="flex-1 accent-brand-600"
            />
            <span className="text-sm font-bold text-gray-900 w-12 text-right">
              {Math.round(minIntentScore * 100)}%
            </span>
          </div>
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
