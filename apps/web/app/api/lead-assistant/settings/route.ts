import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@immoexpert/db";
import { auth } from "@/lib/auth";

const updateSchema = z.object({
  businessDescription: z.string().max(2000).optional(),
  bookingLink: z.string().url().max(500).nullable().optional(),
  minIntentScore: z.number().min(0).max(1).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const settings = await db.leadAssistantSettings.findUnique({ where: { userId: session.user.id } });
  return NextResponse.json({ settings });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  const settings = await db.leadAssistantSettings.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...parsed.data },
    update: parsed.data,
  });

  return NextResponse.json({ settings });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  await db.leadAssistantSettings.updateMany({
    where: { userId: session.user.id },
    data: { slackTeamId: null, slackTeamName: null, slackBotToken: null, slackUserId: null },
  });

  return NextResponse.json({ ok: true });
}
