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
  Rocket,
  Crown,
  Star,
  Quote,
  type LucideIcon,
} from "lucide-react";
import type { AgentCatalogEntry } from "@immoexpert/agents";
import { PACKS } from "@/lib/packs";

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

const PACK_ICONS: Record<string, LucideIcon> = {
  decollage: Rocket,
  croissance: Star,
  domination: Crown,
};

function openCapia() {
  window.dispatchEvent(new Event("open-capia"));
}

const MESSAGES = [
  "Bonjour, moi c'est Capia 👋 Dites-moi votre métier.",
  "Je diagnostique vos blocages en 2 minutes, gratuitement.",
  "Et je vous propose LA solution pour vendre plus.",
];

export function CapLanding({ catalog }: { catalog: AgentCatalogEntry[] }) {
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    setTyped("");
    let i = 0;
    const msg = MESSAGES[idx];
    const t = setInterval(() => {
      i += 1;
      setTyped(msg.slice(0, i));
      if (i >= msg.length) clearInterval(t);
    }, 30);
    return () => clearInterval(t);
  }, [idx]);

  useEffect(() => {
    const r = setInterval(() => setIdx((v) => (v + 1) % MESSAGES.length), 4800);
    return () => clearInterval(r);
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
          <a href="#packs" className="hover:text-white transition">Offres</a>
          <a href="#agents" className="hover:text-white transition">Agents</a>
          <Link href="/connexion" className="hover:text-white transition">Connexion</Link>
          <button
            onClick={openCapia}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 transition font-medium"
          >
            Parler à Capia
          </button>
        </div>
      </nav>

      {/* Hero — Capia super-héroïne au centre */}
      <section className="relative min-h-[94vh] flex flex-col items-center justify-center text-center">
        <NeuralLayer />
        <div className="absolute top-10 -right-40 w-[36rem] h-[36rem] rounded-full bg-blue-600/25 blur-[130px]" />
        <div className="absolute bottom-0 -left-40 w-[36rem] h-[36rem] rounded-full bg-emerald-500/25 blur-[130px]" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-6 pb-20">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-xs font-medium mb-10"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            L'IA au service des entrepreneurs · comme personne n'en fait
          </motion.span>

          {/* Capia entrance — super-héroïne en pied */}
          <div className="relative flex justify-center mb-4">
            {/* power burst */}
            <motion.span
              initial={{ scale: 0, opacity: 0.7 }}
              animate={{ scale: 3.4, opacity: 0 }}
              transition={{ duration: 1.4, delay: 0.15, ease: "easeOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-gradient-to-br from-blue-400 to-emerald-400"
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-br from-blue-500/30 to-emerald-400/30 blur-3xl animate-pulse" />
            <motion.div
              initial={{ opacity: 0, scale: 0.3, y: 160 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 80, damping: 14, delay: 0.1 }}
              className="relative"
            >
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative h-[300px] sm:h-[420px] w-[225px] sm:w-[315px]"
              >
                <Image
                  src="/capia-hero.png"
                  alt="Capia, l'assistante IA de CAP Entreprendre France"
                  fill
                  sizes="(max-width: 640px) 225px, 315px"
                  className="object-contain drop-shadow-[0_20px_50px_rgba(52,211,153,0.35)]"
                  priority
                />
              </motion.div>
            </motion.div>
          </div>

          {/* Capia parle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mx-auto max-w-md bg-white text-slate-800 rounded-2xl px-5 py-3 shadow-xl mb-8"
          >
            <p className="text-sm leading-relaxed min-h-[2.5rem] flex items-center justify-center">
              {typed}
              <span className="inline-block w-1 h-4 bg-slate-400 ml-0.5 animate-pulse align-middle" />
            </p>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-4xl sm:text-6xl font-bold leading-[1.05] tracking-tight"
          >
            Votre entreprise a un problème.
            <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
              Capia et ses agents le règlent.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className="mt-6 text-lg text-white/60 max-w-2xl mx-auto"
          >
            Site, assistants IA, visibilité, prospection : une équipe d'agents autonomes exécute,
            vous encaissez. Pensé par des entrepreneurs, propulsé par l'IA.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-9 flex flex-wrap justify-center gap-3"
          >
            <button
              onClick={openCapia}
              className="group inline-flex items-center gap-2 px-7 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 font-semibold hover:shadow-[0_0_50px_-8px_rgba(52,211,153,0.7)] transition"
            >
              <MessageCircle className="w-5 h-5" />
              Diagnostic gratuit avec Capia
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
            </button>
            <a
              href="#packs"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl bg-white/10 font-semibold hover:bg-white/15 transition"
            >
              Voir les offres
            </a>
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

      {/* PACKS */}
      <section id="packs" className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold">Des offres qui changent la donne</h2>
            <p className="text-white/50 mt-3">Choisissez votre niveau d'ambition. On s'occupe du reste.</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-6 items-stretch">
            {PACKS.map((pack, i) => {
              const Icon = PACK_ICONS[pack.id] ?? Rocket;
              return (
                <motion.div
                  key={pack.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ delay: i * 0.1 }}
                  className={
                    "relative rounded-3xl p-7 flex flex-col " +
                    (pack.highlighted
                      ? "bg-gradient-to-b from-blue-600/20 to-emerald-500/10 border-2 border-emerald-400/40 shadow-[0_0_60px_-15px_rgba(52,211,153,0.5)] lg:-mt-4 lg:mb-4"
                      : "bg-white/[0.03] border border-white/10")
                  }
                >
                  {pack.badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 text-xs font-bold text-[#0a1626]">
                      {pack.badge}
                    </span>
                  )}
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-emerald-400/20 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-emerald-300" />
                  </div>
                  <h3 className="text-xl font-bold">{pack.name}</h3>
                  <p className="text-sm text-white/50 mt-1 min-h-[2.5rem]">{pack.punchline}</p>
                  <div className="mt-4 flex items-end gap-1">
                    <span className="text-3xl font-bold">{pack.price}</span>
                    {pack.priceNote && <span className="text-sm text-white/40 mb-1">/ {pack.priceNote}</span>}
                  </div>
                  <ul className="mt-5 space-y-2.5 flex-1">
                    {pack.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-white/70">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={openCapia}
                    className={
                      "mt-6 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-semibold transition " +
                      (pack.highlighted
                        ? "bg-gradient-to-r from-blue-600 to-emerald-500 hover:opacity-90"
                        : "bg-white/10 hover:bg-white/15")
                    }
                  >
                    Choisir {pack.name} <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })}
          </div>
          <p className="text-center text-white/40 text-sm mt-8">
            Un besoin précis ? <button onClick={openCapia} className="text-emerald-300 hover:text-emerald-200 font-medium">Demandez un devis sur-mesure à Capia →</button>
          </p>
        </div>
      </section>

      {/* Human promise band */}
      <section className="relative z-10 py-16 bg-white/[0.02] border-y border-white/10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Quote className="w-8 h-8 text-emerald-300/60 mx-auto mb-4" />
          <p className="text-xl sm:text-2xl font-medium leading-relaxed">
            « On a créé CAP Entreprendre France pour une raison simple : trop d'entrepreneurs
            passionnés perdent des clients à cause du digital. Notre job, c'est de régler ça —
            vite, proprement, et sans que vous ayez à devenir expert. »
          </p>
          <p className="mt-5 text-sm text-white/50">L'équipe CAP Entreprendre France</p>
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

      {/* How it works */}
      <section className="relative z-10 py-24 bg-white/[0.02] border-y border-white/10">
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
            <a href="#packs" className="hover:text-white/70">Offres</a>
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
