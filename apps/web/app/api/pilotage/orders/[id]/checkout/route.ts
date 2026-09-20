export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@immoexpert/db";
import { auth } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import type { Quote, PaymentState } from "@/lib/quote";

/** Crée un lien de paiement Stripe (paiement unique) pour le devis d'une commande. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe n'est pas configuré (STRIPE_SECRET_KEY manquant)." },
      { status: 400 },
    );
  }

  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    select: { metadata: true, clientEmail: true },
  });
  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });

  const metadata = (order.metadata as Record<string, unknown> | null) ?? {};
  const quote = metadata.quote as Quote | undefined;
  if (!quote || quote.total <= 0) {
    return NextResponse.json({ error: "Aucun devis à payer sur cette commande." }, { status: 400 });
  }

  const origin = new URL(req.url).origin;
  const stripe = getStripe();
  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: quote.items.map((it) => ({
      quantity: it.quantity,
      price_data: {
        currency: "eur",
        unit_amount: Math.round(it.unitPrice * 100),
        product_data: { name: it.label },
      },
    })),
    customer_email: order.clientEmail ?? undefined,
    metadata: { orderId: id, kind: "order_payment" },
    success_url: `${origin}/pilotage/commande/${id}?paid=1`,
    cancel_url: `${origin}/pilotage/commande/${id}`,
    locale: "fr",
  });

  const payment: PaymentState = {
    status: "pending",
    sessionId: checkout.id,
    amount: quote.total,
  };
  await db.order.update({
    where: { id },
    data: { metadata: { ...metadata, payment } as object },
  });

  return NextResponse.json({ url: checkout.url });
}
