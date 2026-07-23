"use client";

import { useState } from "react";
import {
  Sparkles,
  Share2,
  Search,
  Loader2,
  Copy,
  Check,
  CalendarDays,
  FileText,
  Linkedin,
  Instagram,
  Facebook,
  Twitter,
  Wand2,
  Lock,
  Mail,
  Target,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  GENERATION_META,
  type Platform,
  type Tone,
  type Goal,
  type GeneratedContent,
  type SocialPost,
} from "@/lib/assistants/meta";

const PLATFORM_ICON: Record<Platform, React.ElementType> = {
  linkedin: Linkedin,
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  seo: FileText,
};

const PLATFORM_LABEL: Record<Platform, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  facebook: "Facebook",
  twitter: "X / Twitter",
  seo: "Article SEO",
};

interface AssistantCard {
  id: string;
  name: string;
  desc: string;
  icon: React.ElementType;
  color: string;
  iconBg: string;
  status: "active" | "soon";
}

const ASSISTANTS: AssistantCard[] = [
  {
    id: "social-seo",
    name: "Réseaux sociaux & SEO",
    desc: "Génère des posts prêts à publier et des articles SEO pour attirer des leads naturellement.",
    icon: Share2,
    color: "border-brand-200",
    iconBg: "bg-brand-100 text-brand-600",
    status: "active",
  },
  {
    id: "prospection",
    name: "Assistant Prospection",
    desc: "Rédige vos messages de prospection et scripts d'appel personnalisés par prospect.",
    icon: Target,
    color: "border-gray-100",
    iconBg: "bg-orange-100 text-orange-600",
    status: "soon",
  },
  {
    id: "estimation",
    name: "Assistant Estimation",
    desc: "Transforme vos données de marché en argumentaire d'estimation convaincant.",
    icon: Home,
    color: "border-gray-100",
    iconBg: "bg-green-100 text-green-600",
    status: "soon",
  },
  {
    id: "emailing",
    name: "Assistant Emailing",
    desc: "Séquences email de relance et newsletters pour rester présent dans l'esprit de vos leads.",
    icon: Mail,
    color: "border-gray-100",
    iconBg: "bg-purple-100 text-purple-600",
    status: "soon",
  },
];

export function AssistantsDashboard() {
  const [openAssistant, setOpenAssistant] = useState<string | null>("social-seo");

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-brand-600" />
          <h1 className="text-2xl font-bold text-gray-900">Mes assistants IA</h1>
        </div>
        <p className="text-gray-500">
          Vos assistants travaillent pour vous. Lancez-en un et récupérez du
          contenu prêt à publier ce soir.
        </p>
      </div>

      {/* Assistants grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ASSISTANTS.map((a) => (
          <button
            key={a.id}
            onClick={() => a.status === "active" && setOpenAssistant(a.id)}
            disabled={a.status === "soon"}
            className={cn(
              "text-left bg-white rounded-2xl border-2 p-5 transition-all",
              a.color,
              a.status === "active"
                ? "hover:shadow-md cursor-pointer"
                : "opacity-70 cursor-not-allowed",
              openAssistant === a.id && "ring-2 ring-brand-500",
            )}
          >
            <div
              className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center mb-3",
                a.iconBg,
              )}
            >
              <a.icon className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 text-sm">{a.name}</h3>
              {a.status === "soon" && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                  <Lock className="w-2.5 h-2.5" /> Bientôt
                </span>
              )}
              {a.status === "active" && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Actif
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{a.desc}</p>
          </button>
        ))}
      </div>

      {/* Active assistant panel */}
      {openAssistant === "social-seo" && <SocialSeoAssistant />}
    </div>
  );
}

// ── Social & SEO assistant ─────────────────────────────────────────────────
function SocialSeoAssistant() {
  const [topic, setTopic] = useState("");
  const [city, setCity] = useState("");
  const [keywords, setKeywords] = useState("");
  const [tone, setTone] = useState<Tone>("expert");
  const [goal, setGoal] = useState<Goal>("leads_vendeurs");
  const [platforms, setPlatforms] = useState<Platform[]>([
    "linkedin",
    "instagram",
    "seo",
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedContent | null>(null);

  const togglePlatform = (p: Platform) =>
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );

  const generate = async () => {
    if (topic.trim().length < 2) {
      setError("Donnez un sujet à votre assistant (ex : « Vendre en 2026 »).");
      return;
    }
    if (platforms.length === 0) {
      setError("Choisissez au moins un canal.");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/assistants/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          city: city.trim() || undefined,
          platforms,
          tone,
          goal,
          keywords: keywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean)
            .slice(0, 10),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Une erreur est survenue.");
      }
      setResult(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-[380px_1fr] gap-6">
      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5 h-fit lg:sticky lg:top-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center">
            <Wand2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 text-sm">
              Générateur de contenu
            </h2>
            <p className="text-xs text-gray-400">
              Réseaux sociaux + SEO en un clic
            </p>
          </div>
        </div>

        <Field label="Sujet du contenu *">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ex : Faut-il vendre son bien en 2026 ?"
            className="input"
          />
        </Field>

        <Field label="Ville / secteur">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Ex : Bordeaux, Lyon 6e…"
            className="input"
          />
        </Field>

        <Field label="Objectif">
          <select
            value={goal}
            onChange={(e) => setGoal(e.target.value as Goal)}
            className="input"
          >
            {GENERATION_META.goals.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Ton">
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value as Tone)}
            className="input"
          >
            {GENERATION_META.tones.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Canaux">
          <div className="flex flex-wrap gap-2">
            {GENERATION_META.platforms.map((p) => {
              const Icon = PLATFORM_ICON[p.value];
              const active = platforms.includes(p.value);
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => togglePlatform(p.value)}
                  className={cn(
                    "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors",
                    active
                      ? "bg-brand-600 text-white border-brand-600"
                      : "bg-white text-gray-500 border-gray-200 hover:border-brand-300",
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {p.label}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Mots-clés SEO (séparés par des virgules)">
          <input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="prix m2, estimation gratuite…"
            className="input"
          />
        </Field>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          onClick={generate}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Génération…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Générer mon contenu
            </>
          )}
        </button>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Astuce : relisez et personnalisez avant de publier. Ajoutez une clé
          <code className="mx-1 px-1 bg-gray-100 rounded">OPENAI_API_KEY</code>
          pour une qualité rédactionnelle encore supérieure.
        </p>
      </div>

      {/* Results */}
      <div className="min-w-0">
        {!result && !loading && <EmptyState />}
        {loading && (
          <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center gap-3">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
            <p className="text-sm text-gray-500">
              Votre assistant rédige votre contenu…
            </p>
          </div>
        )}
        {result && <Results result={result} />}
      </div>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          font-size: 0.875rem;
          border: 1px solid rgb(229 231 235);
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          outline: none;
        }
        :global(.input:focus) {
          box-shadow: 0 0 0 2px rgb(124 150 248 / 0.6);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      {children}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-full min-h-[300px] bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-center gap-3 p-8">
      <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center">
        <Sparkles className="w-7 h-7 text-brand-400" />
      </div>
      <h3 className="font-semibold text-gray-900">
        Votre contenu apparaîtra ici
      </h3>
      <p className="text-sm text-gray-400 max-w-sm">
        Renseignez un sujet à gauche, choisissez vos canaux et laissez votre
        assistant générer des posts et un article SEO prêts à publier.
      </p>
    </div>
  );
}

function Results({ result }: { result: GeneratedContent }) {
  return (
    <div className="space-y-6">
      {result.engine === "openai" && (
        <div className="text-xs text-brand-700 bg-brand-50 border border-brand-100 rounded-lg px-3 py-2 inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Contenu affiné par IA
        </div>
      )}

      {/* Social posts */}
      {result.posts.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-brand-600" /> Posts réseaux sociaux
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {result.posts.map((post, i) => (
              <PostCard key={i} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* SEO article */}
      {result.seo && <SeoCard seo={result.seo} />}

      {/* Calendar */}
      <section className="space-y-3">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-brand-600" /> Calendrier
          éditorial de la semaine
        </h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {result.calendar.map((c, i) => {
            const Icon = PLATFORM_ICON[c.platform];
            return (
              <div key={i} className="flex items-start gap-3 p-3">
                <span className="text-xs font-semibold text-gray-400 w-16 shrink-0 pt-0.5">
                  {c.day}
                </span>
                <Icon className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-700">
                    {PLATFORM_LABEL[c.platform]} · {c.format}
                  </p>
                  <p className="text-sm text-gray-600">{c.idea}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function PostCard({ post }: { post: SocialPost }) {
  const Icon = PLATFORM_ICON[post.platform];
  const fullText = `${post.hook}\n\n${post.body}\n\n${post.cta}\n\n${post.hashtags
    .map((h) => `#${h}`)
    .join(" ")}`;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700">
          <Icon className="w-4 h-4 text-brand-600" />
          {PLATFORM_LABEL[post.platform]}
        </span>
        <CopyButton text={fullText} />
      </div>
      <p className="text-sm font-semibold text-gray-900 mb-2">{post.hook}</p>
      <p className="text-sm text-gray-600 whitespace-pre-line flex-1">
        {post.body}
      </p>
      <p className="text-sm text-brand-700 font-medium whitespace-pre-line mt-3">
        {post.cta}
      </p>
      {post.hashtags.length > 0 && (
        <p className="text-xs text-brand-500 mt-3">
          {post.hashtags.map((h) => `#${h}`).join(" ")}
        </p>
      )}
      <p className="text-[10px] text-gray-300 mt-2">{post.charCount} caractères</p>
    </div>
  );
}

function SeoCard({ seo }: { seo: NonNullable<GeneratedContent["seo"]> }) {
  const markdown = buildSeoMarkdown(seo);
  return (
    <section className="space-y-3">
      <h2 className="font-semibold text-gray-900 flex items-center gap-2">
        <Search className="w-4 h-4 text-brand-600" /> Article SEO
      </h2>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <p className="text-xs text-gray-400">Meta title</p>
            <p className="text-sm font-semibold text-gray-900">{seo.metaTitle}</p>
          </div>
          <CopyButton text={markdown} label="Copier l'article" />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-gray-400">Meta description</p>
          <p className="text-sm text-gray-600">{seo.metaDescription}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-400 mr-1">URL :</span>
          <code className="text-xs bg-gray-50 border border-gray-100 rounded px-2 py-0.5 text-gray-600">
            /blog/{seo.slug}
          </code>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {seo.targetKeywords.map((k) => (
            <span
              key={k}
              className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full"
            >
              {k}
            </span>
          ))}
        </div>

        <div className="border-t border-gray-50 pt-4">
          <p className="text-sm text-gray-700 leading-relaxed mb-4">{seo.intro}</p>
          <div className="space-y-4">
            {seo.outline.map((s, i) => (
              <div key={i}>
                <p className="font-semibold text-gray-900 text-sm">{s.h2}</p>
                <ul className="mt-1 space-y-0.5">
                  {s.h3.map((h) => (
                    <li
                      key={h}
                      className="text-xs text-gray-500 pl-3 border-l-2 border-gray-100"
                    >
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-50 pt-4 space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            FAQ (rich snippets)
          </p>
          {seo.faq.map((f, i) => (
            <div key={i}>
              <p className="text-sm font-medium text-gray-800">{f.q}</p>
              <p className="text-sm text-gray-500">{f.a}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-50 pt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Maillage interne suggéré
          </p>
          <ul className="list-disc list-inside text-sm text-gray-500 space-y-0.5">
            {seo.internalLinks.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
          <p className="text-[11px] text-gray-300 mt-2">
            ~{seo.wordCount} mots · structure H2/H3 optimisée
          </p>
        </div>
      </div>
    </section>
  );
}

function buildSeoMarkdown(seo: NonNullable<GeneratedContent["seo"]>): string {
  const lines: string[] = [];
  lines.push(`# ${seo.metaTitle}`, "");
  lines.push(`> ${seo.metaDescription}`, "");
  lines.push(seo.intro, "");
  lines.push(seo.body, "");
  lines.push("## FAQ", "");
  seo.faq.forEach((f) => {
    lines.push(`### ${f.q}`, "", f.a, "");
  });
  return lines.join("\n");
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard indisponible */
    }
  };
  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-brand-600 border border-gray-200 hover:border-brand-300 rounded-lg px-2.5 py-1.5 transition-colors shrink-0"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-green-500" /> Copié
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" /> {label ?? "Copier"}
        </>
      )}
    </button>
  );
}
