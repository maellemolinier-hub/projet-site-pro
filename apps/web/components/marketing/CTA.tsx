import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="py-24 bg-brand-950 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 50%, #7c96f8 0%, transparent 60%),
                           radial-gradient(circle at 70% 50%, #fb923c 0%, transparent 60%)`,
        }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <h2 className="text-3xl sm:text-5xl font-bold text-white text-balance">
          Votre marque mérite une communication qui se voit.
          <span className="text-accent-400"> On s'en occupe.</span>
        </h2>

        <p className="text-lg text-white/60 max-w-xl mx-auto">
          Rejoignez les entrepreneurs qui nous font confiance pour leur identité visuelle,
          leur site web et leur stratégie de marque à Grasse.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/inscription"
            className="inline-flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg shadow-accent-500/30 hover:shadow-accent-500/50 text-lg"
          >
            Démarrer mon projet
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <p className="text-sm text-white/30">
          Devis gratuit · Sans engagement · Réponse sous 24h
        </p>
      </div>
    </section>
  );
}