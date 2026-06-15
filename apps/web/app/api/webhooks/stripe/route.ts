export const dynamic = "force-dynamic";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_placeholder");
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature")!;

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(session);
      break;
    }
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdated(sub);
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await handleSubscriptionDeleted(sub);
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      await handlePaymentFailed(invoice);
      break;
    }
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { db } = await import("@immoexpert/db");
  const userId = session.metadata?.userId;
  if (!userId) return;

  await db.subscription.upsert({
    where: { stripeSubscriptionId: session.subscription as string },
    create: {
      stripeSubscriptionId: session.subscription as string,
      stripeCustomerId: session.customer as string,
      stripePriceId: session.metadata?.priceId ?? "",
      plan: (session.metadata?.plan ?? "STARTER") as "STARTER" | "EXPERT" | "AGENCE_PRO",
      status: "TRIALING",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      userId,
    },
    update: { status: "ACTIVE" },
  });
}

async function handleSubscriptionUpdated(sub: Stripe.Subscription) {
  const { db } = await import("@immoexpert/db");
  await db.subscription.update({
    where: { stripeSubscriptionId: sub.id },
    data: {
      status: sub.status.toUpperCase() as "ACTIVE" | "PAST_DUE" | "CANCELED",
      currentPeriodStart: new Date(sub.current_period_start * 1000),
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
  });
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  const { db } = await import("@immoexpert/db");
  await db.subscription.update({
    where: { stripeSubscriptionId: sub.id },
    data: { status: "CANCELED" },
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const { db } = await import("@immoexpert/db");
  const subscriptionId = typeof invoice.subscription === "string"
    ? invoice.subscription
    : invoice.subscription?.id;
  if (!subscriptionId) return;

  await db.subscription.update({
    where: { stripeSubscriptionId: subscriptionId },
    data: { status: "PAST_DUE" },
  });
}
