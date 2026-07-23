import type { OrchestrationResult, OrderInput } from "../types";

const HUBSPOT_BASE = "https://api.hubapi.com";

/**
 * Connecteur HubSpot CRM (Private App token).
 *
 * À la réception d'une commande, on crée/met à jour le contact et on ouvre un
 * deal. À la fin de l'orchestration, on note la synthèse des agents sur le deal.
 */
export class HubSpotClient {
  constructor(private readonly token?: string) {}

  get enabled(): boolean {
    return Boolean(this.token);
  }

  private async request<T>(path: string, method: string, body?: unknown): Promise<T> {
    const res = await fetch(`${HUBSPOT_BASE}${path}`, {
      method,
      headers: {
        authorization: `Bearer ${this.token}`,
        "content-type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      throw new Error(`HubSpot ${res.status}: ${await res.text().catch(() => "")}`);
    }
    return (await res.json()) as T;
  }

  /** Crée ou met à jour un contact (clé : email). */
  async upsertContact(order: OrderInput): Promise<string | undefined> {
    if (!this.enabled) return undefined;
    const [firstname, ...rest] = order.clientName.split(" ");
    const properties: Record<string, string> = {
      firstname: firstname ?? order.clientName,
      lastname: rest.join(" "),
      company: order.clientName,
    };
    if (order.clientEmail) properties.email = order.clientEmail;
    if (order.clientPhone) properties.phone = order.clientPhone;

    try {
      const created = await this.request<{ id: string }>("/crm/v3/objects/contacts", "POST", {
        properties,
      });
      return created.id;
    } catch (err) {
      // 409 = contact déjà existant → on le met à jour via l'email.
      if (order.clientEmail && String(err).includes("409")) {
        const updated = await this.request<{ id: string }>(
          `/crm/v3/objects/contacts/${encodeURIComponent(order.clientEmail)}?idProperty=email`,
          "PATCH",
          { properties },
        );
        return updated.id;
      }
      throw err;
    }
  }

  /** Crée un deal et l'associe éventuellement à un contact. */
  async createDeal(order: OrderInput, contactId?: string): Promise<string | undefined> {
    if (!this.enabled) return undefined;
    const deal = await this.request<{ id: string }>("/crm/v3/objects/deals", "POST", {
      properties: {
        dealname: `${order.clientName} — ${order.type}`,
        pipeline: "default",
        dealstage: "appointmentscheduled",
        amount: order.budget ? String(order.budget) : undefined,
      },
      associations: contactId
        ? [
            {
              to: { id: contactId },
              types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 3 }],
            },
          ]
        : undefined,
    });
    return deal.id;
  }

  /** Journalise un appel de prospection sur le contact (crée le contact si besoin). */
  async logCall(order: OrderInput, body: string): Promise<void> {
    if (!this.enabled) return;
    const contactId = await this.upsertContact(order).catch(() => undefined);
    if (!contactId) return;
    await this.request("/crm/v3/objects/notes", "POST", {
      properties: { hs_note_body: body, hs_timestamp: Date.now() },
      associations: [
        {
          to: { id: contactId },
          types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 202 }],
        },
      ],
    });
  }

  /** Journalise la synthèse d'orchestration en note sur le deal. */
  async logResult(dealId: string, result: OrchestrationResult): Promise<void> {
    if (!this.enabled) return;
    const body = result.results
      .map((r) => `• ${r.role} : ${r.ok ? "OK" : "ÉCHEC"} — ${r.summary}`)
      .join("\n");
    await this.request("/crm/v3/objects/notes", "POST", {
      properties: {
        hs_note_body: `Agents Cap Entreprendre France — commande ${result.orderId}\n${body}`,
        hs_timestamp: Date.now(),
      },
      associations: [
        {
          to: { id: dealId },
          types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 214 }],
        },
      ],
    });
  }
}
