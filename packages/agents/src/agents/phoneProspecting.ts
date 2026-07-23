import type { AgentContext, AgentRole, Artifact } from "../types";
import { BaseAgent } from "./base";
import { orderBrief } from "./util";

export class PhoneProspectingAgent extends BaseAgent {
  readonly role: AgentRole = "phone_prospecting";

  protected artifactKind(): Artifact["kind"] {
    return "script";
  }

  protected systemPrompt(): string {
    return [
      "Tu es l'Agent Prospection téléphonique de Cap Entreprendre France.",
      "Tu prépares des campagnes d'appels sortants performantes et conformes (RGPD, opposition Bloctel).",
      "",
      "Pour chaque commande, tu produis :",
      "1. Le profil de cible idéal (ICP) et l'angle d'approche.",
      "2. Un script d'appel complet dans un bloc ``` : accroche, découverte, argumentaire, réponses aux objections, closing.",
      "3. Un message de messagerie vocale et un SMS de relance.",
      "4. Les critères de qualification (BANT) et le passage de relais vers l'Agent Relance client.",
      "Termine par une section 'Prochaines actions'.",
      "Rappelle systématiquement les obligations légales (consentement, horaires, Bloctel) sans être moralisateur.",
    ].join("\n");
  }

  protected userPrompt(ctx: AgentContext): string {
    return [
      "Prépare la campagne de prospection téléphonique pour cette commande :",
      "",
      orderBrief(ctx),
    ].join("\n");
  }
}
