import { google } from "googleapis";
import type { OAuth2Client } from "google-auth-library";
import { promises as fs } from "node:fs";
import path from "node:path";
import http from "node:http";
import { URL } from "node:url";

const TOKEN_PATH = path.resolve(".gmail-token.json");
const REDIRECT_URI = "http://localhost:53682/oauth2callback";

// Lecture seule : l'assistant peut consulter les mails mais jamais en
// envoyer ou en supprimer tant que ce scope n'est pas elargi explicitement.
const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

function createOAuthClient(): OAuth2Client {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET manquants dans .env (voir README > Connecteur mail).",
    );
  }
  return new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);
}

/**
 * Charge le client OAuth deja autorise depuis le token stocke localement.
 * Leve une erreur explicite si `runInteractiveAuthorization` n'a pas
 * encore ete execute.
 */
export async function getAuthorizedClient(): Promise<OAuth2Client> {
  const client = createOAuthClient();
  try {
    const raw = await fs.readFile(TOKEN_PATH, "utf8");
    client.setCredentials(JSON.parse(raw));
    return client;
  } catch {
    throw new Error(
      "Aucune autorisation Gmail trouvee. Lance `pnpm run auth:gmail` (ou `npm run auth:gmail`) une premiere fois.",
    );
  }
}

/**
 * Flux d'autorisation OAuth interactif a executer une seule fois :
 * ouvre une URL Google dans le navigateur, recupere le code via un petit
 * serveur local, et sauvegarde le token (access + refresh) sur disque.
 * Le fichier de token n'est jamais commit (voir .gitignore).
 */
export async function runInteractiveAuthorization(): Promise<void> {
  const client = createOAuthClient();
  const authUrl = client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });

  console.log(
    "Ouvre cette URL dans ton navigateur pour autoriser l'acces en lecture seule a Gmail :\n",
  );
  console.log(authUrl, "\n");

  const code = await new Promise<string>((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url ?? "", REDIRECT_URI);
      const authCode = url.searchParams.get("code");
      if (authCode) {
        res.end("Autorisation recue, tu peux fermer cette fenetre.");
        server.close();
        resolve(authCode);
      } else {
        res.end("Code d'autorisation manquant dans la reponse.");
      }
    });
    server.on("error", reject);
    server.listen(53682);
  });

  const { tokens } = await client.getToken(code);
  await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  console.log(`Autorisation enregistree dans ${TOKEN_PATH}.`);
}
