import { google } from 'googleapis';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createInterface } from 'readline';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const TOKENS_PATH = resolve(__dir, '.youtube-tokens.json');
const CONFIG_PATH = resolve(__dir, 'config.json');

const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube',
];

function loadConfig() {
  if (!existsSync(CONFIG_PATH)) {
    throw new Error(
      `config.json introuvable. Copiez config.example.json → config.json et remplissez vos identifiants Google OAuth.`
    );
  }
  return JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
}

function createOAuthClient(config) {
  return new google.auth.OAuth2(
    config.client_id,
    config.client_secret,
    config.redirect_uri
  );
}

async function promptCode(authUrl) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  console.log('\n--- Autorisation Google OAuth 2.0 ---');
  console.log('1. Ouvrez cette URL dans votre navigateur :');
  console.log(`\n   ${authUrl}\n`);
  return new Promise((resolve) => {
    rl.question('2. Collez le code d\'autorisation ici : ', (code) => {
      rl.close();
      resolve(code.trim());
    });
  });
}

export async function getAuthenticatedClient() {
  const config = loadConfig();
  const oauth2Client = createOAuthClient(config);

  if (existsSync(TOKENS_PATH)) {
    const tokens = JSON.parse(readFileSync(TOKENS_PATH, 'utf8'));
    oauth2Client.setCredentials(tokens);

    // Rafraîchit le token si expiré
    if (tokens.expiry_date && tokens.expiry_date < Date.now()) {
      const { credentials } = await oauth2Client.refreshAccessToken();
      writeFileSync(TOKENS_PATH, JSON.stringify(credentials, null, 2));
      oauth2Client.setCredentials(credentials);
    }
    return oauth2Client;
  }

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });

  const code = await promptCode(authUrl);
  const { tokens } = await oauth2Client.getToken(code);
  writeFileSync(TOKENS_PATH, JSON.stringify(tokens, null, 2));
  oauth2Client.setCredentials(tokens);
  console.log('Authentification réussie. Token sauvegardé.\n');
  return oauth2Client;
}
