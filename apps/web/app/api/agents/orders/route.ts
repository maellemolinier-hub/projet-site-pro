export const dynamic = "force-dynamic";
export const maxDuration = 300;

import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@immoexpert/db";
import { auth } from "@/lib/auth";
import { processOrder } from "@/lib/agents";

const schema = z.object({
  clientName: z.string().min(1),
  clientEmail: z.string().email().optional(),
  clientPhone: z.string().optional(),
  type: z.string().min(1),
  description: z.string().min(1),
  budget: z.number().positive().optional(),
});

/** Crée une commande et lance les agents. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { orderId, result } = await processOrder({
    ...parsed.data,
    metadata: { source: "web" },
  });

  return NextResponse.json(
    {
      orderId,
      ok: result.ok,
      plan: result.plan.steps,
      results: result.results.map((r) => ({
        role: r.role,
        ok: r.ok,
        summary: r.summary,
        artifacts: r.artifacts.length,
        nextActions: r.nextActions,
      })),
    },
    { status: 201 },
  );
}

/** Liste les dernières commandes (réservé aux utilisateurs connectés). */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      runs: { select: { role: true, status: true, summary: true } },
    },
  });

  return NextResponse.json({ orders });
}
