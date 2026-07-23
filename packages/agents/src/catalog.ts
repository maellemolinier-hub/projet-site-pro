import type { AgentRole } from "./types";
import { AGENT_LABELS } from "./types";

/** Métadonnées d'un agent pour l'affichage dans le panneau de pilotage. */
export interface AgentCatalogEntry {
  role: AgentRole;
  label: string;
  /** Mission courte affichée sur la carte de l'agent. */
  tagline: string;
  /** Clé d'icône (mappée côté UI vers une icône lucide-react). */
  icon: string;
  /** Fournisseur LLM recommandé par défaut. */
  recommendedProvider: "anthropic" | "gemini";
  /** Catégorie de regroupement. */
  category: "Stratégie" | "Production" | "Acquisition" | "Fidélisation";
}

/** Catalogue complet des agents autonomes de Cap Entreprendre France. */
export const AGENT_CATALOG: AgentCatalogEntry[] = [
  {
    role: "business_diagnosis",
    label: AGENT_LABELS.business_diagnosis,
    tagline: "Analyse les problèmes du métier et cadre la solution digitale.",
    icon: "stethoscope",
    recommendedProvider: "anthropic",
    category: "Stratégie",
  },
  {
    role: "developer",
    label: AGENT_LABELS.developer,
    tagline: "Conçoit et livre sites web, apps et assistants IA.",
    icon: "code",
    recommendedProvider: "anthropic",
    category: "Production",
  },
  {
    role: "seo_social",
    label: AGENT_LABELS.seo_social,
    tagline: "Référencement, contenu et calendrier réseaux sociaux.",
    icon: "trending-up",
    recommendedProvider: "anthropic",
    category: "Acquisition",
  },
  {
    role: "cinematic_visuals",
    label: AGENT_LABELS.cinematic_visuals,
    tagline: "Direction artistique et prompts image/vidéo réalistes.",
    icon: "clapperboard",
    recommendedProvider: "gemini",
    category: "Production",
  },
  {
    role: "lead_prospecting",
    label: AGENT_LABELS.lead_prospecting,
    tagline: "Identifie et qualifie les entreprises à démarcher (→ HubSpot).",
    icon: "target",
    recommendedProvider: "anthropic",
    category: "Acquisition",
  },
  {
    role: "voice_appointment",
    label: AGENT_LABELS.voice_appointment,
    tagline: "Assistant vocal qui prend les RDV et qualifie les leads.",
    icon: "phone-call",
    recommendedProvider: "anthropic",
    category: "Acquisition",
  },
  {
    role: "phone_prospecting",
    label: AGENT_LABELS.phone_prospecting,
    tagline: "Scripts d'appels sortants, objections et closing.",
    icon: "headphones",
    recommendedProvider: "anthropic",
    category: "Acquisition",
  },
  {
    role: "client_followup",
    label: AGENT_LABELS.client_followup,
    tagline: "Relances, avis clients, upsell et fidélisation.",
    icon: "repeat",
    recommendedProvider: "anthropic",
    category: "Fidélisation",
  },
];
