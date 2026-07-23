"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, X, Send, ArrowRight, Sparkles } from "lucide-react";
import type { Offer } from "@/lib/offers";
import { cn } from "@/lib/utils";

interface Msg {
  role: "user" | "assistant";
  content: string;
  offers?: Offer[];
}

const AVATAR = "/capia-avatar.png";

const GREETING: Msg = {
  role: "assistant",
  content:
    "Bonjour, je suis Capia, l'assistante IA de CAP Entreprendre France. En quelques questions, je diagnostique le problème de votre entreprise et je vous oriente vers la bonne solution. Quel est votre métier, et qu'est-ce qui vous freine aujourd'hui ?",
};

export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = (await res.json()) as { reply?: string; offers?: Offer[] };
      setMessages([
        ...next,
        {
          role: "assistant",
          content: data.reply ?? "Désolée, je n'ai pas pu répondre. Réessayez dans un instant.",
          offers: data.offers ?? [],
        },
      ]);
    } catch {
      setMessages([
        ...next,
        { role: "assistant", content: "Oups, un souci technique. Réessayez dans un instant." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-3 group"
          aria-label="Discuter avec Capia"
        >
          <span className="hidden sm:block bg-white shadow-lg rounded-full pl-4 pr-3 py-2 text-sm font-medium text-slate-800 border border-slate-100 group-hover:shadow-xl transition">
            Discutez avec Capia
          </span>
          <span className="relative">
            <span className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-emerald-400 blur-[6px] opacity-70 group-hover:opacity-100 transition" />
            <span className="relative block w-14 h-14 rounded-full ring-2 ring-white shadow-xl overflow-hidden bg-slate-900">
              <Image src={AVATAR} alt="Capia" fill sizes="56px" className="object-cover" />
            </span>
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-white" />
          </span>
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 w-[calc(100vw-2.5rem)] max-w-sm h-[70vh] max-h-[620px] flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-white animate-fade-in">
          {/* Header */}
          <div className="relative flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-[#0d1b2a] to-[#1c1b4f] text-white">
            <span className="relative block w-10 h-10 rounded-full ring-2 ring-white/30 overflow-hidden bg-slate-800 shrink-0">
              <Image src={AVATAR} alt="Capia" fill sizes="40px" className="object-cover" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold leading-tight flex items-center gap-1.5">
                Capia
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              </p>
              <p className="text-[11px] text-white/60 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Assistante IA · CAP Entreprendre France
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i}>
                <div className={cn("flex", m.role === "user" ? "justify-end" : "justify-start gap-2")}>
                  {m.role === "assistant" && (
                    <span className="relative block w-7 h-7 rounded-full overflow-hidden shrink-0 mt-0.5 bg-slate-800">
                      <Image src={AVATAR} alt="" fill sizes="28px" className="object-cover" />
                    </span>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] px-3.5 py-2.5 text-sm leading-relaxed rounded-2xl",
                      m.role === "user"
                        ? "bg-brand-600 text-white rounded-br-md"
                        : "bg-white text-slate-700 border border-slate-100 rounded-bl-md",
                    )}
                  >
                    {m.content}
                  </div>
                </div>

                {/* Offer cards */}
                {m.offers && m.offers.length > 0 && (
                  <div className="mt-2 ml-9 space-y-2">
                    {m.offers.map((offer) => (
                      <div
                        key={offer.id}
                        className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-900">{offer.name}</p>
                          {offer.priceHint && (
                            <span className="text-[10px] whitespace-nowrap text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
                              {offer.priceHint}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{offer.tagline}</p>
                        <Link
                          href={`/contact-entreprise?offre=${offer.id}`}
                          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                        >
                          En savoir plus <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    ))}
                    <Link
                      href="/contact-entreprise"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-emerald-500 px-3 py-2 rounded-xl hover:opacity-90 transition"
                    >
                      Prendre rendez-vous <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2">
                <span className="relative block w-7 h-7 rounded-full overflow-hidden shrink-0 bg-slate-800">
                  <Image src={AVATAR} alt="" fill sizes="28px" className="object-cover" />
                </span>
                <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-md px-3.5 py-3">
                  <span className="flex gap-1">
                    <Dot /> <Dot delay="0.15s" /> <Dot delay="0.3s" />
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-slate-100">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={1}
                placeholder="Décrivez votre besoin…"
                className="flex-1 resize-none max-h-28 px-3.5 py-2.5 rounded-2xl bg-slate-100 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                className="shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 text-white flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition"
                aria-label="Envoyer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-slate-300 text-center mt-2">
              Capia · IA au service des entrepreneurs
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function Dot({ delay = "0s" }: { delay?: string }) {
  return (
    <span
      className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce"
      style={{ animationDelay: delay }}
    />
  );
}
