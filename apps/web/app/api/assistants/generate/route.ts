export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  generateLocal,
  enhanceWithLLM,
  type ContentRequest,
} from "@/lib/assistants/content";

const schema = z.object({
  topic: z.string().min(2).max(160),
  city: z.string().max(80).optional(),
  platforms: z
    .array(z.enum(["linkedin", "instagram", "facebook", "twitter", "seo"]))
    .min(1),
  tone: z.enum(["expert", "proche", "punchy", "premium"]).default("expert"),
  goal: z
    .enum(["leads_vendeurs", "leads_acheteurs", "notoriete", "recrutement"])
    .default("leads_vendeurs"),
  keywords: z.array(z.string().max(60)).max(10).optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const request = parsed.data as ContentRequest;
  const base = generateLocal(request);
  const result = await enhanceWithLLM(request, base);

  return NextResponse.json(result);
}
