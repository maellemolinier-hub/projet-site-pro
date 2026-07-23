import type { AgentRole, OrderInput, PlanStep } from "../types";

const KEYWORDS: Record<AgentRole, RegExp> = {
  developer:
    /site|web|app|application|dev|code|landing|boutique|e-?commerce|saas|plateforme|logiciel|api/i,
  seo_social:
    /seo|référencement|referencement|réseaux|reseaux|social|instagram|tiktok|linkedin|contenu|community|vues|visibilit|marketing/i,
  cinematic_visuals:
    /visuel|vidéo|video|image|photo|montage|cinémat|cinemat|pub|publicit|motion|design|logo|branding|3d/i,
  phone_prospecting:
    /prospection|appel|téléphon|telephon|call|démarchage|demarchage|lead|closing|vente|commercial/i,
  client_followup:
    /relance|suivi|fidélis|fidelis|satisfaction|paiement|facturation|avis|support|service client/i,
};

// Ordre d'exécution logique (le dev d'abord, la relance en dernier).
const ORDER: AgentRole[] = [
  "developer",
  "seo_social",
  "cinematic_visuals",
  "phone_prospecting",
  "client_followup",
];

/**
 * Planificateur déterministe : choisit les agents à mobiliser selon le contenu
 * de la commande. Fiable et testable hors-ligne (sans appel LLM).
 *
 * - Si la commande matche des mots-clés, on ne mobilise que les agents pertinents.
 * - La Relance client est toujours ajoutée (fidélisation systématique).
 * - Si rien ne matche, on mobilise le pack "lancement" complet.
 */
export function planOrder(order: OrderInput): PlanStep[] {
  const haystack = `${order.type} ${order.description}`;
  const matched = new Set<AgentRole>();

  for (const role of ORDER) {
    if (KEYWORDS[role].test(haystack)) matched.add(role);
  }

  // La relance client fait partie de chaque commande livrée.
  matched.add("client_followup");

  const selected = matched.size <= 1 ? new Set<AgentRole>(ORDER) : matched;

  return ORDER.filter((role) => selected.has(role)).map((role) => ({
    role,
    reason: KEYWORDS[role].test(haystack)
      ? "Mots-clés de la commande correspondants"
      : "Inclus par défaut pour une livraison complète",
  }));
}
