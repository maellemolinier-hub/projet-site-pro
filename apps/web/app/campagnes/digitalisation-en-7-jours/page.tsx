import type { Metadata } from "next";
import {
  campaignDays,
  campaignSlug,
  campaignIndexTitle,
  campaignIndexDescription,
  baseUrl,
} from "./data";
import Link from "next/link";

export const metadata: Metadata = {
  title: campaignIndexTitle,
  description: campaignIndexDescription,
  alternates: {
    canonical: `${baseUrl}/campagnes/${campaignSlug}`,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: `${baseUrl}/campagnes/${campaignSlug}`,
    siteName: "Cap Entreprendre France",
    title: campaignIndexTitle,
    description: campaignIndexDescription,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Cap Entreprendre France" }],
  },
  twitter: {
    card: "summary_large_image",
    title: campaignIndexTitle,
    description: campaignIndexDescription,
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Cap Entreprendre France",
  url: baseUrl,
  logo: `${baseUrl}/logo.png`,
  image: `${baseUrl}/og-image.png`,
  description:
    "Agence de communication et studio graphique à Grasse. Accompagnement des entrepreneurs dans leur digitalisation.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "3 chemin des Capucins",
    addressLocality: "Grasse",
    postalCode: "06130",
    addressCountry: "FR",
  },
  areaServed: { "@type": "City", name: "Grasse" },
  sameAs: ["https://www.linkedin.com/company/cap-entreprendre-france"],
};

export default function CampaignIndexPage() {
  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <div className="mx-auto max-w-3xl px-6 py-16">
        <nav className="mb-8 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-900">Accueil</Link>
          {" > "}
          <span>Campagnes</span>
          {" > "}
          <span className="text-gray-900">Digitalisation en 7 jours</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">Digitalisation en 7 jours</h1>
        <p className="text-lg text-gray-600 mb-12">
          Site web sur-mesure + fiche Google Business optimisée. Pour artisans et TPE
          à Grasse et en PACA. Coût unique, délai garanti.
        </p>

        <div className="space-y-6">
          {campaignDays.map((day) => (
            <article
              key={day.slug}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {day.title}
              </h2>
              <p className="text-gray-600 mb-4">{day.summary}</p>
              <Link
                href={`/campagnes/${campaignSlug}/${day.slug}`}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Lire le détail →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}