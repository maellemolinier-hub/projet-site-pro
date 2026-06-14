import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { frFR } from "@clerk/localizations";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ImmoExpert — Prix de l'immobilier rue par rue, en temps réel",
    template: "%s | ImmoExpert",
  },
  description:
    "La plateforme de référence pour les professionnels de l'immobilier. Visualisez les prix rue par rue, prospectez avec l'IA, et devenez Expert Certifié en Valeur Vénale.",
  keywords: [
    "immobilier",
    "prix immobilier",
    "estimation immobilière",
    "valeur vénale",
    "agent immobilier",
    "conseiller immobilier",
    "carte prix immobilier",
    "prospection immobilière",
  ],
  authors: [{ name: "ImmoExpert" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://immoexpert.fr",
    siteName: "ImmoExpert",
    title: "ImmoExpert — Prix de l'immobilier rue par rue, en temps réel",
    description:
      "La plateforme de référence pour les professionnels de l'immobilier.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ImmoExpert",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ImmoExpert — Prix de l'immobilier rue par rue",
    description: "La plateforme de référence pour les pros de l'immobilier.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  themeColor: "#4449e7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider localization={frFR}>
      <html lang="fr" className={inter.variable}>
        <body>
          {children}
          <Toaster richColors position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
