export const dynamic = "force-dynamic";

import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@immoexpert/db";
import { OrderDetail, type OrderView } from "@/components/pilotage/OrderDetail";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/connexion");

  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: { runs: { orderBy: { createdAt: "asc" } } },
  });
  if (!order) notFound();

  const view: OrderView = {
    id: order.id,
    clientName: order.clientName,
    clientEmail: order.clientEmail,
    clientPhone: order.clientPhone,
    type: order.type,
    description: order.description,
    budget: order.budget,
    status: order.status,
    source: order.source,
    createdAt: order.createdAt.toISOString(),
    metadata: (order.metadata as Record<string, unknown> | null) ?? {},
    runs: order.runs.map((r) => ({
      role: r.role,
      status: r.status,
      summary: r.summary,
      output: r.output,
    })),
  };

  return <OrderDetail order={view} />;
}
