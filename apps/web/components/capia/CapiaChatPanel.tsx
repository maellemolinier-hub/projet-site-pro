"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { CAPIA_GREETING, CAPIA_SUGGESTIONS } from "@/lib/capia";

type ChatMessage = { role: "user" | "assistant"; content: string };

interface CapiaChatPanelProps {
  className?: string;
  messagesClassName?: string;
}

export function CapiaChatPanel({ className = "", messagesClassName = "" }: CapiaChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: CAPIA_GREETING },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/capia", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!res.ok) throw new Error("bad_response");
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Petit souci technique de mon côté. Vous pouvez nous contacter directement via le formulaire de contact — réponse sous 24h.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`flex flex-col bg-white ${className}`}>
      <div
        ref={scrollRef}
        className={`flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50 ${messagesClassName}`}
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-brand-600 text-white rounded-br-sm"
                  : "bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-sm"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm px-3.5 py-2.5">
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            </div>
          </div>
        )}

        {messages.length === 1 && !loading && (
          <div className="flex flex-wrap gap-2 pt-1">
            {CAPIA_SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-100 rounded-full px-3 py-1.5 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-gray-100 bg-white shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Écrivez votre message…"
            className="flex-1 text-sm border border-gray-200 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
            maxLength={2000}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Envoyer"
            className="w-9 h-9 shrink-0 rounded-full bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:hover:bg-brand-600 text-white flex items-center justify-center transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-gray-400 text-center mt-2">
          Réponses générées par IA · Vos messages ne sont pas conservés
        </p>
      </div>
    </div>
  );
}
