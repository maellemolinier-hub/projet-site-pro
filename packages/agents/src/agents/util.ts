import type { AgentContext } from "../types";

/** Met en forme la commande client pour l'injecter dans un prompt utilisateur. */
export function orderBrief(ctx: AgentContext): string {
  const { order } = ctx;
  const lines = [
    `Client : ${order.clientName}`,
    order.clientEmail ? `Email : ${order.clientEmail}` : null,
    order.clientPhone ? `Téléphone : ${order.clientPhone}` : null,
    `Prestation demandée : ${order.type}`,
    order.budget ? `Budget indicatif : ${order.budget} €` : null,
    "",
    "Brief détaillé :",
    order.description,
  ].filter((l): l is string => l !== null);
  return lines.join("\n");
}
