import type { AgentsConfig, ProviderName } from "../config";
import type { AgentRole } from "../types";
import { AnthropicProvider } from "./anthropic";
import { DryRunProvider } from "./dryrun";
import { GeminiProvider } from "./gemini";
import type { LLMProvider } from "./provider";

/**
 * Fabrique et met en cache les fournisseurs LLM, et choisit le bon
 * fournisseur pour chaque agent (surcharge par rôle, puis défaut, puis
 * repli automatique vers ce qui est réellement disponible).
 */
export class ProviderRouter {
  private cache = new Map<ProviderName, LLMProvider>();

  constructor(private readonly config: AgentsConfig) {}

  /** Fournisseurs réellement utilisables (clé présente). */
  available(): ProviderName[] {
    const list: ProviderName[] = [];
    if (this.config.anthropic.apiKey) list.push("anthropic");
    if (this.config.gemini.apiKey) list.push("gemini");
    list.push("dryrun");
    return list;
  }

  forRole(role: AgentRole): LLMProvider {
    const preferred = this.config.providerByRole[role] ?? this.config.defaultProvider;
    return this.resolve(preferred);
  }

  private resolve(name: ProviderName): LLMProvider {
    const usable = this.available();
    const chosen = usable.includes(name) ? name : usable[0];
    return this.build(chosen);
  }

  private build(name: ProviderName): LLMProvider {
    const cached = this.cache.get(name);
    if (cached) return cached;

    let provider: LLMProvider;
    switch (name) {
      case "anthropic":
        provider = new AnthropicProvider(this.config.anthropic.apiKey!, this.config.anthropic.model);
        break;
      case "gemini":
        provider = new GeminiProvider(this.config.gemini.apiKey!, this.config.gemini.model);
        break;
      default:
        provider = new DryRunProvider();
    }
    this.cache.set(name, provider);
    return provider;
  }
}
