"use client";

import { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  Check,
  Stethoscope,
  Zap,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { OFFERS, type Offer } from "@/lib/offers";
import { cn } from "@/lib/utils";

export function OffersShowcase() {
  const [selected, setSelected] = useState<Offer | null>(null);

  return (
    <div className="min-h-screen bg-[#0d1b2a] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1b2a] via-[#12234a] to-[#0d1b2a]" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            CAP Entreprendre France · IA au service des entrepreneurs
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight max-w-3xl mx-auto leading-tight">
            On diagnostique les problèmes de votre entreprise.
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              {" "}On les résout via le digital.
            </span>
          </h1>
          <p className="mt-6 text-white/60 max-w-2xl mx-auto">
            Une équipe d'agents IA autonomes qui créent votre site, vos assistants, votre visibilité
            et votre prospection. Vous pilotez ; l'IA exécute.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#offres"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 font-semibold hover:opacity-90 transition"
            >
              Découvrir les offres <ArrowRight className="w-4 h-4" />
            </a>
            <button
              onClick={() => setSelected(OFFERS[0])}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 font-semibold hover:bg-white/15 transition"
            >
              Demander un devis
            </button>
          </div>

          <div className="mt-12 grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
            <Pillar icon={Stethoscope} title="Diagnostic" text="On identifie ce qui vous coûte des clients." />
            <Pillar icon={Zap} title="Exécution IA" text="Des agents autonomes produisent les livrables." />
            <Pillar icon={ShieldCheck} title="Pilotage simple" text="Vous supervisez en 1 à 2 h par jour." />
          </div>
        </div>
      </section>

      {/* Offers grid */}
      <section id="offres" className="bg-gray-50 text-slate-900 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center">Nos offres</h2>
          <p className="text-center text-slate-500 mt-2 mb-10">
            Choisissez, ou laissez Capia vous orienter vers la bonne solution.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {OFFERS.map((offer) => (
              <div
                key={offer.id}
                className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col hover:shadow-md transition"
              >
                <h3 className="font-semibold text-slate-900">{offer.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{offer.tagline}</p>
                <ul className="mt-4 space-y-1.5 flex-1">
                  {offer.outcomes.map((o) => (
                    <li key={o} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      {o}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex items-center justify-between">
                  {offer.priceHint && (
                    <span className="text-sm font-semibold text-slate-900">{offer.priceHint}</span>
                  )}
                  <button
                    onClick={() => setSelected(offer)}
                    className="inline-flex items-center gap-1 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-emerald-500 px-3 py-2 rounded-xl hover:opacity-90"
                  >
                    Demander un devis <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {selected && <DevisModal offer={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function Pillar({ icon: Icon, title, text }: { icon: typeof Zap; title: string; text: string }) {
  return (
    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
      <Icon className="w-5 h-5 text-emerald-300 mb-2" />
      <p className="font-semibold text-sm">{title}</p>
      <p className="text-xs text-white/50 mt-1">{text}</p>
    </div>
  );
}

function DevisModal({ offer, onClose }: { offer: Offer; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || (!form.email.trim() && !form.phone.trim())) {
      setError("Votre nom et un email ou téléphone, s'il vous plaît.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/assistant/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          clientName: form.name,
          clientEmail: form.email || undefined,
          clientPhone: form.phone || undefined,
          offerId: offer.id,
          summary: `Demande de devis — ${offer.name}. ${form.message}`.trim(),
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Erreur");
      setSent(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white text-slate-900 rounded-3xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {sent ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg">Demande envoyée !</h3>
            <p className="text-sm text-slate-500 mt-2">
              Merci {form.name}. Un expert CAP Entreprendre France vous prépare un devis et vous
              recontacte très vite.
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium"
            >
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div>
              <p className="text-xs text-slate-400">Demande de devis</p>
              <h3 className="font-bold text-lg">{offer.name}</h3>
            </div>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Votre nom / entreprise"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email"
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Téléphone"
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Décrivez votre besoin (optionnel)"
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-emerald-500 px-4 py-3 rounded-xl hover:opacity-90 disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Envoyer ma demande
            </button>
            <p className="text-[10px] text-slate-400 text-center">
              Réponse rapide · sans engagement
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
