import type { Metadata } from "next";
import { Navbar } from "@/components/marketing/Navbar";
import { Hero } from "@/components/marketing/Hero";
import { Features } from "@/components/marketing/Features";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { Pricing } from "@/components/marketing/Pricing";
import { Experts } from "@/components/marketing/Experts";
import { Testimonials } from "@/components/marketing/Testimonials";
import { CTA } from "@/components/marketing/CTA";
import { Footer } from "@/components/marketing/Footer";

export const metadata: Metadata = {
  title: "Cap Entreprendre France — Studio de communication & graphisme à Grasse",
  description:
    "Cap Entreprendre France vous accompagne dans la création, la gestion et le développement de votre entreprise. Identité visuelle, création de sites web et stratégie de marque à Grasse.",
  alternates: {
    canonical: "https://cap-entreprendre-france.fr",
  },
  openGraph: {
    type: "website",
    title: "Cap Entreprendre France — Studio de communication & graphisme à Grasse",
    description:
      "Cap Entreprendre France vous accompagne dans la création, la gestion et le développement de votre entreprise. Identité visuelle, création de sites web et stratégie de marque à Grasse.",
    url: "https://cap-entreprendre-france.fr",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Cap Entreprendre France" }],
    locale: "fr_FR",
    siteName: "Cap Entreprendre France",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cap Entreprendre France — Studio de communication & graphisme à Grasse",
    description:
      "Cap Entreprendre France vous accompagne dans la création, la gestion et le développement de votre entreprise. Identité visuelle, création de sites web et stratégie de marque à Grasse.",
    images: ["/og-image.png"],
  },
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Experts />
      <Pricing />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}