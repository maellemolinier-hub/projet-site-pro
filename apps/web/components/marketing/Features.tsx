import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { services } from "@/lib/offers";

export function Features() {
  return (
    <section id="fonctionnalites" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold tracking-widest text-brand-600 uppercase mb-3">
            Nos services
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Tout ce dont votre entreprise{" "}
            <span className="gradient-text">a besoin pour communiquer</span>
          </h2>
          <p className="text-gray-500 text-lg">
            Un studio complet pour gérer votre image de A à Z. De l'identité
            visuelle à l'IA sur-mesure, on couvre tous vos besoins.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 group"
            >
              {service.slug === "assistants-ia-sur-mesure" && (
                <span className="absolute top-4 right-4 text-[10px] font-semibold uppercase tracking-wide text-accent-600 bg-accent-50 rounded-full px-2 py-0.5">
                  Nouveau
                </span>
              )}
              <div
                className={`w-10 h-10 rounded-xl ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <service.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{service.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {service.shortDescription}
              </p>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            Voir le détail de tous nos services <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
