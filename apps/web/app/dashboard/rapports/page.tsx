import type { Metadata } from "next";
import { RapportsDashboard } from "@/components/dashboard/RapportsDashboard";

export const metadata: Metadata = { title: "Rapports de marché" };

export default function RapportsPage() {
  return <RapportsDashboard />;
}
