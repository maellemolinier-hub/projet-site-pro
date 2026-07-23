import type { Metadata } from "next";
import { OffersShowcase } from "@/components/offres/OffersShowcase";

export const metadata: Metadata = {
  title: "Nos offres — CAP Entreprendre France",
  description:
    "Sites web, assistants IA, assistant vocal, SEO, visuels, prospection, automatisation : CAP Entreprendre France diagnostique les problèmes de votre entreprise et les résout via le digital.",
};

export default function OffresPage() {
  return <OffersShowcase />;
}
