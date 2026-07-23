import type { AgentRole } from "./types";

export type ProviderName = "anthropic" | "gemini" | "dryrun";

export interface AgentsConfig {
  /** Fournisseur LLM par défaut. */
  defaultProvider: ProviderName;
  anthropic: {
    apiKey?: string;
    model: string;
  };
  gemini: {
    apiKey?: string;
    model: string;
  };
  /** Surcharge de fournisseur par agent (ex: visuels -> gemini). */
  providerByRole: Partial<Record<AgentRole, ProviderName>>;
  make: {
    /** Webhook Make appelé pour renvoyer les livrables (écriture Google Sheets, email…). */
    outboundWebhookUrl?: string;
    /** Secret partagé attendu sur le webhook entrant (intake des commandes). */
    signingSecret?: string;
  };
  googleSheets: {
    /** JSON du compte de service (chaîne brute ou base64). */
    serviceAccountJson?: string;
    spreadsheetId?: string;
  };
  /** Limite de tokens par appel LLM. */
  maxTokens: number;
}

function env(key: string): string | undefined {
  const value = process.env[key];
  return value && value.trim() !== "" ? value.trim() : undefined;
}

/**
 * Construit la configuration depuis les variables d'environnement.
 * Aucune clé n'est requise : sans clé, la plateforme tourne en mode "dryrun"
 * (elle produit le plan et les prompts sans appeler les LLM), ce qui permet
 * de tester tout le câblage avant de brancher les vraies API.
 */
export function getConfig(overrides: Partial<AgentsConfig> = {}): AgentsConfig {
  const anthropicKey = env("ANTHROPIC_API_KEY");
  const geminiKey = env("GEMINI_API_KEY") ?? env("GOOGLE_API_KEY");

  let defaultProvider: ProviderName = "dryrun";
  if (env("AGENTS_DEFAULT_PROVIDER")) {
    defaultProvider = env("AGENTS_DEFAULT_PROVIDER") as ProviderName;
  } else if (anthropicKey) {
    defaultProvider = "anthropic";
  } else if (geminiKey) {
    defaultProvider = "gemini";
  }

  return {
    defaultProvider,
    anthropic: {
      apiKey: anthropicKey,
      model: env("ANTHROPIC_MODEL") ?? "claude-3-5-sonnet-latest",
    },
    gemini: {
      apiKey: geminiKey,
      model: env("GEMINI_MODEL") ?? "gemini-1.5-pro",
    },
    providerByRole: {
      // Les visuels/vidéos décrivent mieux avec Gemini si dispo ; sinon fallback.
      cinematic_visuals: geminiKey ? "gemini" : undefined,
    },
    make: {
      outboundWebhookUrl: env("MAKE_WEBHOOK_URL"),
      signingSecret: env("MAKE_SIGNING_SECRET") ?? env("AGENTS_WEBHOOK_SECRET"),
    },
    googleSheets: {
      serviceAccountJson: env("GOOGLE_SERVICE_ACCOUNT_JSON"),
      spreadsheetId: env("GOOGLE_SHEETS_ID"),
    },
    maxTokens: Number(env("AGENTS_MAX_TOKENS") ?? "4096"),
    ...overrides,
  };
}
