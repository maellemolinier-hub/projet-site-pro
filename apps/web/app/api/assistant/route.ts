export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getClaude,
  isClaudeConfigured,
  CLAUDE_MODEL,
  CLAUDE_MAX_TOKENS,
  ASSISTANT_SYSTEM_PROMPT,
} from "@/lib/claude";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(16000),
});

const schema = z.object({
  messages: z.array(messageSchema).min(1).max(50),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  if (!isClaudeConfigured()) {
    return NextResponse.json(
      { error: "L'assistant IA n'est pas configuré (ANTHROPIC_API_KEY manquant)." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const { messages } = parsed.data;

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const anthropic = getClaude();
        const messageStream = anthropic.messages.stream({
          model: CLAUDE_MODEL,
          max_tokens: CLAUDE_MAX_TOKENS,
          system: ASSISTANT_SYSTEM_PROMPT,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        });

        messageStream.on("text", (text: string) => {
          controller.enqueue(encoder.encode(text));
        });

        await messageStream.finalMessage();
        controller.close();
      } catch (err) {
        const detail = err instanceof Error ? err.message : "Erreur inconnue";
        try {
          controller.enqueue(
            encoder.encode(`\n\n[Erreur de l'assistant : ${detail}]`),
          );
        } catch {
          // stream already closed
        }
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
