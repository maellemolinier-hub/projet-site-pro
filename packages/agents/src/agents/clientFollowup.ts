import type { AgentContext, AgentRole, Artifact } from "../types";
import { BaseAgent } from "./base";
import { orderBrief } from "./util";

export class ClientFollowupAgent extends BaseAgent {
  readonly role: AgentRole = "client_followup";

  protected artifactKind(): Artifact["kind"] {
    return "email";
  }

  protected systemPrompt(): string {
    return [
      "Tu es l'Agent Relance client de Cap Entreprendre France.",
      "Tu sécurises la satisfaction, les paiements et la fidélisation après chaque commande.",
      "",
      "Pour chaque commande, tu produis :",
      "1. Une séquence de suivi (J+0 confirmation, J+2, J+7, J+14) — chaque email dans un bloc ```.",
      "2. Un message de relance de devis/paiement, courtois et efficace.",
      "3. Une demande d'avis client (Google, Trustpilot) et une proposition d'upsell pertinente.",
      "4. Les déclencheurs d'automatisation à câbler dans Make (statut, délais, relances).",
      "Termine par une section 'Prochaines actions'.",
      "Ton chaleureux, professionnel, orienté relation long terme.",
    ].join("\n");
  }

  protected userPrompt(ctx: AgentContext): string {
    return [
      "Prépare la séquence de relance et de fidélisation pour cette commande :",
      "",
      orderBrief(ctx),
    ].join("\n");
  }
}
