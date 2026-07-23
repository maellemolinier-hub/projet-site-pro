/**
 * Types partagés de la plateforme d'agents Cap Entreprendre France.
 */

/** Les 5 agents structurels autonomes de l'entreprise. */
export type AgentRole =
  | "developer"
  | "seo_social"
  | "cinematic_visuals"
  | "phone_prospecting"
  | "client_followup";

export const ALL_AGENT_ROLES: AgentRole[] = [
  "developer",
  "seo_social",
  "cinematic_visuals",
  "phone_prospecting",
  "client_followup",
];

/** Libellés lisibles (FR) pour l'affichage / le reporting. */
export const AGENT_LABELS: Record<AgentRole, string> = {
  developer: "Agent Développeur",
  seo_social: "Agent SEO & Réseaux sociaux",
  cinematic_visuals: "Agent Visuels cinématographiques",
  phone_prospecting: "Agent Prospection téléphonique",
  client_followup: "Agent Relance client",
};

/** Une commande client entrante (depuis le site, Make, Google Sheets…). */
export interface OrderInput {
  id?: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  /** Type de prestation demandée (texte libre : "site vitrine", "campagne SEO", "pub vidéo"…). */
  type: string;
  /** Brief détaillé de la commande. */
  description: string;
  budget?: number;
  /** Données additionnelles (source, langue, deadline…). */
  metadata?: Record<string, unknown>;
}

export type ArtifactKind =
  | "code"
  | "text"
  | "image_prompt"
  | "video_prompt"
  | "script"
  | "post"
  | "email";

/** Un livrable produit par un agent. */
export interface Artifact {
  kind: ArtifactKind;
  name: string;
  content: string;
  /** Langage pour les artefacts de code. */
  language?: string;
}

/** Contexte d'exécution fourni à chaque agent. */
export interface AgentContext {
  order: OrderInput;
  now: Date;
  logger: (message: string, data?: unknown) => void;
}

/** Résultat d'exécution d'un agent. */
export interface AgentResult {
  role: AgentRole;
  ok: boolean;
  summary: string;
  output: string;
  artifacts: Artifact[];
  nextActions: string[];
  error?: string;
  usage?: { provider: string; model: string; ms: number };
}

export interface PlanStep {
  role: AgentRole;
  reason: string;
}

export interface OrchestrationPlan {
  orderId: string;
  steps: PlanStep[];
}

export interface OrchestrationResult {
  orderId: string;
  plan: OrchestrationPlan;
  results: AgentResult[];
  ok: boolean;
  startedAt: string;
  finishedAt: string;
}
