import type { Metadata } from "next";
import { ExpertProfileManager } from "@/components/dashboard/ExpertProfileManager";

export const metadata: Metadata = { title: "Mon profil Expert certifié" };

export default function ExpertPage() {
  return <ExpertProfileManager />;
}
