import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Building2, Phone, Mail, CheckCircle } from "lucide-react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";

export const metadata: Metadata = {
  title: "Contact entreprise — Réseaux et Promoteurs | ImmoExpert",
};

export default function ContactEntreprisePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/#tarifs" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-8">
            <ArrowLeft className="w-4 h-4" /> Retour aux tarifs
          </Link>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left */}
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold tracking-widest text-brand-600 uppercase">
                  Offre Enterprise
                </span>
                <h1 className="text-3xl font-bold text-gray-900 mt-2">
                  Réseaux d'agences et Promoteurs
                </h1>
                <p className="text-gray-500 mt-3 leading-relaxed">
                  Vous pilotez plusieurs agences, un réseau de mandataires ou une activité de promotion immobilière ?
                  Notre offre sur-mesure s'adapte à votre volume et vos intégrations.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  "API données immobilières (prix, transactions, tendances)",
                  "Analyse foncière et potentiel constructible",
                  "Multi-agences et multi-utilisateurs illimités",
                  "Dashboard administrateur centralisé",
                  "Intégration CRM (Salesforce, HubSpot, sur-mesure)",
                  "SLA garanti 99,9% avec support dédié",
                  "Marque blanche complète (domaine, logo, couleurs)",
                  "Formation équipe en présentiel ou distanciel",
                ].map((f) => (
                  <div key={f} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-brand-600 mt-0.5 shrink-0" />
                    <span className="text-gray-700 text-sm">{f}</span>
                  </div>
                ))}
              </div>

              <div className="bg-brand-50 rounded-2xl p-5 border border-brand-100">
                <p className="font-semibold text-brand-900 mb-1">Tarification</p>
                <p className="text-brand-700 text-sm">
                  À partir de <strong>3 500 € HT/an</strong> pour les réseaux.
                  Devis personnalisé sous 48h selon le volume et les fonctionnalités.
                </p>
              </div>
            </div>

            {/* Right — form */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-5 h-5 text-brand-600" />
                <h2 className="font-semibold text-gray-900">Demander un devis</h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Prénom", placeholder: "Jean" },
                  { label: "Nom", placeholder: "Dupont" },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                    <input
                      type="text"
                      placeholder={f.placeholder}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                ))}
              </div>

              {[
                { label: "Email professionnel", placeholder: "jean.dupont@agence.fr", type: "email" },
                { label: "Nom de la société / réseau", placeholder: "Réseau Immo France", type: "text" },
                { label: "Téléphone", placeholder: "06 12 34 56 78", type: "tel" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs text-gray-500 mb-1">Type de structure</label>
                <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option>Réseau de mandataires</option>
                  <option>Réseau d'agences franchisées</option>
                  <option>Promoteur immobilier</option>
                  <option>Agence indépendante multi-sites</option>
                  <option>Investisseur / Asset manager</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Nombre d'utilisateurs estimé</label>
                <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option>11 à 30 utilisateurs</option>
                  <option>31 à 100 utilisateurs</option>
                  <option>101 à 500 utilisateurs</option>
                  <option>500+ utilisateurs</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Votre besoin (optionnel)</label>
                <textarea
                  placeholder="Décrivez votre projet, vos intégrations en place, vos enjeux…"
                  rows={3}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>

              <button className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl transition-colors">
                Envoyer la demande
              </button>

              <p className="text-xs text-gray-400 text-center">
                Réponse garantie sous 48h · Démonstration incluse
              </p>

              <div className="pt-2 border-t border-gray-100 space-y-1.5">
                <a href="mailto:entreprise@immoexpert.fr" className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600">
                  <Mail className="w-3.5 h-3.5" /> entreprise@immoexpert.fr
                </a>
                <a href="tel:+33123456789" className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600">
                  <Phone className="w-3.5 h-3.5" /> 01 23 45 67 89
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
