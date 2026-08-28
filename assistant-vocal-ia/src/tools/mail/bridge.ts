import { google, type gmail_v1 } from "googleapis";
import { getAuthorizedClient } from "./auth.js";
import { extractPlainTextBody, buildRawEmail, parseCommandEmail } from "./bridgeParser.js";
import { runCommand } from "../../core/router.js";

interface BridgeConfig {
  trustedSender: string;
  passphrase: string;
}

function getBridgeConfig(): BridgeConfig {
  const trustedSender = process.env.TRUSTED_SENDER_EMAIL;
  const passphrase = process.env.COMMAND_PASSPHRASE;
  if (!trustedSender || !passphrase) {
    throw new Error(
      "TRUSTED_SENDER_EMAIL et COMMAND_PASSPHRASE doivent etre definis dans .env avant de lancer le pont mail (voir README > Pont mail).",
    );
  }
  return { trustedSender: trustedSender.trim().toLowerCase(), passphrase };
}

function extractEmailAddress(fromHeader: string): string {
  const match = fromHeader.match(/<([^>]+)>/);
  return (match ? match[1] : fromHeader).trim().toLowerCase();
}

/**
 * Une passe de verification : cherche les mails de commande non lus,
 * les execute via le routeur, repond avec le resultat, et les marque lus.
 * Ne traite QUE les mails envoyes par TRUSTED_SENDER_EMAIL et contenant la
 * bonne COMMAND_PASSPHRASE - voir README > Securite du pont mail.
 */
export async function pollMailBridgeOnce(): Promise<void> {
  const { trustedSender, passphrase } = getBridgeConfig();
  const auth = await getAuthorizedClient();
  const gmail = google.gmail({ version: "v1", auth });

  const { data } = await gmail.users.messages.list({
    userId: "me",
    q: 'is:unread subject:"Serv\'IA"',
    maxResults: 10,
  });

  for (const message of data.messages ?? []) {
    if (!message.id) continue;
    await processMessage(gmail, message.id, trustedSender, passphrase);
  }
}

async function processMessage(
  gmail: gmail_v1.Gmail,
  messageId: string,
  trustedSender: string,
  passphrase: string,
): Promise<void> {
  const { data: full } = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full",
  });

  const headers = full.payload?.headers ?? [];
  const getHeader = (name: string) =>
    headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? "";

  const fromAddress = extractEmailAddress(getHeader("From"));
  const subject = getHeader("Subject");
  const bodyText = extractPlainTextBody(full.payload);

  const markAsRead = () =>
    gmail.users.messages.modify({
      userId: "me",
      id: messageId,
      requestBody: { removeLabelIds: ["UNREAD"] },
    });

  if (fromAddress !== trustedSender) {
    // Expediteur non autorise : on ignore silencieusement (pas de reponse,
    // pour ne pas confirmer a un inconnu que le declencheur "Serv'IA" existe).
    await markAsRead();
    return;
  }

  const parsed = parseCommandEmail(subject, bodyText);
  if (!parsed) {
    await markAsRead();
    return;
  }

  if (parsed.passphrase !== passphrase) {
    await sendReply(gmail, fromAddress, subject, "Phrase secrete incorrecte - commande ignoree.");
    await markAsRead();
    return;
  }

  let responseText: string;
  try {
    responseText = await runCommand(parsed.commandText);
  } catch (error) {
    responseText = `Erreur lors de l'execution : ${error instanceof Error ? error.message : error}`;
  }

  await sendReply(gmail, fromAddress, subject, responseText);
  await markAsRead();
}

async function sendReply(
  gmail: gmail_v1.Gmail,
  to: string,
  originalSubject: string,
  body: string,
): Promise<void> {
  const subject = originalSubject.toLowerCase().startsWith("re:")
    ? originalSubject
    : `Re: ${originalSubject}`;

  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: buildRawEmail(to, subject, body) },
  });
}

/**
 * Boucle infinie (volontaire) qui verifie periodiquement les nouveaux mails
 * de commande. A executer via `pnpm run mail-bridge`, interrompre avec
 * Ctrl+C.
 */
export async function runMailBridgeLoop(intervalMs: number): Promise<void> {
  console.log(`Pont mail actif - verification toutes les ${Math.round(intervalMs / 1000)}s.`);
  for (;;) {
    try {
      await pollMailBridgeOnce();
    } catch (error) {
      console.error("Erreur pont mail:", error instanceof Error ? error.message : error);
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}
