import { google } from "googleapis";
import { getAuthorizedClient } from "./auth.js";

export interface EmailSummary {
  from: string;
  subject: string;
  date: string;
  snippet: string;
}

export interface ListEmailsOptions {
  maxResults?: number;
  unreadOnly?: boolean;
}

/**
 * Liste les emails recents en lecture seule. Necessite une autorisation
 * prealable (voir auth.ts / `pnpm run auth:gmail`).
 */
export async function listRecentEmails(
  options: ListEmailsOptions = {},
): Promise<EmailSummary[]> {
  const auth = await getAuthorizedClient();
  const gmail = google.gmail({ version: "v1", auth });

  const { data } = await gmail.users.messages.list({
    userId: "me",
    maxResults: options.maxResults ?? 5,
    q: options.unreadOnly ? "is:unread" : undefined,
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
    const getHeader = (name: string) =>
      headers.find((header) => header.name === name)?.value ?? "";

    summaries.push({
      from: getHeader("From"),
      subject: getHeader("Subject"),
      date: getHeader("Date"),
      snippet: full.snippet ?? "",
    });
  }

  return summaries;
}
