"use client";

import { useState } from "react";
import { MapPin, Send, CheckCircle, Phone, Mail, User, Building2 } from "lucide-react";
import dynamic from "next/dynamic";

const PriceMap = dynamic(() => import("@/components/widget/PriceMapWidget"), { ssr: false });

export function LeadCapture() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", city: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="demo" className="bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 py-24 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-white/80 mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Testez l&apos;outil en direct — données réelles
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Voyez les prix de votre marché,{" "}
            <span className="text-accent-400">rue par rue</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Explorez la carte interactive ci-dessous — puis laissez vos coordonnées
            pour accéder à l&apos;ensemble des fonctionnalités.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">

          {/* Map — 3/5 width */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-white/10" style={{ height: 520 }}>
              <PriceMap />
            </div>
            <p className="text-center text-white/30 text-xs mt-3">
              Cliquez et explorez · Données DVF officielles · Paris, Lyon, Marseille, Bordeaux et +
            </p>
          </div>

          {/* Form — 2/5 width */}
          <div className="lg:col-span-2">
            {status === "success" ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-white text-xl font-bold mb-2">Demande reçue !</h3>
                <p className="text-white/60 text-sm">
                  Nous vous contactons dans les 24h pour vous donner accès à l&apos;outil complet.
                </p>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-accent-500/20 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-accent-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Accéder à l&apos;outil</h3>
                    <p className="text-white/50 text-sm">14 jours gratuits, sans engagement</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {[
                    { key: "name", label: "Prénom et nom", placeholder: "Sophie Martin", icon: User, type: "text" },
                    { key: "email", label: "Email professionnel", placeholder: "sophie@agence.fr", icon: Mail, type: "email" },
                    { key: "phone", label: "Téléphone", placeholder: "06 12 34 56 78", icon: Phone, type: "tel" },
                    { key: "city", label: "Ville principale", placeholder: "Paris, Lyon, Bordeaux…", icon: Building2, type: "text" },
                  ].map(({ key, label, placeholder, icon: Icon, type }) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-white/60 mb-1.5">{label}</label>
                      <div className="relative">
                        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input
                          type={type}
                          value={form[key as keyof typeof form]}
                          onChange={set(key as keyof typeof form)}
                          placeholder={placeholder}
                          required={key === "name" || key === "email"}
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition"
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-accent-500/30 hover:shadow-accent-500/50 hover:-translate-y-0.5"
                  >
                    {status === "loading" ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Je veux accéder à l&apos;outil
                  </button>

                  {status === "error" && (
                    <p className="text-red-400 text-xs text-center">Une erreur s&apos;est produite. Réessayez ou contactez-nous.</p>
                  )}

                  <p className="text-white/30 text-xs text-center">
                    Sans carte bancaire · Données sécurisées · RGPD
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
