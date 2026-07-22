"use client";

import { useRef, useState, useEffect, type FormEvent } from "react";
import { Sparkles, Send, Loader2, User, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Rédige un descriptif attractif pour un appartement T3 avec balcon.",
  "Explique la méthode par comparaison directe en 5 points.",
  "Écris un e-mail de prospection pour un propriétaire vendeur.",
  "Quels critères influencent la valeur vénale d'une maison ?",
];

export function AssistantChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const nextMessages: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    // Placeholder assistant message we stream into.
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!res.ok || !res.body) {
        let detail = "L'assistant est momentanément indisponible.";
        try {
          const data = await res.json();
          if (data?.error) detail = data.error;
        } catch {
          // non-JSON error
        }
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: `⚠️ ${detail}` };
          return copy;
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "assistant",
          content: "⚠️ Une erreur réseau est survenue. Réessayez.",
        };
        return copy;
      });
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-1 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Assistant IA</h1>
            <p className="text-xs text-gray-400">Propulsé par Claude d&apos;Anthropic</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Effacer
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 px-1 pb-4"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-6 py-10">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-brand-600" />
            </div>
            <div>
              <p className="text-gray-900 font-semibold">Comment puis-je vous aider ?</p>
              <p className="text-sm text-gray-400 mt-1">
                Posez une question sur l&apos;expertise immobilière, la rédaction ou la prospection.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-2 w-full">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-left text-sm text-gray-600 bg-white border border-gray-100 rounded-xl px-4 py-3 hover:border-brand-200 hover:bg-brand-50/40 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={cn("flex gap-3", m.role === "user" ? "justify-end" : "justify-start")}
            >
              {m.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}
              <div
                className={cn(
                  "rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap break-words max-w-[80%]",
                  m.role === "user"
                    ? "bg-brand-600 text-white rounded-br-sm"
                    : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm",
                )}
              >
                {m.content || (
                  <span className="inline-flex items-center gap-1.5 text-gray-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Rédaction…
                  </span>
                )}
              </div>
              {m.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-gray-200 text-gray-600 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Composer */}
      <form onSubmit={onSubmit} className="pt-2 pb-4">
        <div className="flex items-end gap-2 bg-white border border-gray-200 rounded-2xl p-2 focus-within:border-brand-400 transition-colors">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder="Écrivez votre message… (Entrée pour envoyer)"
            className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none max-h-40"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-700 transition-colors"
            aria-label="Envoyer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-[11px] text-gray-400 text-center mt-2">
          L&apos;assistant peut faire des erreurs. Vérifiez les informations importantes.
        </p>
      </form>
    </div>
  );
}
