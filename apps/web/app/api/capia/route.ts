import { NextResponse } from "next/server";
import { z } from "zod";
import { buildSystemPrompt, scriptedReply, CAPIA_GREETING } from "@/lib/capia";

export const runtime = "nodejs";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2000),
});

const requestSchema = z.object({
  messages: z.array(messageSchema).min(1).max(20),
});

const CAPIA_MODEL = process.env.CAPIA_MODEL || "claude-sonnet-5";

async function callAnthropic(messages: { role: "user" | "assistant"; content: string }[]) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: CAPIA_MODEL,
        max_tokens: 400,
        system: buildSystemPrompt(),
        messages,
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const text = data?.content?.[0]?.text;
    return typeof text === "string" ? text : null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { messages } = parsed.data;
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
  const turnCount = messages.filter((m) => m.role === "user").length;

  const aiReply = await callAnthropic(messages);
  const reply = aiReply ?? scriptedReply(lastUserMessage?.content ?? "", turnCount);

  return NextResponse.json({ reply, source: aiReply ? "anthropic" : "scripted" });
}

export async function GET() {
  return NextResponse.json({ greeting: CAPIA_GREETING });
}
