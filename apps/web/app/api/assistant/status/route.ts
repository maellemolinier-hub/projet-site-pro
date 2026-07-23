export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getConfig, ProviderRouter } from "@immoexpert/agents";

/**
 * Diagnostic public et SANS SECRET : indique seulement si une clé LLM est
 * détectée et lequel des fournisseurs est actif. Aucune valeur de clé n'est
 * jamais renvoyée. Utile pour vérifier la configuration après un déploiement.
 */
export async function GET() {
  const config = getConfig();
  const router = new ProviderRouter(config);
  const llm = router.hasLLM();

  return NextResponse.json({
    mode: llm ? "ia" : "demo",
    llm,
    providers: router.available().filter((p) => p !== "dryrun"),
    anthropic: Boolean(config.anthropic.apiKey),
    gemini: Boolean(config.gemini.apiKey),
    openai: Boolean(config.openai.baseUrl),
    message: llm
      ? "Clé détectée : Capia et les agents utilisent la vraie IA."
      : "Aucune clé détectée : mode démo. Vérifiez le nom de la variable et redéployez.",
  });
}
