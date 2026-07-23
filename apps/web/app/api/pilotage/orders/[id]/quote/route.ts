export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@immoexpert/db";
import { auth } from "@/lib/auth";
import { computeTotal, type Quote } from "@/lib/quote";

const schema = z.object({
  items: z
    .array(
      z.object({
        offerId: z.string().optional(),
        label: z.string().min(1),
        quantity: z.number().int().min(1),
        unitPrice: z.number().min(0),
      }),
    )
    .min(1),
  notes: z.string().max(2000).optional(),
});

/** Enregistre / met à jour le devis d'une commande. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const order = await db.order.findUnique({ where: { id }, select: { metadata: true } });
  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });

  const quote: Quote = {
    items: parsed.data.items,
    notes: parsed.data.notes,
    currency: "eur",
    total: computeTotal(parsed.data.items),
    updatedAt: new Date().toISOString(),
  };

  const metadata = { ...((order.metadata as object | null) ?? {}), quote };
  await db.order.update({ where: { id }, data: { metadata: metadata as object } });

  return NextResponse.json({ quote });
}
