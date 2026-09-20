import type { Metadata } from "next";
import { MapDashboard } from "@/components/map/MapDashboard";

export const metadata: Metadata = {
  title: "Carte des prix",
};

export default function CartePage() {
  return <MapDashboard />;
}
