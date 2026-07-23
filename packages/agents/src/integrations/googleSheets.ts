import crypto from "node:crypto";

interface ServiceAccount {
  client_email: string;
  private_key: string;
}

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SHEETS_BASE = "https://sheets.googleapis.com/v4/spreadsheets";
const SCOPE = "https://www.googleapis.com/auth/spreadsheets";

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Charge le compte de service depuis une chaîne JSON brute ou base64. */
function parseServiceAccount(raw: string): ServiceAccount {
  let text = raw.trim();
  if (!text.startsWith("{")) {
    text = Buffer.from(text, "base64").toString("utf8");
  }
  const parsed = JSON.parse(text) as ServiceAccount;
  if (!parsed.client_email || !parsed.private_key) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON invalide : client_email/private_key manquant.");
  }
  // Les \n échappés (courant dans les variables d'env) sont restaurés.
  parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
  return parsed;
}

/**
 * Client Google Sheets minimal (compte de service, API REST v4).
 * Node-only (utilise `node:crypto`) — à appeler côté serveur uniquement.
 */
export class GoogleSheetsClient {
  private readonly account: ServiceAccount;
  private token?: { value: string; expiresAt: number };

  constructor(
    serviceAccountJson: string,
    private readonly spreadsheetId: string,
  ) {
    this.account = parseServiceAccount(serviceAccountJson);
  }

  private async accessToken(): Promise<string> {
    if (this.token && this.token.expiresAt > Date.now() + 30_000) {
      return this.token.value;
    }
    const now = Math.floor(Date.now() / 1000);
    const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const claim = base64url(
      JSON.stringify({
        iss: this.account.client_email,
        scope: SCOPE,
        aud: TOKEN_URL,
        iat: now,
        exp: now + 3600,
      }),
    );
    const signingInput = `${header}.${claim}`;
    const signature = base64url(
      crypto.sign("RSA-SHA256", Buffer.from(signingInput), this.account.private_key),
    );
    const assertion = `${signingInput}.${signature}`;

    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion,
      }),
    });
    if (!res.ok) {
      throw new Error(`Google token ${res.status}: ${await res.text().catch(() => "")}`);
    }
    const data = (await res.json()) as { access_token: string; expires_in: number };
    this.token = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
    return data.access_token;
  }

  /** Ajoute une ligne à un onglet. */
  async appendRow(range: string, values: (string | number)[]): Promise<void> {
    const token = await this.accessToken();
    const url = `${SHEETS_BASE}/${this.spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;
    const res = await fetch(url, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ values: [values] }),
    });
    if (!res.ok) {
      throw new Error(`Sheets append ${res.status}: ${await res.text().catch(() => "")}`);
    }
  }

  /** Lit les valeurs d'une plage. */
  async readRange(range: string): Promise<string[][]> {
    const token = await this.accessToken();
    const url = `${SHEETS_BASE}/${this.spreadsheetId}/values/${encodeURIComponent(range)}`;
    const res = await fetch(url, { headers: { authorization: `Bearer ${token}` } });
    if (!res.ok) {
      throw new Error(`Sheets read ${res.status}: ${await res.text().catch(() => "")}`);
    }
    const data = (await res.json()) as { values?: string[][] };
    return data.values ?? [];
  }
}
