import { randomBytes } from "node:crypto";

export interface DeliverableRun {
  role: string;
  status: string;
  summary: string | null;
  output: string | null;
  artifacts?: unknown;
}

export interface DeliverableOrder {
  id: string;
  clientName: string;
  type: string;
  createdAt: string | Date;
  runs: DeliverableRun[];
}

/** Jeton de livraison public (lien remis au client). */
export function makeDeliveryToken(): string {
  return randomBytes(24).toString("base64url");
}

interface Artifact {
  kind?: string;
  name?: string;
  content?: string;
  language?: string;
}

function toArtifacts(value: unknown): Artifact[] {
  return Array.isArray(value) ? (value as Artifact[]) : [];
}

/** Livrables téléchargeables individuellement (fichiers de code, posts, scripts…). */
export function collectArtifacts(order: DeliverableOrder): { name: string; content: string }[] {
  const files: { name: string; content: string }[] = [];
  for (const run of order.runs) {
    for (const art of toArtifacts(run.artifacts)) {
      if (art?.content) {
        files.push({ name: art.name || `${run.role}.txt`, content: art.content });
      }
    }
  }
  return files;
}

/**
 * Construit le livrable clé en main (Markdown) que le client télécharge :
 * synthèse par agent + livrables. Aucune dépendance externe.
 */
export function buildDeliverableMarkdown(order: DeliverableOrder): string {
  const date = new Date(order.createdAt).toLocaleDateString("fr-FR");
  const lines: string[] = [
    `# Livraison — ${order.clientName}`,
    "",
    `**Prestation :** ${order.type}`,
    `**Date :** ${date}`,
    `**Réalisé par :** CAP Entreprendre France (agents IA autonomes)`,
    "",
    "---",
    "",
  ];

  if (order.runs.length === 0) {
    lines.push("_La production n'a pas encore été lancée pour cette commande._");
  }

  for (const run of order.runs) {
    lines.push(`## ${run.role}`, "");
    if (run.output) {
      lines.push(run.output.trim(), "");
    } else if (run.summary) {
      lines.push(run.summary.trim(), "");
    }
    lines.push("");
  }

  return lines.join("\n");
}
