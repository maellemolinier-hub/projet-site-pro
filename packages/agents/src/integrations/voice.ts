/**
 * Connecteur d'agents vocaux (Vapi par défaut, compatible Retell).
 *
 * L'Assistant vocal (agent voice_appointment) produit un prompt système ;
 * ce connecteur permet de le déployer et de déclencher des appels sortants
 * (ex: rappeler un lead pour prendre RDV) ou d'exposer un numéro entrant.
 */
export type VoiceProvider = "vapi" | "retell";

export interface VoiceConfig {
  provider: VoiceProvider;
  apiKey?: string;
  /** Numéro (ou son identifiant) utilisé pour les appels sortants. */
  phoneNumberId?: string;
  /** Assistant vocal préconfiguré côté fournisseur. */
  assistantId?: string;
}

export interface OutboundCall {
  toNumber: string;
  /** Prompt système à utiliser si aucun assistantId n'est fourni. */
  systemPrompt?: string;
  /** Voix (ex: "alloy", "fr-FR-Neural"), selon le fournisseur. */
  voice?: string;
  metadata?: Record<string, unknown>;
}

export class VoiceClient {
  constructor(private readonly config: VoiceConfig) {}

  get enabled(): boolean {
    return Boolean(this.config.apiKey);
  }

  /** Déclenche un appel sortant (prise de RDV / qualification). */
  async startOutboundCall(call: OutboundCall): Promise<{ id?: string; ok: boolean }> {
    if (!this.enabled) return { ok: false };
    return this.config.provider === "retell" ? this.startRetell(call) : this.startVapi(call);
  }

  private async startVapi(call: OutboundCall): Promise<{ id?: string; ok: boolean }> {
    const res = await fetch("https://api.vapi.ai/call", {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.config.apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        phoneNumberId: this.config.phoneNumberId,
        customer: { number: call.toNumber },
        assistantId: this.config.assistantId,
        assistant: this.config.assistantId
          ? undefined
          : {
              model: { provider: "anthropic", model: "claude-3-5-sonnet-latest" },
              firstMessage:
                "Bonjour, ici l'assistant de Cap Entreprendre France. Vous avez un instant ?",
              model_messages: call.systemPrompt
                ? [{ role: "system", content: call.systemPrompt }]
                : undefined,
              voice: call.voice ? { voiceId: call.voice } : undefined,
            },
        metadata: call.metadata,
      }),
    });
    if (!res.ok) return { ok: false };
    const data = (await res.json()) as { id?: string };
    return { id: data.id, ok: true };
  }

  private async startRetell(call: OutboundCall): Promise<{ id?: string; ok: boolean }> {
    const res = await fetch("https://api.retellai.com/v2/create-phone-call", {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.config.apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from_number: this.config.phoneNumberId,
        to_number: call.toNumber,
        override_agent_id: this.config.assistantId,
        metadata: call.metadata,
      }),
    });
    if (!res.ok) return { ok: false };
    const data = (await res.json()) as { call_id?: string };
    return { id: data.call_id, ok: true };
  }
}
