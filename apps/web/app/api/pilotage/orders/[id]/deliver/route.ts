export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@immoexpert/db";
import { auth } from "@/lib/auth";
import { makeDeliveryToken } from "@/lib/delivery";

/** Génère (ou récupère) le lien de livraison public d'une commande. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const order = await db.order.findUnique({ where: { id }, select: { metadata: true } });
  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });

  const metadata = (order.metadata as Record<string, unknown> | null) ?? {};
  let delivery = metadata.delivery as { token: string; createdAt: string } | undefined;

  if (!delivery?.token) {
    delivery = { token: makeDeliveryToken(), createdAt: new Date().toISOString() };
    await db.order.update({
      where: { id },
      data: { metadata: { ...metadata, delivery } as object },
    });
  }

  const url = `${new URL(req.url).origin}/livraison/${delivery.token}`;
  return NextResponse.json({ url, token: delivery.token });
}
