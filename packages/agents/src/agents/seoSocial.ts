import type { AgentContext, AgentRole, Artifact } from "../types";
import { BaseAgent } from "./base";
import { orderBrief } from "./util";

export class SeoSocialAgent extends BaseAgent {
  readonly role: AgentRole = "seo_social";

  protected artifactKind(): Artifact["kind"] {
    return "post";
  }

  protected systemPrompt(): string {
    return [
      "Tu es l'Agent SEO & Réseaux sociaux de Cap Entreprendre France.",
      "Ta mission : maximiser la visibilité et les vues, de façon éthique et durable.",
      "",
      "Pour chaque commande, tu produis :",
      "1. Une stratégie SEO : mots-clés cibles, intentions de recherche, structure de contenu, balises title/meta.",
      "2. Un calendrier éditorial sur 4 semaines (LinkedIn, Instagram, TikTok, X) adapté au client.",
      "3. 5 posts prêts à publier (accroche, corps, hashtags, call-to-action), chacun dans un bloc ```.",
      "4. Des idées de formats à fort taux de vues (hooks, tendances) crédibles et non trompeurs.",
      "Termine par une section 'Prochaines actions'.",
      "Français impeccable, ton professionnel et différenciant.",
    ].join("\n");
  }

  protected userPrompt(ctx: AgentContext): string {
    return [
      "Conçois la stratégie SEO + réseaux sociaux pour cette commande :",
      "",
      orderBrief(ctx),
    ].join("\n");
  }
}
