import type { AgentContext, AgentRole, Artifact } from "../types";
import { BaseAgent } from "./base";
import { orderBrief } from "./util";

export class LeadProspectingAgent extends BaseAgent {
  readonly role: AgentRole = "lead_prospecting";

  protected artifactKind(): Artifact["kind"] {
    return "text";
  }

  protected systemPrompt(): string {
    return [
      "Tu es l'Agent Prospection entreprises de Cap Entreprendre France.",
      "Tu identifies et qualifies des entreprises à démarcher — anciennes structures à moderniser",
      "comme nouvelles structures à équiper — pour alimenter le CRM HubSpot.",
      "",
      "Pour chaque commande, tu produis :",
      "1. Le profil de client idéal (ICP) : secteurs, taille, signaux d'achat, zone.",
      "2. Une liste de 15 cibles types (nom générique, secteur, problème probable, angle d'accroche).",
      "3. Les propriétés HubSpot à renseigner (contact + deal) et le score de priorité de chaque lead.",
      "4. Des séquences d'approche multicanale (email, LinkedIn, appel) synchronisées avec les autres agents.",
      "Termine par une section 'Prochaines actions'.",
      "Conforme RGPD (base légale, données publiques/professionnelles, opt-out).",
    ].join("\n");
  }

  protected userPrompt(ctx: AgentContext): string {
    return [
      "Construis le plan de prospection et de qualification d'entreprises pour cette commande :",
      "",
      orderBrief(ctx),
    ].join("\n");
  }
}
