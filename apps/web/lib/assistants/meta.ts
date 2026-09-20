/**
 * Types et métadonnées partagés client/serveur pour les assistants.
 * Ce fichier ne contient AUCUNE logique serveur (safe à importer côté client).
 */

export type Platform =
  | "linkedin"
  | "instagram"
  | "facebook"
  | "twitter"
  | "seo";

export type Tone = "expert" | "proche" | "punchy" | "premium";

export type Goal =
  | "leads_vendeurs"
  | "leads_acheteurs"
  | "notoriete"
  | "recrutement";

export interface ContentRequest {
  topic: string;
  city?: string;
  platforms: Platform[];
  tone: Tone;
  goal: Goal;
  keywords?: string[];
}

export interface SocialPost {
  platform: Platform;
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
  charCount: number;
}

export interface SeoArticle {
  metaTitle: string;
  metaDescription: string;
  slug: string;
  targetKeywords: string[];
  outline: { h2: string; h3: string[] }[];
  intro: string;
  body: string;
  faq: { q: string; a: string }[];
  internalLinks: string[];
  wordCount: number;
}

export interface CalendarEntry {
  day: string;
  platform: Platform;
  format: string;
  idea: string;
}

export interface GeneratedContent {
  topic: string;
  city?: string;
  goal: Goal;
  tone: Tone;
  posts: SocialPost[];
  seo?: SeoArticle;
  calendar: CalendarEntry[];
  engine: "local" | "openai";
}

export const GENERATION_META = {
  tones: [
    { value: "expert", label: "Expert (crédible, chiffré)" },
    { value: "proche", label: "Proche (chaleureux, simple)" },
    { value: "punchy", label: "Punchy (direct, accrocheur)" },
    { value: "premium", label: "Premium (haut de gamme)" },
  ] as { value: Tone; label: string }[],
  goals: [
    { value: "leads_vendeurs", label: "Attirer des vendeurs" },
    { value: "leads_acheteurs", label: "Attirer des acheteurs" },
    { value: "notoriete", label: "Notoriété d'expert local" },
    { value: "recrutement", label: "Recruter des conseillers" },
  ] as { value: Goal; label: string }[],
  platforms: [
    { value: "linkedin", label: "LinkedIn" },
    { value: "instagram", label: "Instagram" },
    { value: "facebook", label: "Facebook" },
    { value: "twitter", label: "X / Twitter" },
    { value: "seo", label: "Article SEO (blog)" },
  ] as { value: Platform; label: string }[],
};
