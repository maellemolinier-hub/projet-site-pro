"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { CapiaChatPanel } from "@/components/capia/CapiaChatPanel";

const HIDDEN_PREFIXES = ["/widget", "/dashboard", "/connexion", "/inscription"];

export function CapiaWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  const hidden = HIDDEN_PREFIXES.some((p) => pathname?.startsWith(p));
  if (hidden) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="mb-3 w-[calc(100vw-2.5rem)] sm:w-[380px] h-[520px] max-h-[70vh] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 bg-brand-950 text-white shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-400 to-brand-500 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-tight">Capia</p>
                  <p className="text-[11px] text-white/60 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    Assistante IA · en ligne
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fermer la conversation"
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <CapiaChatPanel className="flex-1 min-h-0" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => {
          setOpen((v) => !v);
          setHasOpened(true);
        }}
        whileTap={{ scale: 0.92 }}
        aria-label={open ? "Fermer Capia" : "Discuter avec Capia"}
        className="relative w-14 h-14 rounded-full bg-gradient-to-br from-brand-600 to-accent-500 shadow-lg shadow-brand-600/30 flex items-center justify-center text-white hover:shadow-xl transition-shadow"
      >
        {!hasOpened && (
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white animate-pulse" />
        )}
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.span>
          ) : (
            <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Sparkles className="w-6 h-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
