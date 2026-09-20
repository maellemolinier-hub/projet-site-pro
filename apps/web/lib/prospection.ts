import { db } from "@immoexpert/db";
import {
  getConfig,
  ProviderRouter,
  VoiceClient,
  HubSpotClient,
  SlackClient,
  type OrderInput,
} from "@immoexpert/agents";

export interface ProspectionTarget {
  company: string;
  phone: string;
  context?: string;
}

export interface ProspectionResult {
  ok: boolean;
  demo: boolean;
  pitch: string;
  callId?: string;
  orderId: string;
}

const SYSTEM = [
  "Tu es le Téléprospecteur IA de CAP Entreprendre France.",
  "Rédige une accroche d'appel B2B ultra courte (3-4 phrases max), naturelle et non robotique,",
  "pour décrocher un rendez-vous. Annonce que tu es un assistant, sois direct sur la valeur.",
  "Rappelle-toi : objectif = intéresser puis proposer un créneau. Conforme RGPD/Bloctel.",
].join("\n");

/**
 * Lance un appel de prospection sur la ligne dédiée : génère l'accroche (IA),
 * déclenche l'appel vocal (Vapi/Retell) si configuré, journalise dans HubSpot
 * et Slack, et enregistre la cible dans le pilotage.
 */
export async function launchProspectionCall(target: ProspectionTarget): Promise<ProspectionResult> {
  const config = getConfig();
  const router = new ProviderRouter(config);

  // 1. Accroche personnalisée.
  let pitch =
    `Bonjour, ici l'assistant de CAP Entreprendre France. Je contacte ${target.company} ` +
    "car nous aidons les entreprises comme la vôtre à gagner des clients grâce au digital. " +
    "Auriez-vous 15 minutes cette semaine pour en parler ?";
  let demo = true;
  if (router.hasLLM()) {
    try {
      const res = await router.default().complete({
        system: SYSTEM,
        messages: [
          {
            role: "user",
            content: `Entreprise : ${target.company}. Contexte : ${target.context ?? "non précisé"}.`,
          },
        ],
        maxTokens: 300,
      });
      if (res.text.trim()) {
        pitch = res.text.trim();
        demo = false;
      }
    } catch {
      // On garde l'accroche par défaut.
    }
  }

  // 2. Appel vocal sur la ligne dédiée (si configurée).
  const voice = new VoiceClient(config.voice);
  let callId: string | undefined;
  if (voice.enabled) {
    const call = await voice
      .startOutboundCall({
        toNumber: target.phone,
        systemPrompt: pitch,
        metadata: { company: target.company, source: "teleprospecteur" },
      })
      .catch(() => ({ ok: false as const }));
    if (call.ok && "id" in call) callId = call.id;
  }

  const orderInput: OrderInput = {
    clientName: target.company,
    clientPhone: target.phone,
    type: "Prospection téléphonique",
    description: target.context ?? "Cible de prospection.",
    metadata: { source: "teleprospecteur" },
  };

  // 3. Journalisation CRM + supervision.
  const hubspot = new HubSpotClient(config.hubspot.token);
  await hubspot
    .logCall(orderInput, `📞 Appel de prospection lancé.\nAccroche : ${pitch}`)
    .catch(() => undefined);

  const slack = new SlackClient(config.slack.webhookUrl);
  await slack
    .notify(`📞 Téléprospecteur : appel lancé vers *${target.company}* (${target.phone}).`)
    .catch(() => undefined);

  // 4. Trace dans le pilotage.
  const order = await db.order.create({
    data: {
      clientName: target.company,
      clientPhone: target.phone,
      type: "Prospection téléphonique",
      description: target.context ?? "Cible de prospection.",
      source: "teleprospecteur",
      status: "IN_PROGRESS",
      metadata: { source: "teleprospecteur", pitch, callId: callId ?? null, demo } as object,
    },
    select: { id: true },
  });

  return { ok: true, demo, pitch, callId, orderId: order.id };
}
