import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { JsonLd } from "@/components/seo/JsonLd";

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
    "Agence de communication et studio graphique accompagnant les entrepreneurs. Basé à Grasse.",
  sameAs: ["https://www.linkedin.com/company/cap-entreprendre-france"],
  address: {
    "@type": "PostalAddress",
    streetAddress: "3 chemin des Capucins",
    addressLocality: "Grasse",
    postalCode: "06130",
    addressCountry: "FR",
  },
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

export const metadata: Metadata = {
  title: {
    default: "Cap Entreprendre France — Studio de communication & graphisme à Grasse",
    template: "%s — Cap Entreprendre France",
  },
  description:
    "Cap Entreprendre France vous accompagne dans la création, la gestion et le développement de votre entreprise. Identité visuelle, création de sites web et stratégie de marque à Grasse.",
  keywords: [
    "agence de communication",
    "studio graphique",
    "création de site web",
    "identité visuelle",
    "stratégie de marque",
    "communication à Grasse",
    "design graphique",
  ],
  authors: [{ name: "Cap Entreprendre France" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    siteName: "Cap Entreprendre France",
    title: "Cap Entreprendre France — Studio de communication & graphisme à Grasse",
    description:
      "Cap Entreprendre France vous accompagne dans la création, la gestion et le développement de votre entreprise. Identité visuelle, création de sites web et stratégie de marque à Grasse.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cap Entreprendre France — Studio de communication & graphisme à Grasse",
    description:
      "Cap Entreprendre France vous accompagne dans la création, la gestion et le développement de votre entreprise. Identité visuelle, création de sites web et stratégie de marque à Grasse.",
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
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}