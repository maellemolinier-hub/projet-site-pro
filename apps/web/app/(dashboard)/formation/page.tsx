import type { Metadata } from "next";
import { FormationDashboard } from "@/components/formation/FormationDashboard";

export const metadata: Metadata = { title: "Formation Expert Valeur Vénale" };

export default function FormationPage() {
  return <FormationDashboard />;
}
