import type { gmail_v1 } from "googleapis";

export interface ParsedCommandEmail {
  passphrase: string;
  commandText: string;
}

// Declencheur tolerant aux variantes : "Serv'IA", "ServIA", "Serv IA"...
// (apostrophe droite/courbe optionnelle, espace optionnel avant "IA").
const TRIGGER_REGEX = /^\s*serv['’]?\s*ia\s+(\S+)\s*(.*)$/is;

/**
 * Extrait la phrase secrete et la commande depuis le sujet d'un mail
 * Serv'IA. Si la commande n'est pas dans le sujet (juste "Serv'IA <phrase>"),
 * elle est prise dans le corps du mail. Renvoie null si le mail ne
 * correspond pas au format attendu (pas un mail de commande).
 */
export function parseCommandEmail(
  subject: string,
  bodyText: string,
): ParsedCommandEmail | null {
  const match = subject.trim().match(TRIGGER_REGEX);
  if (!match) return null;

  const [, passphrase, commandFromSubject] = match;
  const commandText = commandFromSubject.trim() || bodyText.trim();
  if (!commandText) return null;

  return { passphrase, commandText };
}

/**
 * Parcourt recursivement les parties MIME d'un message Gmail pour trouver
 * le premier bloc text/plain et le decoder.
 */
export function extractPlainTextBody(
  payload: gmail_v1.Schema$MessagePart | undefined,
): string {
  if (!payload) return "";

  if (payload.mimeType === "text/plain" && payload.body?.data) {
    return Buffer.from(payload.body.data, "base64url").toString("utf8");
  }

  for (const part of payload.parts ?? []) {
    const text = extractPlainTextBody(part);
    if (text) return text;
  }

  return "";
}

function encodeMimeSubject(subject: string): string {
  return `=?UTF-8?B?${Buffer.from(subject, "utf8").toString("base64")}?=`;
}

/**
 * Construit un email brut (RFC 2822, encode en base64url) pretconsommable
 * par l'API Gmail (`users.messages.send({ requestBody: { raw } })`).
 */
export function buildRawEmail(to: string, subject: string, body: string): string {
  const message = [
    `To: ${to}`,
    `Subject: ${encodeMimeSubject(subject)}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "",
    body,
  ].join("\r\n");

  return Buffer.from(message, "utf8").toString("base64url");
}
