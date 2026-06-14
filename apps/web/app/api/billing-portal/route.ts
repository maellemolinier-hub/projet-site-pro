import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createBillingPortalSession } from "@/lib/stripe";
import { db } from "@immoexpert/db";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: { subscription: true },
  });

  if (!user?.subscription?.stripeCustomerId) {
    return NextResponse.json({ error: "Aucun abonnement actif" }, { status: 404 });
  }

  const origin = req.headers.get("origin") ?? "https://immoexpert.fr";
  const session = await createBillingPortalSession(
    user.subscription.stripeCustomerId,
    `${origin}/dashboard/parametres`
  );

  return NextResponse.json({ url: session.url });
}
