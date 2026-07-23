import { db } from "@immoexpert/db";
import {
  createOrchestrator,
  MakeClient,
  HubSpotClient,
  SlackClient,
  getConfig,
  type OrderInput,
  type OrchestrationResult,
} from "@immoexpert/agents";
import { makeDeliveryToken } from "@/lib/delivery";

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

  // Commande terminée : on prépare la livraison "clé en main" du client.
  const baseMetadata = (input.metadata ?? {}) as Record<string, unknown>;
  const deliveryMetadata = result.ok
    ? { delivery: { token: makeDeliveryToken(), createdAt: new Date().toISOString() } }
    : {};

  await db.order.update({
    where: { id: order.id },
    data: {
      status: result.ok ? "COMPLETED" : "FAILED",
      metadata: { ...baseMetadata, ...deliveryMetadata } as object,
    },
  });

  const make = new MakeClient(config.make.outboundWebhookUrl, config.make.signingSecret);
  if (make.enabled) {
    await make.sendResult(result).catch(() => undefined);
  }

  if (hubspot.enabled && dealId) {
    await hubspot.logResult(dealId, result).catch(() => undefined);
  }

  const slack = new SlackClient(config.slack.webhookUrl);
  if (slack.enabled) {
    await slack
      .notify(
        result.ok
          ? `✅ Commande terminée pour *${input.clientName}* (${input.type}). Livraison prête.`
          : `⚠️ Commande *${input.clientName}* : production en échec partiel.`,
      )
      .catch(() => undefined);
  }

  return { orderId: order.id, result };
}

/**
 * Capture un lead (depuis l'assistante Capia) : crée la commande en base au
 * statut RECEIVED et pousse le contact + deal dans HubSpot, SANS lancer les
 * agents. L'entrepreneur déclenche la production quand il le souhaite depuis
 * la page /pilotage.
 */
export async function captureLead(
  input: OrderInput,
): Promise<{ orderId: string }> {
  const order = await db.order.create({
    data: {
      clientName: input.clientName,
      clientEmail: input.clientEmail,
      clientPhone: input.clientPhone,
      type: input.type,
      description: input.description,
      budget: input.budget,
      source: (input.metadata?.source as string) ?? "capia",
      status: "RECEIVED",
      metadata: (input.metadata ?? {}) as object,
    },
    select: { id: true },
  });

  const config = getConfig();
  const hubspot = new HubSpotClient(config.hubspot.token);
  if (hubspot.enabled) {
    try {
      const contactId = await hubspot.upsertContact(input);
      await hubspot.createDeal(input, contactId);
    } catch {
      // Un échec CRM ne doit jamais faire perdre le lead.
    }
  }

  const slack = new SlackClient(config.slack.webhookUrl);
  if (slack.enabled) {
    await slack
      .notify(
        `🟢 Nouveau lead : *${input.clientName}* — ${input.type}` +
          (input.clientEmail ? ` (${input.clientEmail})` : "") +
          (input.clientPhone ? ` ${input.clientPhone}` : ""),
      )
      .catch(() => undefined);
  }

  return { orderId: order.id };
}
