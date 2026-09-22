import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/marketing/Reveal";

export function CTA() {
  return (
    <section className="py-24 bg-ink-950 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 50%, #4449e7 0%, transparent 60%),
                           radial-gradient(circle at 70% 50%, #7c96f8 0%, transparent 60%)`,
        }}
      />

      <Reveal className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <h2 className="text-3xl sm:text-5xl font-bold text-white text-balance">
          Vos concurrents regardent encore les prix sur LeBonCoin.
          <span className="text-brand-400"> Pas vous.</span>
        </h2>

        <p className="text-lg text-white/60 max-w-xl mx-auto">
          Rejoignez les 3 700+ professionnels qui utilisent déjà ImmoExpert
          pour rentrer plus de mandats, estimer juste et prospecter mieux.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/inscription"
            className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-8 py-4 rounded-full transition-all shadow-lg shadow-brand-600/30 hover:shadow-brand-600/50 text-lg"
          >
            Commencer gratuitement — 14 jours
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <p className="text-sm text-white/30">
          Sans carte bancaire · Sans engagement · Résiliation en 1 clic
        </p>
      </Reveal>
    </section>
  );
}
