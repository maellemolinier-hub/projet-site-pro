import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { db } from "@immoexpert/db";
import { exchangeSlackOAuthCode } from "@/lib/lead-assistant/slack";

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET ?? "fallback-dev-secret");

function appUrl() {
  return process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}

function redirectUri() {
  return `${appUrl()}/api/lead-assistant/slack/callback`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const settingsUrl = new URL("/dashboard/assistant-ia/parametres", appUrl());

  if (!code || !state) {
    settingsUrl.searchParams.set("slack_error", "missing_code");
    return NextResponse.redirect(settingsUrl);
  }

  let userId: string;
  try {
    const { payload } = await jwtVerify(state, secret);
    userId = payload.userId as string;
  } catch {
    settingsUrl.searchParams.set("slack_error", "invalid_state");
    return NextResponse.redirect(settingsUrl);
  }

  try {
    const result = await exchangeSlackOAuthCode(code, redirectUri());

    await db.leadAssistantSettings.upsert({
      where: { userId },
      create: {
        userId,
        slackTeamId: result.teamId,
        slackTeamName: result.teamName,
        slackBotToken: result.botToken,
        slackUserId: result.authedUserId,
      },
      update: {
        slackTeamId: result.teamId,
        slackTeamName: result.teamName,
        slackBotToken: result.botToken,
        slackUserId: result.authedUserId,
      },
    });

    settingsUrl.searchParams.set("slack_connected", "1");
    return NextResponse.redirect(settingsUrl);
  } catch {
    settingsUrl.searchParams.set("slack_error", "exchange_failed");
    return NextResponse.redirect(settingsUrl);
  }
}
