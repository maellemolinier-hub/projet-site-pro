import type { LLMProvider } from "../llm/provider";
import { LLMError } from "../llm/provider";
import type { AgentContext, AgentResult, AgentRole, Artifact } from "../types";
import { AGENT_LABELS } from "../types";

/**
 * Classe de base d'un agent autonome.
 *
 * Chaque agent spécialisé fournit :
 *  - son `role`,
 *  - un prompt système (mission, expertise, format de sortie),
 *  - la construction du prompt utilisateur à partir de la commande.
 *
 * `run()` appelle le LLM, extrait les livrables (artefacts) et renvoie un
 * `AgentResult` normalisé, exploitable par l'orchestrateur et le reporting.
 */
export abstract class BaseAgent {
  abstract readonly role: AgentRole;

  /** Prompt système : définit l'identité et l'expertise de l'agent. */
  protected abstract systemPrompt(): string;

  /** Prompt utilisateur : injecte le brief de la commande. */
  protected abstract userPrompt(ctx: AgentContext): string;

  /** Type d'artefact principal produit par cet agent. */
  protected artifactKind(): Artifact["kind"] {
    return "text";
  }

  get label(): string {
    return AGENT_LABELS[this.role];
  }

  async run(ctx: AgentContext, provider: LLMProvider, maxTokens: number): Promise<AgentResult> {
    ctx.logger(`▶ ${this.label} démarre`, { provider: provider.name });
    try {
      const response = await provider.complete({
        system: this.systemPrompt(),
        messages: [{ role: "user", content: this.userPrompt(ctx) }],
        maxTokens,
      });

      const artifacts = this.extractArtifacts(response.text);
      const nextActions = this.extractNextActions(response.text);

      ctx.logger(`✔ ${this.label} terminé`, { ms: response.ms, artifacts: artifacts.length });
      return {
        role: this.role,
        ok: true,
        summary: this.buildSummary(response.text),
        output: response.text,
        artifacts,
        nextActions,
        usage: { provider: response.provider, model: response.model, ms: response.ms },
      };
    } catch (err) {
      const message = err instanceof LLMError ? err.message : (err as Error).message;
      ctx.logger(`✖ ${this.label} en échec`, { error: message });
      return {
        role: this.role,
        ok: false,
        summary: `Échec de ${this.label}`,
        output: "",
        artifacts: [],
        nextActions: [],
        error: message,
      };
    }
  }

  /** Résumé court = première ligne non vide, tronquée. */
  protected buildSummary(text: string): string {
    const firstLine = text.split("\n").map((l) => l.trim()).find((l) => l.length > 0) ?? "";
    return firstLine.slice(0, 280);
  }

  /** Extrait les blocs de code ```lang ... ``` comme artefacts. */
  protected extractArtifacts(text: string): Artifact[] {
    const artifacts: Artifact[] = [];
    const fence = /```([\w.+-]*)\n([\s\S]*?)```/g;
    let match: RegExpExecArray | null;
    let index = 0;
    while ((match = fence.exec(text)) !== null) {
      index += 1;
      const language = match[1] || undefined;
      artifacts.push({
        kind: this.artifactKind(),
        name: `${this.role}-${index}${language ? "." + language : ""}`,
        content: match[2].trim(),
        language,
      });
    }
    return artifacts;
  }

  /** Extrait une liste d'actions suivantes depuis une section dédiée. */
  protected extractNextActions(text: string): string[] {
    const idx = text.toLowerCase().indexOf("prochaines actions");
    if (idx === -1) return [];
    return text
      .slice(idx)
      .split("\n")
      .slice(1)
      .map((l) => l.replace(/^[-*\d.)\s]+/, "").trim())
      .filter((l) => l.length > 0)
      .slice(0, 8);
  }
}
