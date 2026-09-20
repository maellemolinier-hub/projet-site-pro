import type { OrchestrationResult, OrderInput } from "../types";

/**
 * Connecteur Make (ex-Integromat).
 *
 * Flux entrant  : Google Sheets / formulaire → scénario Make → webhook de notre API → commande.
 * Flux sortant  : nos livrables → webhook Make → écriture Google Sheets, envoi email, Slack…
 */
export class MakeClient {
  constructor(
    private readonly webhookUrl?: string,
    private readonly signingSecret?: string,
  ) {}

  get enabled(): boolean {
    return Boolean(this.webhookUrl);
  }

  /** Envoie le résultat d'orchestration vers le scénario Make sortant. */
  async sendResult(result: OrchestrationResult): Promise<{ ok: boolean; status?: number }> {
    if (!this.webhookUrl) return { ok: false };
    const res = await fetch(this.webhookUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(this.signingSecret ? { "x-cef-signature": this.signingSecret } : {}),
      },
      body: JSON.stringify({
        event: "order.completed",
        orderId: result.orderId,
        ok: result.ok,
        agents: result.results.map((r) => ({
          role: r.role,
          ok: r.ok,
          summary: r.summary,
          nextActions: r.nextActions,
          artifacts: r.artifacts.length,
        })),
        finishedAt: result.finishedAt,
      }),
    });
    return { ok: res.ok, status: res.status };
  }

  /** Vérifie le secret partagé d'un webhook entrant. */
  verifyInbound(signature: string | null | undefined): boolean {
    if (!this.signingSecret) return true;
    return signature === this.signingSecret;
  }
}

/**
 * Normalise un payload entrant (Make / Google Sheets / formulaire) en `OrderInput`.
 * Accepte des noms de champs FR ou EN pour rester tolérant aux sources.
 */
export function parseInboundOrder(body: Record<string, unknown>): OrderInput {
  const pick = (...keys: string[]): string | undefined => {
    for (const key of keys) {
      const value = body[key];
      if (typeof value === "string" && value.trim() !== "") return value.trim();
      if (typeof value === "number") return String(value);
    }
    return undefined;
  };

  const budgetRaw = pick("budget", "montant");
  const budget = budgetRaw ? Number(budgetRaw.replace(/[^\d.]/g, "")) : undefined;

  return {
    id: pick("id", "orderId", "commandeId"),
    clientName: pick("clientName", "client", "nom", "name") ?? "Client",
    clientEmail: pick("clientEmail", "email", "mail"),
    clientPhone: pick("clientPhone", "phone", "telephone", "tel"),
    type: pick("type", "prestation", "service") ?? "Prestation",
    description: pick("description", "brief", "details", "besoin", "message") ?? "",
    budget: Number.isFinite(budget) ? budget : undefined,
    metadata: { source: pick("source") ?? "make", raw: body },
  };
}
