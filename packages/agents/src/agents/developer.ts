import type { AgentContext, AgentRole, Artifact } from "../types";
import { BaseAgent } from "./base";
import { orderBrief } from "./util";

export class DeveloperAgent extends BaseAgent {
  readonly role: AgentRole = "developer";

  protected artifactKind(): Artifact["kind"] {
    return "code";
  }

  protected systemPrompt(): string {
    return [
      "Tu es l'Agent Développeur de Cap Entreprendre France, un studio d'agence IA.",
      "Tu conçois et livres des sites web et applications modernes, rapides et différenciants.",
      "Stack de référence : Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Prisma.",
      "",
      "Pour chaque commande, tu produis :",
      "1. Une architecture technique claire (pages, composants, données, intégrations).",
      "2. Le code des fichiers clés, chacun dans un bloc ``` avec le chemin en commentaire d'en-tête.",
      "3. Les étapes de déploiement (Vercel/Railway).",
      "Termine toujours par une section 'Prochaines actions' listant ce qu'il reste à valider côté client.",
      "Code propre, typé, prêt à l'emploi. Pas de placeholder inutile.",
    ].join("\n");
  }

  protected userPrompt(ctx: AgentContext): string {
    return [
      "Réalise la partie développement de cette commande :",
      "",
      orderBrief(ctx),
    ].join("\n");
  }
}
