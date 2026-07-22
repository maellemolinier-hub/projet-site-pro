import Anthropic from "@anthropic-ai/sdk";

let _anthropic: Anthropic | null = null;

/**
 * Lazily-instantiated Anthropic (Claude) client.
 * Mirrors the pattern used for the Stripe client so the app can build even
 * when the API key is absent (the key is only required at request time).
 */
export function getClaude(): Anthropic {
  if (!_anthropic) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }
    _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _anthropic;
}

export const claude = new Proxy({} as Anthropic, {
  get(_target, prop) {
    return (getClaude() as any)[prop];
  },
});

export function isClaudeConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/** Default model — overridable via env for easy upgrades. */
export const CLAUDE_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5";

/** Max tokens generated per assistant reply. */
export const CLAUDE_MAX_TOKENS = Number(process.env.ANTHROPIC_MAX_TOKENS ?? 1024);

/**
 * System prompt tailoring Claude to the ImmoExpert product: a French-speaking
 * assistant for real-estate valuation experts.
 */
export const ASSISTANT_SYSTEM_PROMPT = `Tu es l'assistant IA d'ImmoExpert, une plateforme française destinée aux experts et agents immobiliers spécialisés dans l'estimation de la valeur vénale.

Ton rôle :
- Aider les experts sur les méthodes d'évaluation (comparaison directe, capitalisation du revenu, coût de remplacement), l'analyse du marché, les données DVF/PERVAL, et la rédaction de rapports.
- Rédiger et améliorer des annonces, des descriptifs de biens, des e-mails de prospection et des synthèses de rapport.
- Répondre de manière claire, professionnelle et concise, en français.

Règles :
- Tu n'as pas accès en temps réel aux bases de données de l'utilisateur ; si une donnée chiffrée précise est demandée, invite l'utilisateur à consulter la carte des prix ou ses rapports dans ImmoExpert.
- Ne fournis jamais de conseil juridique ou fiscal définitif : rappelle que l'expert reste responsable de ses conclusions.
- Sois honnête sur tes limites et n'invente pas de chiffres.`;

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}
