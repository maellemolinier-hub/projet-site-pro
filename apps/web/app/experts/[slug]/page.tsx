import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  BadgeCheck, MapPin, Star, Phone, Globe, Mail,
  ArrowLeft, MessageSquare, Calendar,
} from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

// In production this would be a DB lookup
function getExpert(slug: string) {
  const experts: Record<string, {
    name: string; city: string; postalCode: string;
    specialty: string; bio: string; rating: number;
    reviews: number; initials: string; color: string;
    certifiedSince: string; specialties: string[];
    transactions: number;
  }> = {
    "sophie-martin": {
      name: "Sophie Martin",
      city: "Lyon 6e",
      postalCode: "69006",
      specialty: "Résidentiel ancien",
      bio: "Expert en valeur vénale certifiée Cap Entreprendre France depuis 2023, spécialisée dans le résidentiel haut de gamme à Lyon et sa métropole. Ancienne directrice d'agence, j'accompagne mes clients vendeurs avec des estimations précises basées sur les données DVF et une connaissance fine du marché lyonnais.",
      rating: 4.9,
      reviews: 47,
      initials: "SM",
      color: "bg-brand-100 text-brand-700",
      certifiedSince: "2023",
      specialties: ["Résidentiel ancien", "Appartements de prestige", "Investissement locatif", "Viager"],
      transactions: 143,
    },
  };
  return experts[slug] ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const expert = getExpert(slug);
  if (!expert) return { title: "Expert non trouvé" };
  return {
    title: `${expert.name} — Expert Immobilier Certifié ${expert.city}`,
    description: expert.bio.slice(0, 155),
  };
}

export default async function ExpertPage({ params }: Props) {
  const { slug } = await params;
  const expert = getExpert(slug);
  if (!expert) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-brand-950 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link
            href="/experts"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Tous les experts
          </Link>

          <div className="flex items-start gap-6">
            <div className={`w-20 h-20 rounded-2xl ${expert.color} flex items-center justify-center text-2xl font-bold shrink-0`}>
              {expert.initials}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold">{expert.name}</h1>
                <BadgeCheck className="w-6 h-6 text-brand-300" />
              </div>
              <div className="flex items-center gap-1 text-white/60 text-sm mb-2">
                <MapPin className="w-4 h-4" />
                {expert.city} · {expert.specialty}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-bold">{expert.rating}</span>
                  <span className="text-white/50 text-sm">({expert.reviews} avis)</span>
                </div>
                <span className="text-white/40">·</span>
                <span className="text-white/60 text-sm">{expert.transactions} transactions</span>
                <span className="text-white/40">·</span>
                <span className="text-xs bg-brand-700 text-brand-200 px-2 py-0.5 rounded-full">
                  Certifié {expert.certifiedSince}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-3">À propos</h2>
              <p className="text-gray-600 leading-relaxed">{expert.bio}</p>
            </div>

            {/* Specialties */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-4">Spécialités</h2>
              <div className="flex flex-wrap gap-2">
                {expert.specialties.map((s) => (
                  <span key={s} className="bg-brand-50 text-brand-700 text-sm px-3 py-1 rounded-full font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Certification */}
            <div className="bg-gradient-to-br from-brand-950 to-brand-800 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <BadgeCheck className="w-8 h-8 text-brand-300" />
                <div>
                  <h3 className="font-semibold">Expert certifié Cap Entreprendre France</h3>
                  <p className="text-white/60 text-sm">Formation Expert en Valeur Vénale · Certifié {expert.certifiedSince}</p>
                </div>
              </div>
              <p className="text-white/60 text-sm">
                Cet expert a validé la formation certifiante Cap Entreprendre France en Valeur Vénale,
                incluant les méthodes par comparaison directe, capitalisation des revenus
                et coût de remplacement. Il utilise les données DVF temps réel.
              </p>
              <Link
                href="/formation"
                className="inline-block mt-4 text-xs text-brand-300 hover:text-brand-200 underline"
              >
                En savoir plus sur la certification →
              </Link>
            </div>
          </div>

          {/* Contact sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
              <h2 className="font-semibold text-gray-900">Contacter {expert.name.split(" ")[0]}</h2>

              <button className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors text-sm">
                <MessageSquare className="w-4 h-4" />
                Envoyer un message
              </button>

              <button className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors text-sm border border-gray-200">
                <Calendar className="w-4 h-4" />
                Prendre rendez-vous
              </button>

              <div className="pt-3 border-t border-gray-100 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                  {expert.city} ({expert.postalCode})
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Globe className="w-4 h-4 text-gray-400 shrink-0" />
                  cap-entreprendre-france.fr/experts/{slug}
                </div>
              </div>
            </div>

            {/* Mini stats */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm grid grid-cols-2 gap-4">
              {[
                { label: "Transactions", value: expert.transactions.toString() },
                { label: "Note moyenne", value: `${expert.rating}/5` },
                { label: "Avis clients", value: expert.reviews.toString() },
                { label: "Certifié depuis", value: expert.certifiedSince },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-xs text-gray-400">{s.label}</p>
                  <p className="text-lg font-bold text-gray-900 mt-0.5">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
