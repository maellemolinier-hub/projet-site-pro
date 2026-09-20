export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import { z } from "zod";
import { getConfig, ProviderRouter } from "@immoexpert/agents";
import { buildSystemPrompt, dryRunDiagnose, parseReply, type ChatMessage } from "@/lib/assistant";

const schema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(30),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const messages = parsed.data.messages as ChatMessage[];
  const config = getConfig();
  const router = new ProviderRouter(config);

  // Sans clé LLM : diagnostic hors-ligne (l'assistante reste fonctionnelle en démo).
  if (!router.hasLLM()) {
    return NextResponse.json({ ...dryRunDiagnose(messages), demo: true });
  }

  try {
    const provider = router.default();
    const response = await provider.complete({
      system: buildSystemPrompt(),
      messages,
      maxTokens: 700,
      temperature: 0.6,
    });
    return NextResponse.json({ ...parseReply(response.text), demo: false });
  } catch {
    // En cas d'erreur LLM, on ne casse pas l'expérience : repli sur le diagnostic hors-ligne.
    return NextResponse.json({ ...dryRunDiagnose(messages), demo: true });
  }
}
