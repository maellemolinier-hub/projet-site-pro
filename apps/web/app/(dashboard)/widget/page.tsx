import type { Metadata } from "next";
import { WidgetIntegration } from "@/components/dashboard/WidgetIntegration";

export const metadata: Metadata = { title: "Mon widget — Intégration sur votre site" };

export default function WidgetPage() {
  return <WidgetIntegration />;
}
