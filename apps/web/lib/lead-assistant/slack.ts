import crypto from "crypto";

const SLACK_API_URL = "https://slack.com/api";

/**
 * Vérifie qu'une requête webhook provient bien de Slack (signature v0).
 * https://api.slack.com/authentication/verifying-requests-from-slack
 */
export function verifySlackSignature(rawBody: string, timestamp: string | null, signature: string | null): boolean {
  const signingSecret = process.env.SLACK_SIGNING_SECRET;
  if (!signingSecret || !timestamp || !signature) return false;

  // Anti-replay : refuse les requêtes vieilles de plus de 5 minutes.
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (Number.isNaN(age) || age > 60 * 5) return false;

  const base = `v0:${timestamp}:${rawBody}`;
  const computed = `v0=${crypto.createHmac("sha256", signingSecret).update(base).digest("hex")}`;

  const a = Buffer.from(computed);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export interface SlackOAuthResult {
  teamId: string;
  teamName: string;
  botToken: string;
  authedUserId: string;
}

export async function exchangeSlackOAuthCode(code: string, redirectUri: string): Promise<SlackOAuthResult> {
  const res = await fetch(`${SLACK_API_URL}/oauth.v2.access`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.SLACK_CLIENT_ID || "",
      client_secret: process.env.SLACK_CLIENT_SECRET || "",
      code,
      redirect_uri: redirectUri,
    }),
  });

  const data = await res.json();
  if (!data.ok) throw new Error(`Slack OAuth error: ${data.error}`);

  return {
    teamId: data.team.id,
    teamName: data.team.name,
    botToken: data.access_token,
    authedUserId: data.authed_user?.id,
  };
}

export async function postSlackMessage(botToken: string, channel: string, text: string): Promise<void> {
  const res = await fetch(`${SLACK_API_URL}/chat.postMessage`, {
    method: "POST",
    headers: {
      "content-type": "application/json; charset=utf-8",
      authorization: `Bearer ${botToken}`,
    },
    body: JSON.stringify({ channel, text }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(`Slack postMessage error: ${data.error}`);
}

/** Ouvre (ou récupère) le canal de DM avec un utilisateur Slack et renvoie son id. */
export async function openSlackDm(botToken: string, userId: string): Promise<string> {
  const res = await fetch(`${SLACK_API_URL}/conversations.open`, {
    method: "POST",
    headers: {
      "content-type": "application/json; charset=utf-8",
      authorization: `Bearer ${botToken}`,
    },
    body: JSON.stringify({ users: userId }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(`Slack conversations.open error: ${data.error}`);
  return data.channel.id;
}

export async function notifySlackOwner(botToken: string, ownerSlackUserId: string, text: string): Promise<void> {
  const dmChannel = await openSlackDm(botToken, ownerSlackUserId);
  await postSlackMessage(botToken, dmChannel, text);
}
