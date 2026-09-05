import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact entreprise — Réseaux et Promoteurs | Cap Entreprendre France",
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
                  Offre Entreprise
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
                  "Formation équipes en présentiel ou distant",
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

            {/* Right — interactive form */}
            <ContactForm />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}