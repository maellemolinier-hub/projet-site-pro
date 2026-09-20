export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AGENT_CATALOG, getConfig } from "@immoexpert/agents";
import { PilotageDashboard } from "@/components/pilotage/PilotageDashboard";

export default async function PilotagePage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");

  const config = getConfig();
  const integrations = {
    anthropic: Boolean(config.anthropic.apiKey),
    gemini: Boolean(config.gemini.apiKey),
    make: Boolean(config.make.outboundWebhookUrl),
    googleSheets: Boolean(config.googleSheets.serviceAccountJson),
    hubspot: Boolean(config.hubspot.token),
    voice: Boolean(config.voice.apiKey),
  };

  return (
    <PilotageDashboard
      catalog={AGENT_CATALOG}
      integrations={integrations}
      userName={session.user.name ?? session.user.email ?? "Entrepreneur"}
    />
  );
}
