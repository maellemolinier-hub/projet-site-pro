import type { Metadata } from "next";
import { ProspectsDashboard } from "@/components/prospects/ProspectsDashboard";

export const metadata: Metadata = { title: "Prospection prédictive IA" };

export default function ProspectsPage() {
  return <ProspectsDashboard />;
}
