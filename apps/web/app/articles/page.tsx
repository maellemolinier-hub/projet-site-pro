import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { articles, formatArticleDate } from "@/lib/articles";

const TITLE = "Actualités — Entrepreneuriat, digitalisation & IA";
const DESCRIPTION =
  "Conseils, décryptages et retours d'expérience sur la communication, la digitalisation et l'IA appliquée aux petites entreprises. Par Cap Entreprendre France.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://cap-entreprendre-france.fr/articles" },
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESCRIPTION,
    url: "https://cap-entreprendre-france.fr/articles",
  },
};

export default function ArticlesPage() {
  const sorted = [...articles].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-32 pb-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block text-xs font-semibold tracking-widest text-brand-600 uppercase mb-3">
            Actualités
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            L'entrepreneuriat, la digitalisation et l'IA{" "}
            <span className="gradient-text">expliqués sans jargon</span>
          </h1>
          <p className="text-gray-500 text-lg">
            Ce qu'on apprend en accompagnant des entrepreneurs, partagé pour vous faire gagner du
            temps.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((article) => (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}`}
                className="group bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <span className="inline-block text-xs font-semibold text-brand-600 uppercase tracking-wide mb-3">
                  {article.category}
                </span>
                <h2 className="font-semibold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors">
                  {article.title}
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-100">
                  <span>{formatArticleDate(article.publishedAt)}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {article.readingMinutes} min
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 mt-4 group-hover:gap-2.5 transition-all">
                  Lire l'article <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
