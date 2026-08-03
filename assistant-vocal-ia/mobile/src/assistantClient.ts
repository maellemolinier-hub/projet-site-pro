import * as SecureStore from "expo-secure-store";

const SERVER_URL_KEY = "assistant_server_url";
const TOKEN_KEY = "assistant_token";

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
 * doivent etre sur le meme reseau local, sauf si un tunnel (ex: Tailscale)
 * est mis en place - voir README.
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
