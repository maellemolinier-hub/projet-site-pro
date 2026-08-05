import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Building2, Phone, Mail, CheckCircle } from "lucide-react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";

export const metadata: Metadata = {
  title: "Contact entreprise — Projets sur mesure | Cap Entreprendre France",
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
                  Projets sur mesure et accompagnement dédié
                </h1>
                <p className="text-gray-500 mt-3 leading-relaxed">
                  Vous avez un projet spécifique, plusieurs sites ou une stratégie digitale complète à déployer ?
                  Notre offre sur-mesure s'adapte à vos besoins et votre budget.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  "Site e-commerce ou application web sur mesure",
                  "Stratégie de contenu et campagnes publicitaires",
                  "Multi-sites et gestion centralisée",
                  "Dashboard administrateur et statistiques",
                  "Intégration outils tiers (CRM, ERP, sur-mesure)",
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
                  À partir de <strong>3 500 € HT/an</strong> pour les projets sur mesure.
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
                { label: "Email professionnel", placeholder: "jean.dupont@entreprise.fr", type: "email" },
                { label: "Nom de la société", placeholder: "Mon Entreprise", type: "text" },
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
                <label className="block text-xs text-gray-500 mb-1">Type de projet</label>
                <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option>Site web / e-commerce</option>
                  <option>Identité visuelle</option>
                  <option>Stratégie de marque</option>
                  <option>Campagnes publicitaires</option>
                  <option>Projet sur mesure</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Budget estimé</label>
                <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option>Moins de 1 000 €</option>
                  <option>1 000 € à 5 000 €</option>
                  <option>5 000 € à 15 000 €</option>
                  <option>15 000 €+</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Votre besoin (optionnel)</label>
                <textarea
                  placeholder="Décrivez votre projet, vos objectifs, vos contraintes…"
                  rows={3}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>

              <button className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl transition-colors">
                Envoyer la demande
              </button>

              <p className="text-xs text-gray-400 text-center">
                Réponse garantie sous 48h · Devis gratuit inclus
              </p>

              <div className="pt-2 border-t border-gray-100 space-y-1.5">
                <a href="mailto:contact@cap-entreprendre-france.fr" className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600">
                  <Mail className="w-3.5 h-3.5" /> contact@cap-entreprendre-france.fr
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