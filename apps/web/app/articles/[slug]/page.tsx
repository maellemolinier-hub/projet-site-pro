import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { articles, getArticleBySlug, formatArticleDate } from "@/lib/articles";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};

  const url = `https://cap-entreprendre-france.fr/articles/${article.slug}`;

  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      url,
      publishedTime: article.publishedAt,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const related = articles.filter((a) => a.slug !== article.slug).slice(0, 2);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    author: { "@type": "Organization", name: "Cap Entreprendre France" },
    publisher: { "@type": "Organization", name: "Cap Entreprendre France" },
    mainEntityOfPage: `https://cap-entreprendre-france.fr/articles/${article.slug}`,
  };

  return (
    <div className="min-h-screen bg-white">
      <JsonLd id={`article-${article.slug}`} data={articleSchema} />
      <Navbar />

      <article className="pt-32 pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Toutes les actualités
          </Link>

          <span className="inline-block text-xs font-semibold text-brand-600 uppercase tracking-wide mb-3">
            {article.category}
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 text-balance">
            {article.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-400 mb-10 pb-10 border-b border-gray-100">
            <span>{formatArticleDate(article.publishedAt)}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {article.readingMinutes} min de lecture
            </span>
          </div>

          <div className="prose prose-gray max-w-none">
            {article.content.map((block, i) =>
              block.type === "h2" ? (
                <h2 key={i} className="text-xl font-bold text-gray-900 mt-8 mb-3">
                  {block.text}
                </h2>
              ) : (
                <p key={i} className="text-gray-700 leading-relaxed mb-4">
                  {block.text}
                </p>
              )
            )}
          </div>

          <div className="mt-12 p-6 bg-brand-50 border border-brand-100 rounded-2xl">
            <h3 className="font-semibold text-brand-900 mb-2">Un projet en tête ?</h3>
            <p className="text-sm text-brand-700 mb-4">
              Discutez-en avec Capia ou demandez directement un devis gratuit.
            </p>
            <Link
              href="/contact-entreprise"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800"
            >
              Demander un devis <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="py-16 bg-gray-50 border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">À lire aussi</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {related.map((a) => (
                <Link
                  key={a.slug}
                  href={`/articles/${a.slug}`}
                  className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow"
                >
                  <span className="text-xs font-semibold text-brand-600 uppercase tracking-wide">
                    {a.category}
                  </span>
                  <h3 className="font-semibold text-gray-900 mt-2 group-hover:text-brand-600 transition-colors">
                    {a.title}
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
