import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { createCheckoutSession, type PlanKey } from "@/lib/stripe";
import { z } from "zod";

const schema = z.object({
  plan: z.enum(["STARTER", "EXPERT", "AGENCE_PRO"]),
  annual: z.boolean().default(true),
});

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const { plan, annual } = parsed.data;
  const origin = req.headers.get("origin") ?? "https://immoexpert.fr";

  const session = await createCheckoutSession({
    userId,
    plan: plan as PlanKey,
    annual,
    successUrl: `${origin}/dashboard?welcome=1`,
    cancelUrl: `${origin}/#tarifs`,
  });

  return NextResponse.json({ url: session.url });
}
