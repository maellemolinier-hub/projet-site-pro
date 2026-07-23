export * from "./types";
export * from "./config";
export { Orchestrator, type RunOptions } from "./orchestrator/orchestrator";
export { planOrder } from "./orchestrator/planner";
export { buildAgentRegistry } from "./agents/registry";
export { BaseAgent } from "./agents/base";
export { ProviderRouter } from "./llm/router";
export type { LLMProvider, LLMRequest, LLMResponse } from "./llm/provider";
export { LLMError } from "./llm/provider";
export { MakeClient, parseInboundOrder } from "./integrations/make";
export { GoogleSheetsClient } from "./integrations/googleSheets";

import { getConfig, type AgentsConfig } from "./config";
import { Orchestrator } from "./orchestrator/orchestrator";

/** Fabrique de commodité : crée un orchestrateur prêt à l'emploi. */
export function createOrchestrator(overrides: Partial<AgentsConfig> = {}): Orchestrator {
  return new Orchestrator(getConfig(overrides));
}
