import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    });
  }
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as any)[prop];
  },
});

export const PLANS = {
  STARTER: {
    name: "Starter",
    priceMonthly: 5900,
    priceAnnual: 49000,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_STARTER_MONTHLY,
    stripePriceIdAnnual: process.env.STRIPE_PRICE_STARTER_ANNUAL,
    features: ["Carte des prix", "10 rapports/mois"],
  },
  EXPERT: {
    name: "Expert",
    priceMonthly: 12900,
    priceAnnual: 99000,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_EXPERT_MONTHLY,
    stripePriceIdAnnual: process.env.STRIPE_PRICE_EXPERT_ANNUAL,
    features: ["Tout Starter", "Prospection IA", "Formation", "Badge certifié"],
  },
  AGENCE_PRO: {
    name: "Agence Pro",
    priceMonthly: 24900,
    priceAnnual: 199000,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_AGENCE_MONTHLY,
    stripePriceIdAnnual: process.env.STRIPE_PRICE_AGENCE_ANNUAL,
    features: ["Tout Expert", "10 users", "Widget marque blanche"],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export async function createCheckoutSession({
  userId,
  plan,
  annual,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  plan: PlanKey;
  annual: boolean;
  successUrl: string;
  cancelUrl: string;
}) {
  const planConfig = PLANS[plan];
  const priceId = annual
    ? planConfig.stripePriceIdAnnual
    : planConfig.stripePriceIdMonthly;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: 14,
      metadata: { userId, plan },
    },
    metadata: { userId, plan, priceId: priceId ?? "" },
    success_url: successUrl,
    cancel_url: cancelUrl,
    locale: "fr",
    allow_promotion_codes: true,
  });

  return session;
}

export async function createBillingPortalSession(customerId: string, returnUrl: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}
