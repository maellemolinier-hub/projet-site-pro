"use client";

import { useState } from "react";
import {
  BadgeCheck, Lock, Globe, Star, MapPin, Edit3, Check, ExternalLink, Upload,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const BADGE_EMBED = `<script src="https://cap-entreprendre-france.fr/badge.js" data-id="sophie-martin"></script>`;

export function ExpertProfileManager() {
  const [tab, setTab] = useState<"profil" | "badge" | "avis">("profil");
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(
    "Expert en valeur vénale certifiée Cap Entreprendre France depuis 2023, spécialisée dans le résidentiel haut de gamme à Lyon et sa métropole."
  );
  const [copied, setCopied] = useState(false);

  const copyEmbed = () => {
    navigator.clipboard.writeText(BADGE_EMBED);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon profil Expert</h1>
        <p className="text-gray-500 mt-1">
          Gérez votre présence dans l'annuaire national Cap Entreprendre France
        </p>
      </div>

      {/* Certification status */}
      <div className="bg-gradient-to-br from-brand-950 to-brand-800 rounded-2xl p-6 text-white flex items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
          <BadgeCheck className="w-8 h-8 text-brand-300" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-lg">Expert certifié Cap Entreprendre France</span>
            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full border border-green-500/30">
              ACTIF
            </span>
          </div>
          <p className="text-white/60 text-sm">
            Formation Expert Valeur Vénale · Certifié depuis mars 2023 · Expire mars 2026
          </p>
        </div>
        <Link
          href="/dashboard/formation"
          className="shrink-0 text-xs text-white/50 hover:text-white underline"
        >
          Renouveler →
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(["profil", "badge", "avis"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize",
              tab === t
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {t === "badge" ? "Badge & Intégration" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Profil tab */}
      {tab === "profil" && (
        <div className="space-y-4">
          {/* Preview card */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-gray-900 text-sm">Aperçu public</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(!editing)}
                  className="flex items-center gap-1.5 text-xs text-brand-600 font-medium hover:text-brand-700"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {editing ? "Annuler" : "Modifier"}
                </button>
                <Link
                  href="/experts/sophie-martin"
                  target="_blank"
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Voir en public
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center text-xl font-bold">
                SM
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">Sophie Martin</span>
                  <BadgeCheck className="w-4 h-4 text-brand-600" />
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="w-3.5 h-3.5" /> Lyon 6e · Résidentiel ancien
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-bold">4.9</span>
                  <span className="text-xs text-gray-400">(47 avis)</span>
                </div>
              </div>
            </div>

            {editing ? (
              <div className="space-y-3">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full text-sm border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing(false)}
                    className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" /> Sauvegarder
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600 leading-relaxed">{bio}</p>
            )}
          </div>

          {/* Form fields */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-900 text-sm">Informations de profil</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Ville principale", value: "Lyon 6e", placeholder: "Ex: Lyon 6e" },
                { label: "Code postal", value: "69006", placeholder: "69006" },
                { label: "Spécialité principale", value: "Résidentiel ancien", placeholder: "Ex: Investissement locatif" },
                { label: "Site web", value: "sophiemartin-immo.fr", placeholder: "votre-site.fr" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                  <input
                    type="text"
                    defaultValue={f.value}
                    placeholder={f.placeholder}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              ))}
            </div>
            <button className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              Mettre à jour
            </button>
          </div>
        </div>
      )}

      {/* Badge tab */}
      {tab === "badge" && (
        <div className="space-y-4">
          {/* Badge preview */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-900 text-sm mb-4">Badge à afficher sur votre site</h3>
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-4 w-fit">
              <BadgeCheck className="w-8 h-8 text-brand-600" />
              <div>
                <p className="font-bold text-gray-900 text-sm">Expert certifié</p>
                <p className="text-xs text-gray-500">Cap Entreprendre France · Valeur Vénale</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Ce badge redirige vers votre profil public et prouve votre certification.
            </p>
          </div>

          {/* Embed code */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
            <h3 className="font-semibold text-gray-900 text-sm">Code d'intégration</h3>
            <div className="bg-gray-900 rounded-xl p-4 relative">
              <code className="text-green-400 text-xs font-mono break-all">{BADGE_EMBED}</code>
              <button
                onClick={copyEmbed}
                className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 text-white text-xs px-2.5 py-1 rounded-lg transition-colors"
              >
                {copied ? "✓ Copié" : "Copier"}
              </button>
            </div>
          </div>

          {/* Widget map */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Widget carte prix</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Intégrez la carte interactive sur votre site en marque blanche
                </p>
              </div>
              <span className="text-xs bg-brand-50 text-brand-600 border border-brand-100 px-2 py-0.5 rounded-full font-medium">
                Plan Expert
              </span>
            </div>
            <div className="bg-gray-900 rounded-xl p-4">
              <code className="text-green-400 text-xs font-mono">
                {`<iframe src="https://cap-entreprendre-france.fr/widget/carte?token=abc123" width="100%" height="500px" frameborder="0"></iframe>`}
              </code>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Globe className="w-3.5 h-3.5" />
              Personnalisable : couleurs, zoom initial, zone restreinte
            </div>
          </div>
        </div>
      )}

      {/* Avis tab */}
      {tab === "avis" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-6 mb-6">
              <div className="text-center">
                <p className="text-5xl font-bold text-gray-900">4.9</p>
                <div className="flex items-center gap-0.5 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">47 avis</p>
              </div>
              <div className="flex-1 space-y-1.5">
                {[
                  { stars: 5, count: 42, pct: 89 },
                  { stars: 4, count: 4, pct: 8 },
                  { stars: 3, count: 1, pct: 2 },
                  { stars: 2, count: 0, pct: 0 },
                  { stars: 1, count: 0, pct: 0 },
                ].map(({ stars, count, pct }) => (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-4">{stars}★</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-gray-400 w-6">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 divide-y divide-gray-50">
              {[
                { name: "Jean-Pierre M.", note: "Estimation très précise et conforme aux prix du marché. Sophie a su expliquer clairement sa méthode.", rating: 5, date: "Mars 2026" },
                { name: "Isabelle T.", note: "Excellente professionnelle, réactive et transparente. Je recommande sans hésitation.", rating: 5, date: "Fév. 2026" },
                { name: "Christophe L.", note: "Bonne expertise mais délai un peu long. Résultat final de qualité.", rating: 4, date: "Jan. 2026" },
              ].map((review) => (
                <div key={review.name} className="pt-3 first:pt-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                        {review.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{review.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      ))}
                      <span className="text-xs text-gray-400 ml-1">{review.date}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 pl-9">{review.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
