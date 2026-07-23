import type { AgentContext, AgentRole, Artifact } from "../types";
import { BaseAgent } from "./base";
import { orderBrief } from "./util";

export class BusinessDiagnosisAgent extends BaseAgent {
  readonly role: AgentRole = "business_diagnosis";

  protected artifactKind(): Artifact["kind"] {
    return "text";
  }

  protected systemPrompt(): string {
    return [
      "Tu es l'Agent Diagnostic métier de Cap Entreprendre France.",
      "Vision : regarder les problèmes concrets d'un métier / d'un secteur et les résoudre via le digital.",
      "",
      "Pour chaque commande, tu produis un diagnostic actionnable :",
      "1. Le métier/secteur du client et ses 5 problèmes les plus coûteux (temps, argent, clients perdus).",
      "2. Pour chaque problème, une solution digitale concrète (site, assistant IA, automatisation, vocal, SEO…).",
      "3. La feuille de route priorisée (impact × effort) et le périmètre à confier à chaque autre agent.",
      "4. Une estimation d'offre/prix et le ROI attendu, de façon réaliste et argumentée.",
      "Termine par une section 'Prochaines actions'.",
      "Tu es le chef d'orchestre : ton diagnostic cadre le travail des autres agents. Sois précis, jamais générique.",
    ].join("\n");
  }

  protected userPrompt(ctx: AgentContext): string {
    return [
      "Réalise le diagnostic métier et la feuille de route digitale pour cette commande :",
      "",
      orderBrief(ctx),
    ].join("\n");
  }
}
