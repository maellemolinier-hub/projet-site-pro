import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { services } from "@/lib/offers";

const TITLE = "Nos services — Communication, sites web & IA sur-mesure";
const DESCRIPTION =
  "Identité visuelle, sites web intelligents, assistants IA, stratégie de marque et communication digitale : découvrez tous les services de Cap Entreprendre France.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://cap-entreprendre-france.fr/services" },
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESCRIPTION,
    url: "https://cap-entreprendre-france.fr/services",
  },
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-32 pb-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block text-xs font-semibold tracking-widest text-brand-600 uppercase mb-3">
            Nos services
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Un studio complet pour{" "}
            <span className="gradient-text">gérer votre image de A à Z</span>
          </h1>
          <p className="text-gray-500 text-lg">
            De l'identité visuelle à l'assistant IA sur-mesure, chaque service peut se combiner
            selon vos besoins et votre budget.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="group bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div
                className={`w-10 h-10 rounded-xl ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <service.icon className="w-5 h-5" />
              </div>
              <h2 className="font-semibold text-gray-900 mb-2">{service.title}</h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">
                {service.shortDescription}
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 group-hover:gap-2.5 transition-all">
                En savoir plus <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="py-16 bg-brand-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Pas sûr du service qu'il vous faut ?
          </h2>
          <p className="text-white/60">
            Discutez-en avec Capia ou demandez un devis gratuit — on vous oriente sans jargon.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/#tarifs"
              className="inline-flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Voir les tarifs
            </Link>
            <Link
              href="/contact-entreprise"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-xl transition-all border border-white/20"
            >
              Demander un devis
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
