import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { getLatestArticles, formatArticleDate } from "@/lib/articles";

export function ActualitesPreview() {
  const latest = getLatestArticles(3);

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <span className="inline-block text-xs font-semibold tracking-widest text-brand-600 uppercase mb-3">
              Actualités
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              L'entrepreneuriat vu par notre équipe
            </h2>
          </div>
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            Toutes les actualités <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {latest.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="group bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <span className="inline-block text-xs font-semibold text-brand-600 uppercase tracking-wide mb-3">
                {article.category}
              </span>
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors">
                {article.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1 line-clamp-3">
                {article.excerpt}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-100">
                <span>{formatArticleDate(article.publishedAt)}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {article.readingMinutes} min
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
