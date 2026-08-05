import type { Metadata } from "next";
import { BadgeCheck, Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";
import { db } from "@immoexpert/db";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Vérification de certification — Cap Entreprendre France",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function VerifierPage({ params }: Props) {
  const { id } = await params;

  if (id === "invalid") {
    return <InvalidPage reason="Lien de vérification invalide." />;
  }

  const certification = await db.certification.findUnique({
    where: { certificateId: id },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          expertProfile: { select: { slug: true, city: true } },
        },
      },
    },
  });

  if (!certification) {
    return <InvalidPage reason="Aucune certification trouvée pour cet identifiant." />;
  }

  const isExpired =
    certification.expiresAt && certification.expiresAt < new Date();
  const isValid =
    certification.status === "CERTIFIED" && !isExpired;

  const name = [
    certification.user.firstName,
    certification.user.lastName,
  ]
    .filter(Boolean)
    .join(" ") || "Expert Cap Entreprendre France";

  const slug = certification.user.expertProfile?.slug;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {isValid ? (
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 text-center space-y-6">
            <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center mx-auto">
              <BadgeCheck className="w-10 h-10 text-green-600" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-1">
                Certification valide ✓
              </h1>
              <p className="text-gray-500 text-sm">
                Ce professionnel est bien certifié Cap Entreprendre France
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 text-left space-y-3">
              {[
                { label: "Titulaire", value: name },
                { label: "Formation", value: "Expert en Valeur Vénale" },
                { label: "Score à l'examen", value: certification.score ? `${certification.score}/100` : "—" },
                {
                  label: "Certifié le",
                  value: certification.issuedAt
                    ? certification.issuedAt.toLocaleDateString("fr-FR")
                    : "—",
                },
                {
                  label: "Expire le",
                  value: certification.expiresAt
                    ? certification.expiresAt.toLocaleDateString("fr-FR")
                    : "Illimité",
                },
                { label: "ID de certification", value: id.slice(0, 12).toUpperCase() },
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-gray-400">{row.label}</span>
                  <span className="font-semibold text-gray-900">{row.value}</span>
                </div>
              ))}
            </div>

            {slug && (
              <Link
                href={`/experts/${slug}`}
                className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 text-sm font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                Voir le profil public de {name}
              </Link>
            )}

            <div className="flex items-center gap-2 justify-center text-xs text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              Vérifié le {new Date().toLocaleDateString("fr-FR")}
            </div>
          </div>
        ) : (
          <InvalidPage
            reason={
              isExpired
                ? "Cette certification a expiré."
                : "Cette certification n'est pas encore active."
            }
          />
        )}
      </div>
    </div>
  );
}

function InvalidPage({ reason }: { reason: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 text-center space-y-4">
          <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto">
            <span className="text-4xl">❌</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Certification invalide</h1>
          <p className="text-gray-500 text-sm">{reason}</p>
          <Link
            href="/"
            className="text-brand-600 text-sm hover:text-brand-700 underline"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}