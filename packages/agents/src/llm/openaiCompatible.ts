import { LLMError, type LLMProvider, type LLMRequest, type LLMResponse } from "./provider";

/**
 * Fournisseur compatible API "OpenAI Chat Completions".
 *
 * Il ouvre l'accès à de nombreuses IA GRATUITES via une seule et même interface :
 *  - Groq (gratuit, très rapide) : https://api.groq.com/openai/v1
 *  - OpenRouter (modèles ":free") : https://openrouter.ai/api/v1
 *  - Ollama / LM Studio (IA locale sur votre ordinateur, 100% gratuite) : http://localhost:11434/v1
 */
export class OpenAICompatibleProvider implements LLMProvider {
  readonly name = "openai";

  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string | undefined,
    readonly model: string,
  ) {}

  async complete(req: LLMRequest): Promise<LLMResponse> {
    const startedAt = Date.now();
    const url = `${this.baseUrl.replace(/\/$/, "")}/chat/completions`;

    const messages = [
      { role: "system", content: req.system },
      ...req.messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(this.apiKey ? { authorization: `Bearer ${this.apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        max_tokens: req.maxTokens ?? 4096,
        temperature: req.temperature ?? 0.7,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new LLMError(`OpenAI-compatible ${res.status}: ${detail}`, this.name, res.status);
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = (data.choices?.[0]?.message?.content ?? "").trim();

    return { text, provider: this.name, model: this.model, ms: Date.now() - startedAt };
  }
}
