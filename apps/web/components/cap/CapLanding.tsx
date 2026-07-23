"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  MessageCircle,
  Stethoscope,
  Code2,
  TrendingUp,
  Clapperboard,
  Target,
  PhoneCall,
  Headphones,
  Repeat,
  Bot,
  Check,
  Zap,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { AgentCatalogEntry } from "@immoexpert/agents";
import { OFFERS } from "@/lib/offers";

const ICONS: Record<string, LucideIcon> = {
  stethoscope: Stethoscope,
  code: Code2,
  "trending-up": TrendingUp,
  clapperboard: Clapperboard,
  target: Target,
  "phone-call": PhoneCall,
  headphones: Headphones,
  repeat: Repeat,
};

function openCapia() {
  window.dispatchEvent(new Event("open-capia"));
}

const TYPED = "Décrivez-moi votre activité — je diagnostique vos blocages et je vous propose LA solution.";

export function CapLanding({ catalog }: { catalog: AgentCatalogEntry[] }) {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(TYPED.slice(0, i));
      if (i >= TYPED.length) clearInterval(id);
    }, 28);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0a1626] text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="relative z-20 max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-400 flex items-center justify-center font-black text-sm">
            C
          </div>
          <span className="font-bold tracking-tight">
            CAP <span className="text-white/50 font-medium">Entreprendre France</span>
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-6 text-sm text-white/70">
          <a href="#agents" className="hover:text-white transition">Agents</a>
          <Link href="/offres" className="hover:text-white transition">Offres</Link>
          <Link href="/connexion" className="hover:text-white transition">Connexion</Link>
          <button
            onClick={openCapia}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 transition font-medium"
          >
            Parler à Capia
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center">
        {/* NeuralBackground is injected by the server wrapper via children slot */}
        <NeuralLayer />
        <div className="absolute -top-40 -right-40 w-[36rem] h-[36rem] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[36rem] h-[36rem] rounded-full bg-emerald-500/20 blur-[120px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center py-16">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-xs font-medium mb-6"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              Agents IA autonomes · comme personne n'en a jamais vu
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-4xl sm:text-6xl font-bold leading-[1.05] tracking-tight"
            >
              Votre entreprise a un problème.
              <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                Notre IA le règle.
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="mt-6 text-lg text-white/60 max-w-xl"
            >
              CAP Entreprendre France déploie une équipe d'agents IA qui créent votre site, vos
              assistants, votre visibilité et votre prospection. Vous pilotez, l'IA exécute.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.19 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <button
                onClick={openCapia}
                className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 font-semibold hover:shadow-[0_0_40px_-8px_rgba(52,211,153,0.6)] transition"
              >
                <MessageCircle className="w-4 h-4" />
                Diagnostic gratuit avec Capia
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
              </button>
              <Link
                href="/offres"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 font-semibold hover:bg-white/15 transition"
              >
                Voir les offres
              </Link>
            </motion.div>
          </div>

          {/* Capia qui vient parler */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 120, damping: 16 }}
            className="relative mx-auto"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-emerald-400 blur-2xl opacity-40 animate-pulse" />
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full overflow-hidden ring-4 ring-white/10 shadow-2xl"
              >
                <Image src="/capia-avatar.png" alt="Capia" fill sizes="320px" className="object-cover" priority />
              </motion.div>
              {/* Speech bubble */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute -bottom-6 -left-6 sm:-left-16 max-w-[16rem] bg-white text-slate-800 rounded-2xl rounded-bl-sm p-4 shadow-xl"
              >
                <p className="text-xs font-semibold text-slate-900 flex items-center gap-1.5 mb-1">
                  Capia
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </p>
                <p className="text-sm leading-relaxed min-h-[3.5rem]">
                  {typed}
                  <span className="inline-block w-1 h-4 bg-slate-400 ml-0.5 animate-pulse align-middle" />
                </p>
                <button
                  onClick={openCapia}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  Discuter maintenant <ArrowRight className="w-3 h-3" />
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Differentiators */}
      <section className="relative z-10 border-y border-white/10 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 py-12 grid sm:grid-cols-3 gap-6">
          <Pillar icon={Stethoscope} title="On diagnostique" text="On identifie ce qui vous fait perdre des clients." />
          <Pillar icon={Zap} title="L'IA exécute" text="Des agents autonomes produisent vos livrables." />
          <Pillar icon={ShieldCheck} title="Vous êtes propriétaire" text="Livraison clé en main, directement chez vous." />
        </div>
      </section>

      {/* Agents */}
      <section id="agents" className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold">Votre équipe d'agents IA</h2>
            <p className="text-white/50 mt-3">8 spécialistes autonomes, branchés ensemble, qui travaillent pour vous.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {catalog.map((agent, i) => {
              const Icon = ICONS[agent.icon] ?? Bot;
              return (
                <motion.div
                  key={agent.role}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: (i % 4) * 0.06 }}
                  whileHover={{ y: -6 }}
                  className="group relative rounded-2xl border border-white/10 bg-white/[0.03] p-5 overflow-hidden"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-blue-500/10 to-emerald-500/10" />
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-emerald-400/20 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-emerald-300" />
                    </div>
                    <p className="font-semibold">{agent.label}</p>
                    <p className="text-sm text-white/50 mt-1 leading-relaxed">{agent.tagline}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Offers preview */}
      <section className="relative z-10 py-20 bg-white/[0.02] border-y border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold">Nos offres</h2>
              <p className="text-white/50 mt-2">Des solutions concrètes, prêtes à générer du chiffre.</p>
            </div>
            <Link href="/offres" className="hidden sm:inline-flex items-center gap-1 text-sm text-emerald-300 hover:text-emerald-200">
              Tout voir <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {OFFERS.slice(0, 6).map((offer, i) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 3) * 0.06 }}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <p className="font-semibold">{offer.name}</p>
                <p className="text-sm text-white/50 mt-1">{offer.tagline}</p>
                <ul className="mt-3 space-y-1.5">
                  {offer.outcomes.slice(0, 3).map((o) => (
                    <li key={o} className="flex items-center gap-2 text-sm text-white/60">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" /> {o}
                    </li>
                  ))}
                </ul>
                {offer.priceHint && (
                  <p className="mt-4 text-sm font-semibold text-white">{offer.priceHint}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 py-24">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-14">Comment ça marche</h2>
          <div className="space-y-8">
            {[
              { n: "1", t: "Vous parlez à Capia", d: "Elle diagnostique votre problème en quelques questions." },
              { n: "2", t: "Les agents produisent", d: "Site, contenus, visuels, prospection : l'IA exécute la commande." },
              { n: "3", t: "Vous recevez, clé en main", d: "Votre produit fini est livré directement, vous en êtes propriétaire." },
            ].map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-5"
              >
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center font-bold text-lg">
                  {s.n}
                </div>
                <div>
                  <p className="font-semibold text-lg">{s.t}</p>
                  <p className="text-white/50">{s.d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative rounded-3xl overflow-hidden p-10 sm:p-14 text-center border border-white/10 bg-gradient-to-br from-blue-600/20 to-emerald-500/20">
            <h2 className="text-3xl sm:text-4xl font-bold">Prête à passer devant vos concurrents ?</h2>
            <p className="text-white/60 mt-3 max-w-xl mx-auto">
              Un diagnostic gratuit avec Capia, et vous saurez exactement quoi faire.
            </p>
            <button
              onClick={openCapia}
              className="mt-8 inline-flex items-center gap-2 px-7 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 font-semibold hover:shadow-[0_0_50px_-8px_rgba(52,211,153,0.7)] transition"
            >
              <MessageCircle className="w-5 h-5" /> Lancer mon diagnostic gratuit
            </button>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/40">
          <span>© {new Date().getFullYear()} CAP Entreprendre France</span>
          <div className="flex gap-6">
            <Link href="/offres" className="hover:text-white/70">Offres</Link>
            <Link href="/connexion" className="hover:text-white/70">Connexion</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Pillar({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 shrink-0 rounded-xl bg-white/5 flex items-center justify-center">
        <Icon className="w-5 h-5 text-emerald-300" />
      </div>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-white/50 mt-0.5">{text}</p>
      </div>
    </div>
  );
}

function NeuralLayer() {
  // Dynamically imported to keep the canvas client-only.
  const [Comp, setComp] = useState<null | React.ComponentType<{ className?: string }>>(null);
  useEffect(() => {
    let mounted = true;
    import("./NeuralBackground").then((m) => {
      if (mounted) setComp(() => m.NeuralBackground);
    });
    return () => {
      mounted = false;
    };
  }, []);
  if (!Comp) return null;
  return <Comp className="absolute inset-0 w-full h-full opacity-70" />;
}
