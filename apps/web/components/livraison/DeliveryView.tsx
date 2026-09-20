"use client";

import { useEffect, useState } from "react";
import { Download, FileText, Package, Loader2, Sparkles, CheckCircle2 } from "lucide-react";

interface Delivery {
  clientName: string;
  type: string;
  paid: boolean;
  markdown: string;
  files: { name: string; content: string }[];
}

function download(name: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function DeliveryView({ token }: { token: string }) {
  const [data, setData] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/livraison/${token}`)
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Erreur");
        return res.json();
      })
      .then(setData)
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="min-h-screen bg-[#0d1b2a] text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="flex items-center gap-2 text-xs text-white/60 mb-8">
          <Sparkles className="w-4 h-4 text-emerald-300" />
          CAP Entreprendre France · Espace de livraison
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-white/60">
            <Loader2 className="w-5 h-5 animate-spin" /> Chargement de votre livraison…
          </div>
        ) : error ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <Package className="w-8 h-8 text-white/30 mx-auto mb-3" />
            <p className="text-white/70">{error}</p>
          </div>
        ) : data ? (
          <>
            <h1 className="text-3xl font-bold">Votre livraison est prête 🎉</h1>
            <p className="text-white/60 mt-2">
              {data.clientName} — {data.type}
            </p>
            {data.paid && (
              <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Paiement confirmé — vous êtes 100 % propriétaire
              </span>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => download(`livraison-${data.clientName}.md`, data.markdown, "text/markdown")}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 font-semibold hover:opacity-90"
              >
                <Download className="w-4 h-4" /> Télécharger le dossier complet
              </button>
            </div>

            {data.files.length > 0 && (
              <section className="mt-10">
                <h2 className="text-sm font-semibold text-white/80 mb-3">Fichiers livrés</h2>
                <div className="space-y-2">
                  {data.files.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                    >
                      <FileText className="w-4 h-4 text-white/40 shrink-0" />
                      <span className="text-sm text-white/80 flex-1 truncate">{f.name}</span>
                      <button
                        onClick={() => download(f.name, f.content)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-emerald-300 hover:text-emerald-200"
                      >
                        <Download className="w-3.5 h-3.5" /> Télécharger
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-10">
              <h2 className="text-sm font-semibold text-white/80 mb-3">Aperçu</h2>
              <pre className="bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white/70 whitespace-pre-wrap overflow-x-auto">
                {data.markdown}
              </pre>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}
