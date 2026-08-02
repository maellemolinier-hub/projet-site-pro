import { NextResponse } from "next/server";
import { db, type LeadMessage } from "@immoexpert/db";
import { verifySlackSignature, postSlackMessage, notifySlackOwner } from "@/lib/lead-assistant/slack";
import { scoreIntent, draftProposal } from "@/lib/lead-assistant/ai";

interface SlackMessageEvent {
  type: string;
  subtype?: string;
  bot_id?: string;
  channel: string;
  user?: string;
  text?: string;
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-slack-signature");
  const timestamp = req.headers.get("x-slack-request-timestamp");

  if (!verifySlackSignature(rawBody, timestamp, signature)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);

  if (payload.type === "url_verification") {
    return NextResponse.json({ challenge: payload.challenge });
  }

  if (payload.type !== "event_callback") {
    return NextResponse.json({ ok: true });
  }

  const event = payload.event as SlackMessageEvent;

  // On ignore les échos de nos propres messages et les événements non pertinents
  // (édition/suppression de message, messages système de canal, etc.)
  if (event.type !== "message" || event.subtype || event.bot_id || !event.text) {
    return NextResponse.json({ ok: true });
  }

  const teamId = payload.team_id as string;
  const settings = await db.leadAssistantSettings.findUnique({ where: { slackTeamId: teamId } });
  if (!settings?.slackBotToken) {
    return NextResponse.json({ ok: true });
  }

  const conversation = await db.leadConversation.upsert({
    where: {
      userId_channel_externalId: {
        userId: settings.userId,
        channel: "SLACK",
        externalId: event.channel,
      },
    },
    create: {
      userId: settings.userId,
      channel: "SLACK",
      externalId: event.channel,
      contactHandle: event.user ?? null,
      status: "QUALIFYING",
    },
    update: { lastMessageAt: new Date() },
  });

  await db.leadMessage.create({
    data: { conversationId: conversation.id, direction: "IN", body: event.text },
  });

  const history = await db.leadMessage.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "asc" },
    take: 30,
  });
  const transcript = history
    .map((m: LeadMessage) => `${m.direction === "IN" ? "Prospect" : "Toi"}: ${m.body}`)
    .join("\n");

  try {
    const result = await scoreIntent(settings.businessDescription ?? "", transcript);
    const wasAlreadyQualified = conversation.status !== "NEW" && conversation.status !== "QUALIFYING";
    const nowQualifies = result.score >= settings.minIntentScore;

    await db.leadConversation.update({
      where: { id: conversation.id },
      data: {
        intentScore: result.score,
        intentSummary: result.summary,
        contactName: result.contactName ?? conversation.contactName,
        status: nowQualifies ? (wasAlreadyQualified ? conversation.status : "QUALIFIED") : "QUALIFYING",
      },
    });

    if (nowQualifies && !wasAlreadyQualified) {
      const proposalText = await draftProposal(
        settings.businessDescription ?? "",
        transcript,
        settings.bookingLink
      );

      await db.leadProposal.create({
        data: { conversationId: conversation.id, content: proposalText, status: "SENT" },
      });

      await postSlackMessage(settings.slackBotToken, event.channel, proposalText);
      await db.leadMessage.create({
        data: { conversationId: conversation.id, direction: "OUT", body: proposalText },
      });
      await db.leadConversation.update({
        where: { id: conversation.id },
        data: { status: settings.bookingLink ? "MEETING_REQUESTED" : "PROPOSAL_SENT" },
      });

      if (settings.slackUserId) {
        const pct = Math.round(result.score * 100);
        await notifySlackOwner(
          settings.slackBotToken,
          settings.slackUserId,
          `🔥 Nouveau lead qualifié (${pct}%) sur Slack — ${result.summary}\nUne proposition a été envoyée automatiquement au prospect. Détail dans le tableau de bord.`
        ).catch(() => {
          // La notification propriétaire est secondaire : on ne bloque pas le flux si elle échoue.
        });
      }
    }
  } catch (err) {
    console.error("lead-assistant: échec de la qualification IA", err);
  }

  return NextResponse.json({ ok: true });
}
