"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MapPin, Eye, EyeOff, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

const PLAN_META: Record<string, { label: string; highlights: string[]; price: string }> = {
  starter: {
    label: "Starter",
    price: "490 €/an",
    highlights: ["Carte des prix nationale", "10 rapports/mois", "Essai 14 jours gratuit"],
  },
  expert: {
    label: "Expert",
    price: "990 €/an",
    highlights: ["Prospection IA terrain", "Vue 3D", "Formation certifiante", "Badge + référencement"],
  },
  agence: {
    label: "Agence Pro",
    price: "1 990 €/an",
    highlights: ["Jusqu'à 10 utilisateurs", "Widget marque blanche", "Dashboard agence"],
  },
};

export default function InscriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") ?? "expert";
  const meta = PLAN_META[plan] ?? PLAN_META.expert;

  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error ?? "Erreur lors de la création du compte");
      setLoading(false);
      return;
    }

    const login = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (login?.error) {
      toast.error("Compte créé mais connexion échouée. Connectez-vous manuellement.");
      router.push("/connexion");
      return;
    }

    toast.success("Bienvenue sur Cap Entreprendre France !");
    router.push("/dashboard");
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 flex">
      {/* Left — value prop */}
      <div className="hidden lg:flex flex-col justify-center p-16 flex-1 max-w-lg">
        <Link href="/" className="flex items-center gap-2 mb-12">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl text-white">
            Cap Entreprendre France
          </span>
        </Link>

        <span className="text-xs font-semibold text-accent-400 tracking-widest uppercase mb-2">
          Plan {meta.label} — {meta.price}
        </span>
        <h1 className="text-3xl font-bold text-white mb-2">
          14 jours gratuits, sans engagement
        </h1>
        <p className="text-white/60 mb-8">Aucune carte bancaire requise. Résiliation en 1 clic.</p>

        <div className="space-y-3">
          {meta.highlights.map((h) => (
            <div key={h} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-white/80 text-sm">{h}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-5">
          <div className="lg:hidden text-center mb-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-brand-600 flex items-center justify-center">
                <MapPin className="w-3 h-3 text-white" />
              </div>
              <span className="font-bold text-gray-900">Cap Entreprendre France</span>
            </Link>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900">Créer mon compte</h2>
            <p className="text-gray-400 text-sm mt-0.5">Plan {meta.label} · {meta.price}</p>
          </div>

          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            {googleLoading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
            }
            Continuer avec Google
          </button>

          <div className="flex items-center gap-3 text-xs text-gray-400">
            <div className="flex-1 h-px bg-gray-100" />ou<div className="flex-1 h-px bg-gray-100" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {(["firstName", "lastName"] as const).map((k) => (
                <div key={k}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {k === "firstName" ? "Prénom" : "Nom"}
                  </label>
                  <input
                    type="text"
                    value={form[k]}
                    onChange={set(k)}
                    required
                    placeholder={k === "firstName" ? "Sophie" : "Martin"}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email professionnel</label>
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                required
                placeholder="sophie@agence.fr"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  required
                  minLength={8}
                  placeholder="8 caractères minimum"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Créer mon compte — 14 jours gratuits
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center">
            En créant un compte, vous acceptez nos{" "}
            <Link href="/cgu" className="underline hover:text-gray-600">CGU</Link>
          </p>

          <p className="text-center text-sm text-gray-500">
            Déjà un compte ?{" "}
            <Link href="/connexion" className="text-brand-600 hover:text-brand-700 font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
