export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@immoexpert/db";
import { buildDeliverableMarkdown, collectArtifacts } from "@/lib/delivery";

/** Récupère la livraison d'une commande via son jeton public (côté client). */
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const order = await db.order.findFirst({
    where: { metadata: { path: ["delivery", "token"], equals: token } },
    include: { runs: { orderBy: { createdAt: "asc" } } },
  });

  if (!order) {
    return NextResponse.json({ error: "Livraison introuvable ou lien expiré." }, { status: 404 });
  }

  const metadata = (order.metadata as Record<string, unknown> | null) ?? {};
  const payment = metadata.payment as { status?: string } | undefined;

  const view = {
    id: order.id,
    clientName: order.clientName,
    type: order.type,
    createdAt: order.createdAt.toISOString(),
    runs: order.runs.map((r) => ({
      role: r.role,
      status: r.status,
      summary: r.summary,
      output: r.output,
      artifacts: r.artifacts,
    })),
  };

  return NextResponse.json({
    clientName: order.clientName,
    type: order.type,
    paid: payment?.status === "paid",
    markdown: buildDeliverableMarkdown(view),
    files: collectArtifacts(view),
  });
}
