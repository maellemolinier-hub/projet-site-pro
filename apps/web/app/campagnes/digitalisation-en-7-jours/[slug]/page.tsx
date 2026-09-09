import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { campaignDays, campaignSlug, getDayBySlug, baseUrl } from "../data";

type Params = { params: { slug: string } };

export function generateStaticParams() {
  return campaignDays.map((day) => ({ slug: day.slug }));
}

export function generateMetadata({ params }: Params): Metadata {
  const day = getDayBySlug(params.slug);
  if (!day) return {};

  const canonical = `${baseUrl}/campagnes/${campaignSlug}/${day.slug}`;

  return {
    title: day.titleTag,
    description: day.description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      locale: "fr_FR",
      url: canonical,
      siteName: "Cap Entreprendre France",
      title: day.title,
      description: day.description,
      images: [{ url: day.ogImage, width: 1200, height: 630, alt: day.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: day.title,
      description: day.description,
      images: [day.ogImage],
    },
    robots: { index: true, follow: true },
  };
}

function buildArticleJsonLd(slug: string) {
  const day = getDayBySlug(slug);
  if (!day) return null;

  const canonical = `${baseUrl}/campagnes/${campaignSlug}/${day.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: day.title,
    author: { "@type": "Organization", name: "Cap Entreprendre France" },
    publisher: { "@type": "Organization", name: "Cap Entreprendre France" },
    datePublished: day.datePublished,
    image: `${baseUrl}${day.ogImage}`,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
  };
}

function buildBreadcrumbJsonLd(slug: string) {
  const day = getDayBySlug(slug);
  if (!day) return null;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Campagnes", item: `${baseUrl}/campagnes` },
      {
        "@type": "ListItem",
        position: 3,
        name: "Digitalisation en 7 jours",
        item: `${baseUrl}/campagnes/${campaignSlug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: `Jour ${day.dayNumber}`,
        item: `${baseUrl}/campagnes/${campaignSlug}/${day.slug}`,
      },
    ],
  };
}

export default function CampaignDayPage({ params }: Params) {
  const day = getDayBySlug(params.slug);
  if (!day) notFound();

  const articleJsonLd = buildArticleJsonLd(params.slug);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(params.slug);

  return (
    <main className="min-h-screen bg-white">
      {articleJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
      )}
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}

      <div className="mx-auto max-w-3xl px-6 py-16">
        <nav className="mb-8 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-900">Accueil</Link>
          {" > "}
          <Link href="/campagnes" className="hover:text-gray-900">Campagnes</Link>
          {" > "}
          <Link
            href={`/campagnes/${campaignSlug}`}
            className="hover:text-gray-900"
          >
            Digitalisation en 7 jours
          </Link>
          {" > "}
          <span className="text-gray-900">Jour {day.dayNumber}</span>
        </nav>

        <article>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{day.title}</h1>
          <time
            className="text-sm text-gray-500 mb-8 block"
            dateTime={day.datePublished}
          >
            {new Date(day.datePublished).toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>

          <p className="text-lg text-gray-600 mb-8">{day.summary}</p>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed">{day.content}</p>
          </div>
        </article>

        <div className="mt-12 border-t border-gray-200 pt-8">
          <Link
            href={`/campagnes/${campaignSlug}`}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Retour à la campagne Digitalisation en 7 jours
          </Link>
        </div>
      </div>
    </main>
  );
}