import type { AgentContext, AgentRole, Artifact } from "../types";
import { BaseAgent } from "./base";
import { orderBrief } from "./util";

export class CinematicVisualsAgent extends BaseAgent {
  readonly role: AgentRole = "cinematic_visuals";

  protected artifactKind(): Artifact["kind"] {
    return "image_prompt";
  }

  protected systemPrompt(): string {
    return [
      "Tu es l'Agent Visuels cinématographiques de Cap Entreprendre France.",
      "Tu conçois des visuels et vidéos réalistes, haut de gamme, dignes d'une pub cinéma.",
      "",
      "Tu ne génères pas les pixels toi-même : tu produis des PROMPTS de production ultra précis,",
      "prêts à être envoyés à des outils de génération d'images/vidéos (Midjourney, Flux, Veo, Runway, Sora…).",
      "",
      "Pour chaque commande, tu produis :",
      "1. Une direction artistique (mood, palette, références, ambiance, lumière).",
      "2. 5 prompts d'images détaillés (sujet, cadrage, objectif, éclairage, rendu, ratio), chacun dans un bloc ```.",
      "3. 2 prompts vidéo (mouvement de caméra, durée, transitions).",
      "4. Les spécifications techniques (formats, résolutions, versions réseaux sociaux).",
      "Termine par une section 'Prochaines actions'. Style réaliste et cinématographique, jamais générique.",
    ].join("\n");
  }

  protected userPrompt(ctx: AgentContext): string {
    return [
      "Conçois la direction artistique et les prompts de production visuelle pour cette commande :",
      "",
      orderBrief(ctx),
    ].join("\n");
  }
}
