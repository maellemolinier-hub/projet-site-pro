import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { CapiaChatPanel } from "@/components/capia/CapiaChatPanel";
import { JsonLd } from "@/components/seo/JsonLd";
import { aiPersonas } from "@/lib/ai-personas";

const TITLE = "Capia, l'assistante IA de Cap Entreprendre France";
const DESCRIPTION =
  "Discutez avec Capia, l'assistante IA interactive de Cap Entreprendre France. Elle répond à vos questions sur nos services et nos tarifs — et c'est le genre d'assistant qu'on peut créer pour votre entreprise.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://cap-entreprendre-france.fr/capia" },
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESCRIPTION,
    url: "https://cap-entreprendre-france.fr/capia",
  },
};

const capiaSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Capia",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description: DESCRIPTION,
  provider: {
    "@type": "Organization",
    name: "Cap Entreprendre France",
  },
};

export default function CapiaPage() {
  return (
    <div className="min-h-screen bg-white">
      <JsonLd id="capia-app" data={capiaSchema} />
      <Navbar />

      <section className="pt-32 pb-16 bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-white/90 backdrop-blur-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Assistante IA · en ligne maintenant
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white text-balance">
            Rencontrez <span className="text-accent-400">Capia</span>
          </h1>
          <p className="text-lg text-white/70 max-w-xl mx-auto leading-relaxed">
            Capia répond à vos questions sur nos services et nos tarifs, en direct. Elle est
            aussi la preuve concrète de ce qu'on sait créer pour votre entreprise.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-5 gap-10 items-start">
          {/* Chat */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden h-[560px] flex flex-col">
            <CapiaChatPanel className="flex-1 min-h-0" />
          </div>

          {/* Info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Ce que Capia sait faire</h2>
              <ul className="space-y-3">
                {[
                  "Présenter nos services (identité visuelle, sites web, IA, communication…)",
                  "Détailler nos tarifs, sans jamais inventer un chiffre",
                  "Orienter vers un devis gratuit dès qu'un besoin se précise",
                  "Dire honnêtement quand une question dépasse son périmètre",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-brand-600 mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-brand-50 border border-brand-100 rounded-2xl p-6">
              <h3 className="font-semibold text-brand-900 mb-2">
                Et si votre entreprise avait son propre assistant ?
              </h3>
              <p className="text-sm text-brand-700 mb-4 leading-relaxed">
                Capia n'est qu'un exemple. On crée des assistants IA sur-mesure — nom, ton,
                connaissances propres à votre activité — qui répondent à vos clients pendant que
                vous travaillez.
              </p>
              <Link
                href="/services/assistants-ia-sur-mesure"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800"
              >
                Découvrir le service <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Other personas */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-block text-xs font-semibold tracking-widest text-brand-600 uppercase mb-3">
              La famille Capia
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              D'autres exemples d'assistants qu'on peut créer
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {aiPersonas.map((persona) => (
              <div
                key={persona.name}
                className="bg-gray-50 border border-gray-100 rounded-2xl p-6 space-y-3"
              >
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${persona.gradient} flex items-center justify-center`}
                >
                  <persona.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">{persona.name}</h3>
                <p className="text-xs text-gray-500">{persona.role}</p>
                <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                  {persona.idealFor}
                </p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/contact-entreprise"
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Demander mon assistant IA
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
