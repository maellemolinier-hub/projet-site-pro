import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Package } from "lucide-react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { services, getServiceBySlug } from "@/lib/offers";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};

  const url = `https://cap-entreprendre-france.fr/services/${service.slug}`;

  return {
    title: service.title,
    description: service.shortDescription,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title: `${service.title} — Cap Entreprendre France`,
      description: service.shortDescription,
      url,
    },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const related = services.filter((s) => s.slug !== service.slug).slice(0, 3);

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.description,
    provider: { "@type": "Organization", name: "Cap Entreprendre France" },
    areaServed: "FR",
  };

  return (
    <div className="min-h-screen bg-white">
      <JsonLd id={`service-${service.slug}`} data={serviceSchema} />
      <Navbar />

      <section className="pt-32 pb-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Tous les services
          </Link>

          <div
            className={`w-12 h-12 rounded-2xl ${service.color} flex items-center justify-center mb-6`}
          >
            <service.icon className="w-6 h-6" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 text-balance">
            {service.title}
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">{service.description}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bénéfices concrets</h2>
            <ul className="space-y-3">
              {service.benefits.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand-600 mt-0.5 shrink-0" />
                  <span className="text-gray-700 text-sm">{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ce que vous recevez</h2>
            <ul className="grid sm:grid-cols-2 gap-3">
              {service.deliverables.map((d) => (
                <li
                  key={d}
                  className="flex items-start gap-3 bg-gray-50 border border-gray-100 rounded-xl p-3"
                >
                  <Package className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-700">{d}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-brand-50 border border-brand-100 rounded-2xl p-6">
            <p className="text-sm font-semibold text-brand-900 mb-1">Idéal pour</p>
            <p className="text-brand-700 text-sm">{service.idealFor}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/#tarifs"
              className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors"
            >
              Voir les tarifs qui incluent ce service
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact-entreprise"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-900 font-semibold px-6 py-3.5 rounded-xl transition-colors border border-gray-200"
            >
              Demander un devis gratuit
            </Link>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="py-16 bg-gray-50 border-t border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Vous pourriez aussi aimer</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {related.map((s) => (
                <Link
                  key={s.slug}
                  href={`/services/${s.slug}`}
                  className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow"
                >
                  <div
                    className={`w-9 h-9 rounded-lg ${s.color} flex items-center justify-center mb-3`}
                  >
                    <s.icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm group-hover:text-brand-600 transition-colors">
                    {s.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
