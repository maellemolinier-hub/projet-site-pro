import type { LLMProvider, LLMRequest, LLMResponse } from "./provider";

/**
 * Fournisseur factice utilisé quand aucune clé API n'est configurée.
 * Il ne contacte aucun LLM : il renvoie un aperçu du prompt pour valider
 * l'orchestration, les connecteurs et le format des livrables de bout en bout.
 */
export class DryRunProvider implements LLMProvider {
  readonly name = "dryrun";
  readonly model = "dryrun";

  async complete(req: LLMRequest): Promise<LLMResponse> {
    const lastUser = [...req.messages].reverse().find((m) => m.role === "user");
    const text = [
      "[MODE DÉMO — aucune clé LLM configurée]",
      "Ajoutez ANTHROPIC_API_KEY ou GEMINI_API_KEY pour obtenir un vrai livrable.",
      "",
      "Rôle système reçu :",
      req.system.slice(0, 500) + (req.system.length > 500 ? "…" : ""),
      "",
      "Brief reçu :",
      (lastUser?.content ?? "").slice(0, 800),
    ].join("\n");

    return { text, provider: this.name, model: this.model, ms: 0 };
  }
}
