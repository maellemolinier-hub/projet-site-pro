import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { AssistantWidget } from "@/components/assistant/AssistantWidget";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CAP Entreprendre France — L'IA qui résout les problèmes de votre entreprise",
    template: "%s | CAP Entreprendre France",
  },
  description:
    "CAP Entreprendre France déploie une équipe d'agents IA autonomes qui créent votre site, vos assistants (dont vocal), votre visibilité et votre prospection. Diagnostic gratuit avec Capia.",
  keywords: [
    "agents IA", "assistant IA", "création site web", "assistant vocal",
    "prospection IA", "SEO", "automatisation", "IA entreprise", "CAP Entreprendre France",
  ],
  authors: [{ name: "CAP Entreprendre France" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "CAP Entreprendre France",
    title: "CAP Entreprendre France — L'IA qui résout les problèmes de votre entreprise",
    description:
      "Une équipe d'agents IA autonomes au service de votre croissance. Diagnostic gratuit avec Capia.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#4449e7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <body>
        {children}
        <AssistantWidget />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
