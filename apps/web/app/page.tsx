import type { Metadata } from "next";
import { Navbar } from "@/components/marketing/Navbar";
import { Hero } from "@/components/marketing/Hero";
import { Features } from "@/components/marketing/Features";
import { AITeam } from "@/components/marketing/AITeam";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { VideoSection } from "@/components/marketing/VideoSection";
import { Experts } from "@/components/marketing/Experts";
import { Pricing } from "@/components/marketing/Pricing";
import { Testimonials } from "@/components/marketing/Testimonials";
import { ActualitesPreview } from "@/components/marketing/ActualitesPreview";
import { FAQ } from "@/components/marketing/FAQ";
import { CTA } from "@/components/marketing/CTA";
import { Footer } from "@/components/marketing/Footer";

const TITLE = "Cap Entreprendre France — Communication, sites intelligents & IA à Grasse";
const DESCRIPTION =
  "Identité visuelle, sites web intelligents et assistants IA sur-mesure comme Capia : l'agence qui digitalise les entrepreneurs à Grasse et partout en France. Devis gratuit sous 24h.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "https://cap-entreprendre-france.fr",
  },
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESCRIPTION,
    url: "https://cap-entreprendre-france.fr",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Cap Entreprendre France" }],
    locale: "fr_FR",
    siteName: "Cap Entreprendre France",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Features />
      <AITeam />
      <HowItWorks />
      <VideoSection
        title="Cap Entreprendre France en 2 minutes"
        subtitle="Comment on transforme votre identité, votre site et votre assistant IA en machine à convertir."
      />
      <Experts />
      <Pricing />
      <Testimonials />
      <ActualitesPreview />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
