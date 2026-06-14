import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Check } from "lucide-react";
import { SignUp } from "@clerk/nextjs";

export const metadata: Metadata = { title: "Inscription — ImmoExpert" };

const PLAN_HIGHLIGHTS: Record<string, string[]> = {
  starter: ["Carte des prix nationale", "10 rapports/mois", "Essai 14 jours gratuit"],
  expert: ["Prospection IA terrain", "Vue 3D", "Formation certifiante", "Badge + référencement"],
  agence: ["Jusqu'à 10 utilisateurs", "Widget marque blanche", "Dashboard agence"],
};

export default async function InscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan = "expert" } = await searchParams;
  const highlights = PLAN_HIGHLIGHTS[plan] ?? PLAN_HIGHLIGHTS.expert;
  const planLabel = plan === "starter" ? "Starter" : plan === "agence" ? "Agence Pro" : "Expert";

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 flex">
      {/* Left — value prop */}
      <div className="hidden lg:flex flex-col justify-center p-16 flex-1 max-w-lg">
        <Link href="/" className="flex items-center gap-2 mb-12">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl text-white">
            Immo<span className="text-accent-400">Expert</span>
          </span>
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">
          Commencez votre essai gratuit
        </h1>
        <p className="text-white/60 mb-8">
          Plan <strong className="text-white">{planLabel}</strong> · 14 jours sans engagement · Résiliation en 1 clic
        </p>

        <div className="space-y-3">
          {highlights.map((item) => (
            <div key={item} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-white/80 text-sm">{item}</span>
            </div>
          ))}
        </div>

        <p className="text-white/30 text-xs mt-12">
          Rejoignez 3 700+ experts certifiés en France
        </p>
      </div>

      {/* Right — signup form */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-12">
        <div className="lg:hidden mb-6">
          <Link href="/" className="flex items-center gap-2 justify-center">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white">Immo<span className="text-accent-400">Expert</span></span>
          </Link>
        </div>

        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full max-w-md",
              card: "rounded-2xl shadow-2xl border-0",
              headerTitle: "text-gray-900 font-bold",
              headerSubtitle: "text-gray-500",
              socialButtonsBlockButton: "border border-gray-200 hover:bg-gray-50 rounded-xl",
              formButtonPrimary: "bg-brand-600 hover:bg-brand-700 rounded-xl",
              footerActionLink: "text-brand-600 hover:text-brand-700",
            },
          }}
        />
      </div>
    </div>
  );
}
