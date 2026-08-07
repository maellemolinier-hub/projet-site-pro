import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { JsonLd } from "@/components/seo/JsonLd";
import { CapiaWidget } from "@/components/capia/CapiaWidget";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL = "https://cap-entreprendre-france.fr";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Cap Entreprendre France",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description:
    "Agence de communication et de digitalisation qui accompagne les entrepreneurs avec des sites web intelligents, une identité visuelle sur-mesure et des assistants IA comme Capia. Basée à Grasse.",
  sameAs: ["https://www.linkedin.com/company/cap-entreprendre-france"],
  address: {
    "@type": "PostalAddress",
    streetAddress: "3 chemin des Capucins",
    addressLocality: "Grasse",
    postalCode: "06130",
    addressCountry: "FR",
  },
  knowsAbout: [
    "Communication digitale",
    "Création de sites web",
    "Intelligence artificielle appliquée",
    "Identité visuelle",
    "Digitalisation des entreprises",
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  url: SITE_URL,
  name: "Cap Entreprendre France",
  inLanguage: "fr-FR",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/recherche?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const SITE_TITLE = "Cap Entreprendre France — Communication, sites intelligents & IA à Grasse";
const SITE_DESCRIPTION =
  "Identité visuelle, sites web intelligents et assistants IA sur-mesure comme Capia : l'agence qui digitalise les entrepreneurs à Grasse et partout en France. Devis gratuit sous 24h.";

export const metadata: Metadata = {
  title: {
    default: SITE_TITLE,
    template: "%s — Cap Entreprendre France",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "agence de communication",
    "studio graphique",
    "création de site web",
    "site web intelligent",
    "assistant IA entreprise",
    "chatbot IA PME",
    "digitalisation entrepreneur",
    "identité visuelle",
    "stratégie de marque",
    "communication à Grasse",
    "agence IA Grasse",
    "design graphique",
  ],
  authors: [{ name: "Cap Entreprendre France" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    siteName: "Cap Entreprendre France",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: SITE_URL,
  },
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
        <JsonLd id="organization" data={organizationSchema} />
        <JsonLd id="website" data={websiteSchema} />
        {children}
        <CapiaWidget />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}