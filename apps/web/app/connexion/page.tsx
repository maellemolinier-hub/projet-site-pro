import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";

export const metadata: Metadata = { title: "Connexion — ImmoExpert" };

export default function ConnexionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 flex flex-col items-center justify-center p-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
          <MapPin className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-xl text-white">
          Immo<span className="text-accent-400">Expert</span>
        </span>
      </Link>
      <SignIn
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
  );
}
