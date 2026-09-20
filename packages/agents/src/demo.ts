/**
 * Démo exécutable de la plateforme d'agents.
 *
 *   pnpm --filter @immoexpert/agents demo
 *
 * Sans clé API, tout tourne en mode DÉMO (le plan + les prompts sont produits,
 * sans appel LLM). Ajoutez ANTHROPIC_API_KEY ou GEMINI_API_KEY pour de vrais
 * livrables.
 */
import { createOrchestrator, type OrderInput } from "./index";

const sampleOrder: OrderInput = {
  clientName: "Boulangerie Le Fournil",
  clientEmail: "contact@lefournil.fr",
  clientPhone: "+33612345678",
  type: "Site vitrine + campagne réseaux sociaux",
  description:
    "Nouvelle boulangerie artisanale à Lyon. Besoin d'un site vitrine moderne avec click & collect, " +
    "d'une stratégie Instagram/TikTok pour gagner en visibilité, de visuels appétissants type pub, " +
    "et d'une prospection auprès des entreprises du quartier pour la livraison de petits-déjeuners.",
  budget: 3500,
};

async function main() {
  const orchestrator = createOrchestrator();
  const logger = (message: string, data?: unknown) =>
    console.log(data ? `${message} ${JSON.stringify(data)}` : message);

  console.log("Fournisseurs LLM disponibles :", orchestrator.availableProviders().join(", "));
  console.log("");

  const result = await orchestrator.run(sampleOrder, { logger, parallel: false });

  console.log("\n===== SYNTHÈSE DE LA COMMANDE", result.orderId, "=====");
  console.log("Statut global :", result.ok ? "OK" : "PARTIEL/ÉCHEC");
  for (const r of result.results) {
    console.log(`\n--- ${r.role} ---`);
    console.log("Résumé   :", r.summary || "(vide)");
    console.log("Livrables:", r.artifacts.length);
    if (r.error) console.log("Erreur   :", r.error);
    if (r.nextActions.length) console.log("À suivre :", r.nextActions.join(" | "));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
