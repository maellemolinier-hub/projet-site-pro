export const dynamic = "force-dynamic";
export const maxDuration = 30;

import { NextResponse } from "next/server";
import { z } from "zod";
import { captureLead } from "@/lib/agents";
import { offerById } from "@/lib/offers";

const schema = z
  .object({
    clientName: z.string().min(1, "Nom requis"),
    clientEmail: z.string().email().optional().or(z.literal("")),
    clientPhone: z.string().optional(),
    offerId: z.string().optional(),
    summary: z.string().max(4000).optional(),
  })
  .refine((d) => d.clientEmail || d.clientPhone, {
    message: "Un email ou un téléphone est requis",
  });

/** Capture un lead qualifié par Capia (→ commande RECEIVED + HubSpot). */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { clientName, clientEmail, clientPhone, offerId, summary } = parsed.data;
  const offer = offerId ? offerById(offerId) : undefined;

  const { orderId } = await captureLead({
    clientName,
    clientEmail: clientEmail || undefined,
    clientPhone,
    type: offer ? offer.name : "Demande via Capia",
    description: summary?.trim() || "Lead capturé par l'assistante Capia sur le site.",
    metadata: { source: "capia", offerId: offerId ?? null },
  });

  return NextResponse.json({ ok: true, orderId }, { status: 201 });
}
