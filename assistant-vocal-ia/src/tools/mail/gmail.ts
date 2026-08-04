import { google } from "googleapis";
import { getAuthorizedClient } from "./auth.js";
import { extractPlainTextBody } from "./bridgeParser.js";

export interface EmailSummary {
  id: string;
  from: string;
  subject: string;
  date: string;
  snippet: string;
}

export interface EmailDetail {
  id: string;
  from: string;
  subject: string;
  date: string;
  body: string;
}

export interface ListEmailsOptions {
  maxResults?: number;
  unreadOnly?: boolean;
}

function getHeader(headers: { name?: string | null; value?: string | null }[], name: string) {
  return headers.find((header) => header.name === name)?.value ?? "";
}

/**
 * Liste les emails recents en lecture seule. Necessite une autorisation
 * prealable (voir auth.ts / `pnpm run auth:gmail`).
 */
export async function listRecentEmails(
  options: ListEmailsOptions = {},
): Promise<EmailSummary[]> {
  return searchEmails(options.unreadOnly ? "is:unread" : "", options.maxResults ?? 5);
}

/**
 * Recherche des emails avec une requete de recherche Gmail classique
 * (from:, subject:, after:, before:, texte libre...) - pas limite aux
 * emails recents. Toujours en lecture seule.
 */
export async function searchEmails(
  query: string,
  maxResults = 10,
): Promise<EmailSummary[]> {
  const auth = await getAuthorizedClient();
  const gmail = google.gmail({ version: "v1", auth });

  const { data } = await gmail.users.messages.list({
    userId: "me",
    maxResults,
    q: query || undefined,
  });

  const messages = data.messages ?? [];
  const summaries: EmailSummary[] = [];

  for (const message of messages) {
    if (!message.id) continue;

    const { data: full } = await gmail.users.messages.get({
      userId: "me",
      id: message.id,
      format: "metadata",
      metadataHeaders: ["From", "Subject", "Date"],
    });

    const headers = full.payload?.headers ?? [];
    summaries.push({
      id: message.id,
      from: getHeader(headers, "From"),
      subject: getHeader(headers, "Subject"),
      date: getHeader(headers, "Date"),
      snippet: full.snippet ?? "",
    });
  }

  return summaries;
}

/**
 * Lit le contenu complet (corps du message, pas juste un extrait) d'un
 * email a partir de son id (obtenu via listRecentEmails / searchEmails).
 */
export async function readEmailById(emailId: string): Promise<EmailDetail> {
  const auth = await getAuthorizedClient();
  const gmail = google.gmail({ version: "v1", auth });

  const { data: full } = await gmail.users.messages.get({
    userId: "me",
    id: emailId,
    format: "full",
  });

  const headers = full.payload?.headers ?? [];

  return {
    id: emailId,
    from: getHeader(headers, "From"),
    subject: getHeader(headers, "Subject"),
    date: getHeader(headers, "Date"),
    body: extractPlainTextBody(full.payload) || full.snippet || "",
  };
}
