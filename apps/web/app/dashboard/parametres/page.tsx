import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { ParametresPage } from "@/components/dashboard/ParametresPage";

export const metadata: Metadata = { title: "Paramètres" };

export default async function SettingsPage() {
  const session = await auth();
  return (
    <ParametresPage
      user={{ name: session?.user?.name ?? null, email: session?.user?.email ?? null }}
    />
  );
}
