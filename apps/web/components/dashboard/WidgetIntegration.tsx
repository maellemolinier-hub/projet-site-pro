"use client";

import { useState } from "react";
import {
  Globe, Copy, CheckCircle2, ExternalLink, Code2, Eye,
  TrendingUp, Users, MousePointerClick, Zap,
} from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://immoexpert.fr";

const CITIES = [
  "Paris", "Lyon", "Marseille", "Bordeaux", "Nantes",
  "Toulouse", "Nice", "Rennes", "Montpellier", "Strasbourg",
];

const THEMES = [
  { value: "dark", label: "Sombre (recommandé)" },
  { value: "light", label: "Clair" },
];

function buildIframeUrl(city: string) {
  const params = new URLSearchParams({ city });
  return `${BASE_URL}/widget/prix?${params.toString()}`;
}

function buildIframeCode(city: string, height: number) {
  const src = buildIframeUrl(city);
  return `<iframe
  src="${src}"
  width="100%"
  height="${height}px"
  frameborder="0"
  allow="geolocation"
  style="border-radius:16px; border:none; display:block;"
  title="Carte des prix immobiliers — ImmoExpert"
></iframe>`;
}

export function WidgetIntegration() {
  const [city, setCity] = useState("Paris");
  const [height, setHeight] = useState(480);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"preview" | "code">("preview");

  const iframeCode = buildIframeCode(city, height);
  const iframeSrc = buildIframeUrl(city);

  const copy = async () => {
    await navigator.clipboard.writeText(iframeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Globe className="w-6 h-6 text-brand-600" />
            Mon widget — Intégration site
          </h1>
          <p className="text-gray-500 mt-1">
            Intégrez la carte des prix directement sur votre site web en quelques secondes.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Visiteurs via widget", value: "—", color: "text-brand-600" },
          { icon: MousePointerClick, label: "Interactions carte", value: "—", color: "text-orange-500" },
          { icon: TrendingUp, label: "Leads générés", value: "—", color: "text-green-600" },
          { icon: Zap, label: "Taux de conversion", value: "—", color: "text-purple-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{s.label}</span>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">Activé après déploiement</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left — configurator */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-brand-600" />
              Configuration
            </h2>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Ville par défaut
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Hauteur du widget : <span className="text-gray-900 font-semibold">{height}px</span>
              </label>
              <input
                type="range"
                min={320}
                max={720}
                step={40}
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full accent-brand-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                <span>320px</span>
                <span>720px</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Thème
              </label>
              <div className="grid grid-cols-2 gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.value}
                    className={`text-xs py-2 px-3 rounded-lg border font-medium transition-all ${
                      t.value === "dark"
                        ? "bg-brand-600 border-brand-600 text-white"
                        : "bg-white border-gray-200 text-gray-500"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-brand-50 rounded-2xl p-5 border border-brand-100 space-y-3">
            <h3 className="font-semibold text-brand-900 text-sm">Comment intégrer ?</h3>
            <ol className="space-y-2 text-sm text-brand-800">
              <li className="flex items-start gap-2">
                <span className="font-bold text-brand-600 shrink-0">1.</span>
                Copiez le code ci-dessous avec le bouton bleu.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-brand-600 shrink-0">2.</span>
                Collez-le dans l&apos;éditeur HTML de votre site (WordPress, Wix, Squarespace…).
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-brand-600 shrink-0">3.</span>
                La carte des prix s&apos;affiche instantanément sur votre page.
              </li>
            </ol>
            <a
              href={iframeSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-brand-600 font-semibold hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Prévisualiser en plein écran
            </a>
          </div>
        </div>

        {/* Right — preview / code */}
        <div className="lg:col-span-3 space-y-4">
          {/* Tab switcher */}
          <div className="flex gap-2">
            <button
              onClick={() => setTab("preview")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === "preview"
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Eye className="w-4 h-4" />
              Aperçu
            </button>
            <button
              onClick={() => setTab("code")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === "code"
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Code2 className="w-4 h-4" />
              Code
            </button>
          </div>

          {tab === "preview" ? (
            <div
              className="bg-gray-900 rounded-2xl overflow-hidden shadow-lg border border-gray-200"
              style={{ height: height + 32 }}
            >
              {/* Fake browser bar */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 border-b border-gray-700">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 bg-gray-700 rounded-md px-3 py-1 text-xs text-gray-400 truncate">
                  votre-site.fr/estimation
                </div>
              </div>
              <iframe
                src={iframeSrc}
                width="100%"
                height={height}
                frameBorder={0}
                allow="geolocation"
                title="Widget ImmoExpert"
                className="block"
              />
            </div>
          ) : (
            <div className="bg-gray-950 rounded-2xl overflow-hidden shadow-lg border border-gray-200">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                <span className="text-xs font-mono text-gray-400">HTML — à coller sur votre site</span>
                <button
                  onClick={copy}
                  className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                    copied
                      ? "bg-green-500/20 text-green-400"
                      : "bg-brand-600 hover:bg-brand-700 text-white"
                  }`}
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Copié !
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copier le code
                    </>
                  )}
                </button>
              </div>
              <pre className="p-5 text-xs text-green-400 font-mono overflow-x-auto whitespace-pre leading-relaxed">
                {iframeCode}
              </pre>
            </div>
          )}

          {/* Copy button always visible */}
          {tab === "preview" && (
            <button
              onClick={copy}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
                copied
                  ? "bg-green-50 border-2 border-green-200 text-green-700"
                  : "bg-brand-600 hover:bg-brand-700 text-white shadow-sm hover:-translate-y-0.5 shadow-brand-200"
              }`}
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Code copié dans le presse-papier !
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copier le code d&apos;intégration
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
