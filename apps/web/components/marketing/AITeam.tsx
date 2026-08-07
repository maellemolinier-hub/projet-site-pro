import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { aiPersonas } from "@/lib/ai-personas";

export function AITeam() {
  return (
    <section id="nos-ia" className="py-24 bg-brand-950 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 20%, #7c96f8 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, #fb923c 0%, transparent 50%)`,
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold tracking-widest text-accent-400 uppercase mb-3">
            Nos IA ont un nom
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Des assistants IA <span className="text-accent-400">humains</span>, pas des robots anonymes
          </h2>
          <p className="text-white/60 text-lg leading-relaxed">
            Capia, qui vous parle sur ce site, est un exemple de ce qu'on sait créer. Chaque
            assistant qu'on conçoit a un nom, un rôle et un ton pensés pour votre activité et vos
            clients.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {aiPersonas.map((persona) => (
            <div
              key={persona.name}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 hover:bg-white/10 transition-colors"
            >
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${persona.gradient} flex items-center justify-center shadow-lg`}
              >
                <persona.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white">{persona.name}</h3>
                  {persona.isCapia && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-accent-400 bg-accent-400/10 rounded-full px-2 py-0.5">
                      C'est elle !
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/50">{persona.role}</p>
              </div>
              <p className="text-sm text-white/70 leading-relaxed">{persona.description}</p>
              <p className="text-xs text-white/40 pt-2 border-t border-white/10">
                Idéal pour : {persona.idealFor}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/capia"
            className="inline-flex items-center gap-2 bg-white text-brand-950 font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors"
          >
            Discuter avec Capia
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/services/assistants-ia-sur-mesure"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-xl transition-all border border-white/20"
          >
            Créer mon propre assistant IA
          </Link>
        </div>
      </div>
    </section>
  );
}
