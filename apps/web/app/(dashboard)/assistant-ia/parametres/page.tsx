import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@immoexpert/db";
import { LeadAssistantSettingsForm } from "@/components/dashboard/LeadAssistantSettingsForm";

export const metadata: Metadata = { title: "Paramètres — Assistant IA" };

export default async function AssistantIaSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ slack_connected?: string; slack_error?: string }>;
}) {
  const session = await auth();
  const userId = session!.user!.id!;
  const [settings, params] = await Promise.all([
    db.leadAssistantSettings.findUnique({ where: { userId } }),
    searchParams,
  ]);

  return (
    <LeadAssistantSettingsForm
      settings={settings}
      slackConnected={params.slack_connected === "1"}
      slackError={params.slack_error ?? null}
    />
  );
}
