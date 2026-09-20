import { buildAgentRegistry } from "../agents/registry";
import type { BaseAgent } from "../agents/base";
import type { AgentsConfig } from "../config";
import { getConfig } from "../config";
import { ProviderRouter } from "../llm/router";
import { planOrder } from "./planner";
import type {
  AgentContext,
  AgentResult,
  AgentRole,
  OrchestrationPlan,
  OrchestrationResult,
  OrderInput,
} from "../types";

export interface RunOptions {
  /** Exécuter les agents en parallèle (plus rapide) plutôt qu'en séquence. */
  parallel?: boolean;
  /** Journalisation personnalisée. */
  logger?: (message: string, data?: unknown) => void;
  /** Forcer la liste d'agents (sinon planification automatique). */
  roles?: AgentRole[];
}

/**
 * Orchestrateur central de Cap Entreprendre France.
 *
 * Reçoit une commande → planifie les agents à mobiliser → les exécute
 * (avec le bon fournisseur LLM par agent) → agrège les livrables.
 */
export class Orchestrator {
  private readonly registry: Record<AgentRole, BaseAgent>;
  private readonly router: ProviderRouter;

  constructor(private readonly config: AgentsConfig = getConfig()) {
    this.registry = buildAgentRegistry();
    this.router = new ProviderRouter(config);
  }

  /** Fournisseurs LLM réellement disponibles. */
  availableProviders() {
    return this.router.available();
  }

  plan(order: OrderInput, roles?: AgentRole[]): OrchestrationPlan {
    const orderId = order.id ?? cryptoRandomId();
    if (roles && roles.length > 0) {
      return { orderId, steps: roles.map((role) => ({ role, reason: "Sélection manuelle" })) };
    }
    return { orderId, steps: planOrder({ ...order, id: orderId }) };
  }

  async run(order: OrderInput, options: RunOptions = {}): Promise<OrchestrationResult> {
    const startedAt = new Date();
    const logger = options.logger ?? (() => {});
    const plan = this.plan(order, options.roles);
    const orderWithId: OrderInput = { ...order, id: plan.orderId };

    logger(`Commande ${plan.orderId} planifiée`, {
      agents: plan.steps.map((s) => s.role),
      providers: this.router.available(),
    });

    const execAgent = (role: AgentRole): Promise<AgentResult> => {
      const agent = this.registry[role];
      const provider = this.router.forRole(role);
      const ctx: AgentContext = { order: orderWithId, now: new Date(), logger };
      return agent.run(ctx, provider, this.config.maxTokens);
    };

    let results: AgentResult[];
    if (options.parallel) {
      results = await Promise.all(plan.steps.map((s) => execAgent(s.role)));
    } else {
      results = [];
      for (const step of plan.steps) {
        results.push(await execAgent(step.role));
      }
    }

    const finishedAt = new Date();
    return {
      orderId: plan.orderId,
      plan,
      results,
      ok: results.every((r) => r.ok),
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
    };
  }
}

function cryptoRandomId(): string {
  return "cmd_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
