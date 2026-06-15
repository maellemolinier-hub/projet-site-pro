import { Navbar } from "@/components/marketing/Navbar";
import { Hero } from "@/components/marketing/Hero";
import { Features } from "@/components/marketing/Features";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { LeadCapture } from "@/components/marketing/LeadCapture";
import { Pricing } from "@/components/marketing/Pricing";
import { Experts } from "@/components/marketing/Experts";
import { Testimonials } from "@/components/marketing/Testimonials";
import { CTA } from "@/components/marketing/CTA";
import { Footer } from "@/components/marketing/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <LeadCapture />
      <Experts />
      <Pricing />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}
