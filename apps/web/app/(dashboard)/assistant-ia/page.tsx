import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@immoexpert/db";
import { LeadAssistantDashboard } from "@/components/dashboard/LeadAssistantDashboard";

export const metadata: Metadata = { title: "Assistant IA — Prospection" };

export default async function AssistantIaPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [settings, conversations] = await Promise.all([
    db.leadAssistantSettings.findUnique({ where: { userId } }),
    db.leadConversation.findMany({
      where: { userId },
      orderBy: { lastMessageAt: "desc" },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
        proposals: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    }),
  ]);

  return <LeadAssistantDashboard settings={settings} conversations={conversations} />;
}
