import * as SecureStore from "expo-secure-store";
import * as MailComposer from "expo-mail-composer";

const SERVER_URL_KEY = "assistant_server_url";
const TOKEN_KEY = "assistant_token";
const MAIL_RECIPIENT_KEY = "assistant_mail_recipient";
const MAIL_PASSPHRASE_KEY = "assistant_mail_passphrase";

export async function getServerConfig(): Promise<{
  serverUrl: string | null;
  token: string | null;
}> {
  const [serverUrl, token] = await Promise.all([
    SecureStore.getItemAsync(SERVER_URL_KEY),
    SecureStore.getItemAsync(TOKEN_KEY),
  ]);
  return { serverUrl, token };
}

export async function saveServerConfig(
  serverUrl: string,
  token: string,
): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(SERVER_URL_KEY, serverUrl.trim()),
    SecureStore.setItemAsync(TOKEN_KEY, token.trim()),
  ]);
}

/**
 * Envoie une commande texte au serveur qui tourne sur le PC
 * (`npm run server` dans assistant-vocal-ia/). Le PC et le telephone
 * doivent etre sur le meme reseau Wi-Fi. Pour piloter le PC de n'importe ou,
 * utilise plutot le pont mail (sendCommandByMail ci-dessous).
 */
export async function sendCommand(
  serverUrl: string,
  token: string,
  text: string,
): Promise<string> {
  const response = await fetch(`${serverUrl.replace(/\/$/, "")}/command`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text }),
  });

  const data = (await response.json()) as { response?: string; error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? `Erreur serveur (${response.status})`);
  }

  return data.response ?? "(pas de reponse)";
}

export async function getMailConfig(): Promise<{
  recipient: string | null;
  passphrase: string | null;
}> {
  const [recipient, passphrase] = await Promise.all([
    SecureStore.getItemAsync(MAIL_RECIPIENT_KEY),
    SecureStore.getItemAsync(MAIL_PASSPHRASE_KEY),
  ]);
  return { recipient, passphrase };
}

export async function saveMailConfig(
  recipient: string,
  passphrase: string,
): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(MAIL_RECIPIENT_KEY, recipient.trim()),
    SecureStore.setItemAsync(MAIL_PASSPHRASE_KEY, passphrase.trim()),
  ]);
}

/**
 * Envoie une commande par mail (pont PC <-> mobile, fonctionne de partout,
 * pas besoin d'etre sur le meme reseau). Ouvre l'app Mail native du
 * telephone avec le mail pre-rempli - c'est l'utilisateur qui appuie sur
 * "Envoyer", rien n'est envoye automatiquement en arriere-plan. Le PC
 * (pnpm run mail-bridge) repond par mail une fois la commande executee.
 */
export async function sendCommandByMail(
  recipient: string,
  passphrase: string,
  text: string,
): Promise<void> {
  const available = await MailComposer.isAvailableAsync();
  if (!available) {
    throw new Error("Aucune app Mail configuree sur ce telephone.");
  }

  await MailComposer.composeAsync({
    recipients: [recipient],
    subject: `Serv'IA ${passphrase}`,
    body: text,
  });
}
