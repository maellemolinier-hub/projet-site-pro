import { db } from "@immoexpert/db";
import {
  createOrchestrator,
  MakeClient,
  HubSpotClient,
  getConfig,
  type OrderInput,
  type OrchestrationResult,
} from "@immoexpert/agents";

/**
 * Crée une commande en base, lance l'orchestration des agents, persiste chaque
 * exécution d'agent, met à jour le statut, puis notifie Make (si configuré).
 */
export async function processOrder(
  input: OrderInput,
): Promise<{ orderId: string; result: OrchestrationResult }> {
  const order = await db.order.create({
    data: {
      clientName: input.clientName,
      clientEmail: input.clientEmail,
      clientPhone: input.clientPhone,
      type: input.type,
      description: input.description,
      budget: input.budget,
      source: (input.metadata?.source as string) ?? "web",
      status: "PLANNED",
      metadata: (input.metadata ?? {}) as object,
    },
    select: { id: true },
  });

  await db.order.update({ where: { id: order.id }, data: { status: "IN_PROGRESS" } });

  const config = getConfig();

  // CRM HubSpot : contact + deal créés dès la réception (avant même la production).
  const hubspot = new HubSpotClient(config.hubspot.token);
  let dealId: string | undefined;
  if (hubspot.enabled) {
    try {
      const contactId = await hubspot.upsertContact(input);
      dealId = await hubspot.createDeal(input, contactId);
    } catch {
      // On ne bloque jamais la production sur une erreur CRM.
    }
  }

  const orchestrator = createOrchestrator(config);
  const result = await orchestrator.run({ ...input, id: order.id }, { parallel: true });

  await db.agentRun.createMany({
    data: result.results.map((r) => ({
      orderId: order.id,
      role: r.role,
      provider: r.usage?.provider,
      model: r.usage?.model,
      status: r.ok ? ("SUCCEEDED" as const) : ("FAILED" as const),
      summary: r.summary,
      output: r.output,
      artifacts: r.artifacts as unknown as object,
      nextActions: r.nextActions as unknown as object,
      error: r.error,
      durationMs: r.usage?.ms,
    })),
  });

  await db.order.update({
    where: { id: order.id },
    data: { status: result.ok ? "COMPLETED" : "FAILED" },
  });

  const make = new MakeClient(config.make.outboundWebhookUrl, config.make.signingSecret);
  if (make.enabled) {
    await make.sendResult(result).catch(() => undefined);
  }

  if (hubspot.enabled && dealId) {
    await hubspot.logResult(dealId, result).catch(() => undefined);
  }

  return { orderId: order.id, result };
}
