import type { Metadata } from "next";
import { BadgeCheck, Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Vérification de certification — ImmoExpert",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function VerifierPage({ params }: Props) {
  const { id } = await params;

  // In production: DB lookup by QR code id
  const isValid = id.length > 8;
  const cert = isValid
    ? {
        name: "Sophie Martin",
        certifiedAt: "15 mars 2023",
        expiresAt: "15 mars 2026",
        slug: "sophie-martin",
        formation: "Expert en Valeur Vénale",
        score: 87,
      }
    : null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {cert ? (
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 text-center space-y-6">
            <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center mx-auto">
              <BadgeCheck className="w-10 h-10 text-green-600" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-1">
                Certification valide ✓
              </h1>
              <p className="text-gray-500 text-sm">
                Ce professionnel est bien certifié ImmoExpert
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 text-left space-y-3">
              {[
                { label: "Titulaire", value: cert.name },
                { label: "Formation", value: cert.formation },
                { label: "Score à l'examen", value: `${cert.score}/100` },
                { label: "Certifié le", value: cert.certifiedAt },
                { label: "Expire le", value: cert.expiresAt },
                { label: "ID de certification", value: id.slice(0, 12).toUpperCase() },
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-gray-400">{row.label}</span>
                  <span className="font-semibold text-gray-900">{row.value}</span>
                </div>
              ))}
            </div>

            <Link
              href={`/experts/${cert.slug}`}
              className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 text-sm font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              Voir le profil public de {cert.name}
            </Link>

            <div className="flex items-center gap-2 justify-center text-xs text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              Vérifié le {new Date().toLocaleDateString("fr-FR")}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 text-center space-y-4">
            <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto">
              <span className="text-4xl">❌</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Certification invalide</h1>
            <p className="text-gray-500 text-sm">
              Aucune certification active trouvée pour cet identifiant.
              Il peut s'agir d'un certificat expiré ou d'un QR code altéré.
            </p>
            <Link href="/" className="text-brand-600 text-sm hover:text-brand-700 underline">
              Retour à l'accueil
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
