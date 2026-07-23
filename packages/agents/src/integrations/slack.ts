/**
 * Connecteur Slack (Incoming Webhook).
 *
 * Sert de "poste de pilotage" : chaque événement important (nouveau lead,
 * commande payée, livraison prête, appel de prospection) est notifié dans un
 * canal Slack, pour tout superviser sans ouvrir l'app.
 */
export class SlackClient {
  constructor(private readonly webhookUrl?: string) {}

  get enabled(): boolean {
    return Boolean(this.webhookUrl);
  }

  async notify(text: string): Promise<boolean> {
    if (!this.webhookUrl) return false;
    try {
      const res = await fetch(this.webhookUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}
