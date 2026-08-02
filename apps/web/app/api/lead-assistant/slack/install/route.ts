import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { auth } from "@/lib/auth";

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET ?? "fallback-dev-secret");

const SLACK_SCOPES = ["chat:write", "im:write", "im:history", "channels:history", "channels:read"].join(",");

function redirectUri() {
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  return `${base}/api/lead-assistant/slack/callback`;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/connexion", process.env.NEXTAUTH_URL ?? "http://localhost:3000"));
  }

  const clientId = process.env.SLACK_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "Slack n'est pas configuré (SLACK_CLIENT_ID manquant)" }, { status: 503 });
  }

  const state = await new SignJWT({ userId: session.user.id })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(secret);

  const authorizeUrl = new URL("https://slack.com/oauth/v2/authorize");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("scope", SLACK_SCOPES);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri());
  authorizeUrl.searchParams.set("state", state);

  return NextResponse.redirect(authorizeUrl);
}
