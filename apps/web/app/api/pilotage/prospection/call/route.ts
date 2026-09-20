export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { launchProspectionCall } from "@/lib/prospection";

const schema = z.object({
  company: z.string().min(1),
  phone: z.string().min(5),
  context: z.string().max(2000).optional(),
});

/** Lance un appel du Téléprospecteur IA vers une entreprise cible. */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const result = await launchProspectionCall(parsed.data);
  return NextResponse.json(result, { status: 201 });
}
