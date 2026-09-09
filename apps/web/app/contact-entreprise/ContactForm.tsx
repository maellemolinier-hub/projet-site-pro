"use client";

import { useState, FormEvent } from "react";
import { ArrowLeft, Building2, Phone, Mail, CheckCircle, Loader2 } from "lucide-react";
import { getUtmParams, trackEvent } from "@/lib/analytics";

type FormState = {
  prenom: string;
  nom: string;
  email: string;
  societe: string;
  telephone: string;
  typeStructure: string;
  nbUtilisateurs: string;
  message: string;
};

const initialState: FormState = {
  prenom: "",
  nom: "",
  email: "",
  societe: "",
  telephone: "",
  typeStructure: "",
  nbUtilisateurs: "",
  message: "",
};

export default function ContactEntrepriseForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function update<K extends keyof FormState>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    try {
      // Attach UTM params from sessionStorage
      const utm = getUtmParams();

      const res = await fetch("/api/contact-entreprise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ...utm }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error || "Une erreur est survenue. Réessayez plus tard.");
        return;
      }

      // Fire GA4 conversion event
      trackEvent("generate_lead", {
        form_id: "contact_entreprise",
        utm_source: utm.utm_source,
        utm_medium: utm.utm_medium,
        utm_campaign: utm.utm_campaign,
      });

      setStatus("success");
      setForm(initialState);
    } catch {
      setStatus("error");
      setErrorMsg("Erreur réseau. Vérifiez votre connexion et réessayez.");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-5 h-5 text-brand-600" />
          <h2 className="font-semibold text-gray-900">Demande envoyée</h2>
        </div>
        <p className="text-gray-600 text-sm">
          Merci. Votre demande a bien été enregistrée. Notre équipe revient vers vous sous 48h.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="text-sm text-brand-600 hover:text-brand-700 font-medium"
        >
          Envoyer une autre demande
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Building2 className="w-5 h-5 text-brand-600" />
        <h2 className="font-semibold text-gray-900">Demander un devis</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Prénom</label>
          <input
            type="text"
            required
            value={form.prenom}
            onChange={(e) => update("prenom", e.target.value)}
            placeholder="Jean"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Nom</label>
          <input
            type="text"
            required
            value={form.nom}
            onChange={(e) => update("nom", e.target.value)}
            placeholder="Dupont"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Email professionnel</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="jean.dupont@agence.fr"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Nom de la société / raison</label>
          <input
            type="text"
            required
            value={form.societe}
            onChange={(e) => update("societe", e.target.value)}
            placeholder="Cap Entreprendre France"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Téléphone</label>
          <input
            type="tel"
            value={form.telephone}
            onChange={(e) => update("telephone", e.target.value)}
            placeholder="06 12 34 56 78"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Type de structure</label>
          <select
            value={form.typeStructure}
            onChange={(e) => update("typeStructure", e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">Sélectionner...</option>
            <option>Réseaux de mandataires</option>
            <option>Réseaux d'agences franchisées</option>
            <option>Promoteur immobilier</option>
            <option>Agence indépendante multi-sites</option>
            <option>Investisseur / Asset manager</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Nombre d'utilisateurs estimé</label>
        <select
          value={form.nbUtilisateurs}
          onChange={(e) => update("nbUtilisateurs", e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">Sélectionner...</option>
          <option>11 à 30 utilisateurs</option>
          <option>31 à 100 utilisateurs</option>
          <option>101 à 500 utilisateurs</option>
          <option>500+ utilisateurs</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Votre besoin (optionnel)</label>
        <textarea
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          placeholder="Décrivez votre projet, vos intégrations en place, vos enjeux…"
          rows={3}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Envoi en cours…
          </>
        ) : (
          "Envoyer la demande"
        )}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Réponse garantie sous 48h · Démonstration incluse
      </p>

      <div className="pt-2 border-t border-gray-100 space-y-1.5">
        <a
          href="mailto:entreprise@cap-entreprendre-france.fr"
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600"
        >
          <Mail className="w-3.5 h-3.5" /> entreprise@cap-entreprendre-france.fr
        </a>
        <a
          href="tel:+33123456789"
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600"
        >
          <Phone className="w-3.5 h-3.5" /> 01 23 45 67 89
        </a>
      </div>
    </form>
  );
}