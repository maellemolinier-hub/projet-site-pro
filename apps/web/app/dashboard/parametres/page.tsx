import type { Metadata } from "next";
import { ParametresPage } from "@/components/dashboard/ParametresPage";

export const metadata: Metadata = { title: "Paramètres" };

export default function SettingsPage() {
  return <ParametresPage />;
}
