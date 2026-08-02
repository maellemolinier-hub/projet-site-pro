import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@immoexpert/db";
import { auth } from "@/lib/auth";

const updateSchema = z.object({
  status: z.enum(["QUALIFYING", "QUALIFIED", "PROPOSAL_SENT", "MEETING_REQUESTED", "MEETING_BOOKED", "LOST"]),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  const conversation = await db.leadConversation.findUnique({ where: { id } });
  if (!conversation || conversation.userId !== session.user.id) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  const updated = await db.leadConversation.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  return NextResponse.json({ conversation: updated });
}
