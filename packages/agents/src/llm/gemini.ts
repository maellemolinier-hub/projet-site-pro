import { LLMError, type LLMProvider, type LLMRequest, type LLMResponse } from "./provider";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

/** Client Gemini (Google) basé sur `fetch` — aucune dépendance externe. */
export class GeminiProvider implements LLMProvider {
  readonly name = "gemini";

  constructor(
    private readonly apiKey: string,
    readonly model: string,
  ) {}

  async complete(req: LLMRequest): Promise<LLMResponse> {
    const startedAt = Date.now();
    const url = `${GEMINI_BASE}/${encodeURIComponent(this.model)}:generateContent?key=${this.apiKey}`;

    const contents = req.messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: req.system }] },
        contents,
        generationConfig: {
          temperature: req.temperature ?? 0.7,
          maxOutputTokens: req.maxTokens ?? 4096,
        },
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new LLMError(`Gemini ${res.status}: ${detail}`, this.name, res.status);
    }

    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = (data.candidates?.[0]?.content?.parts ?? [])
      .map((part) => part.text ?? "")
      .join("\n")
      .trim();

    return { text, provider: this.name, model: this.model, ms: Date.now() - startedAt };
  }
}
