import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  prenom: z.string().min(1, "Prénom requis"),
  nom: z.string().min(1, "Nom requis"),
  email: z.string().email("Email invalide"),
  societe: z.string().min(1, "Société requise"),
  telephone: z.string().optional().default(""),
  typeStructure: z.string().optional().default(""),
  nbUtilisateurs: z.string().optional().default(""),
  message: z.string().optional().default(""),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Champs invalides", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const {
    prenom,
    nom,
    email,
    societe,
    telephone,
    typeStructure,
    nbUtilisateurs,
    message: messageLibre,
  } = parsed.data;

  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKeyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!spreadsheetId || !serviceAccountEmail || !privateKeyRaw) {
    console.error(
      "[contact-entreprise] Missing Google Sheets env vars. Set GOOGLE_SHEETS_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY."
    );
    return NextResponse.json(
      { error: "Configuration serveur incomplète. Contactez l'administrateur." },
      { status: 500 }
    );
  }

  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");

  try {
    const jwt = await getGoogleJwt(serviceAccountEmail, privateKey);

    const range = "Assistant Commercial!A1";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;

    const now = new Date().toISOString();
    const row = [
      now, // Date de réception
      prenom,
      nom,
      email,
      societe,
      telephone,
      typeStructure,
      nbUtilisateurs,
      messageLibre,
      "à traiter", // Statut par défaut
    ];

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: [row] }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[contact-entreprise] Google Sheets API error:", res.status, errText);
      return NextResponse.json(
        { error: "Erreur lors de l'enregistrement de la demande." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[contact-entreprise] Unexpected error:", err);
    return NextResponse.json(
      { error: "Erreur inattendue. Réessayez plus tard." },
      { status: 500 }
    );
  }
}

/**
 * Mint a Google OAuth2 access token from a service account JWT.
 * Avoids needing the googleapis SDK dependency.
 */
async function getGoogleJwt(clientEmail: string, privateKey: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const enc = (obj: unknown) =>
    Buffer.from(JSON.stringify(obj))
      .toString("base64url");

  const unsigned = `${enc(header)}.${enc(payload)}`;

  const signature = await crypto.sign(
    "sha256",
    Buffer.from(unsigned),
    privateKey
  );

  const jwt = `${unsigned}.${signature.toString("base64url")}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    throw new Error(`Google token exchange failed: ${tokenRes.status} ${errText}`);
  }

  const tokenJson = (await tokenRes.json()) as { access_token: string };
  return tokenJson.access_token;
}