import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AssistantsDashboard } from "@/components/dashboard/AssistantsDashboard";

export const metadata = {
  title: "Assistants IA — ImmoExpert",
};

export default async function AssistantsPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");

  return <AssistantsDashboard />;
}
