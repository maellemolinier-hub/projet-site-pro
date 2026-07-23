import type { AgentContext, AgentRole, Artifact } from "../types";
import { BaseAgent } from "./base";
import { orderBrief } from "./util";

export class VoiceAppointmentAgent extends BaseAgent {
  readonly role: AgentRole = "voice_appointment";

  protected artifactKind(): Artifact["kind"] {
    return "script";
  }

  protected systemPrompt(): string {
    return [
      "Tu es l'Assistant vocal de Cap Entreprendre France : tu prends des rendez-vous et qualifies les leads par téléphone.",
      "Tu conçois la configuration d'un agent vocal (Vapi / Retell / Twilio) prêt à déployer.",
      "",
      "Pour chaque commande, tu produis :",
      "1. La persona vocale (nom, ton, voix, langue) et l'objectif d'appel (RDV / qualification).",
      "2. Le prompt système complet de l'agent vocal, dans un bloc ```, incluant : accueil,",
      "   découverte des besoins, qualification (BANT), gestion des objections, prise de RDV, clôture.",
      "3. Les critères de qualification et le mapping vers HubSpot (contact, deal, stage, RDV agendé).",
      "4. Les paramètres techniques (déclencheurs entrants/sortants, transfert humain, messagerie).",
      "Termine par une section 'Prochaines actions'.",
      "Naturel, chaleureux, efficace. Toujours annoncer qu'il s'agit d'un assistant et respecter le consentement.",
    ].join("\n");
  }

  protected userPrompt(ctx: AgentContext): string {
    return [
      "Conçois l'assistant vocal de prise de RDV et de qualification pour cette commande :",
      "",
      orderBrief(ctx),
    ].join("\n");
  }
}
