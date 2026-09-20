export const dynamic = "force-dynamic";
export const maxDuration = 300;

import { NextResponse } from "next/server";
import { getConfig, MakeClient, parseInboundOrder } from "@immoexpert/agents";
import { processOrder } from "@/lib/agents";

/**
 * Point d'entrée des commandes en provenance de Make / Google Sheets.
 *
 * Le scénario Make (déclenché par une nouvelle ligne Google Sheets ou un
 * formulaire) POST ici. Le secret partagé est vérifié via l'en-tête
 * `x-cef-signature` quand `MAKE_SIGNING_SECRET` est défini.
 */
export async function POST(req: Request) {
  const config = getConfig();
  const make = new MakeClient(config.make.outboundWebhookUrl, config.make.signingSecret);

  const signature = req.headers.get("x-cef-signature");
  if (!make.verifyInbound(signature)) {
    return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const order = parseInboundOrder(body);

  if (!order.description) {
    return NextResponse.json({ error: "Brief (description) manquant" }, { status: 400 });
  }

  const { orderId, result } = await processOrder(order);

  return NextResponse.json({ orderId, ok: result.ok, agents: result.plan.steps.map((s) => s.role) });
}
