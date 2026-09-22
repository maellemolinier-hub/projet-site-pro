"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

interface AnnouncementBarProps {
  /** Texte affiché à gauche, ex. "Webinaire ImmoExpert — tous les jeudis à 14h". */
  message: string;
  /** Optionnel : date cible pour un compte à rebours (ex. prochain webinaire). */
  targetDate?: Date;
  ctaLabel?: string;
  ctaHref?: string;
  dismissible?: boolean;
}

function useCountdown(target?: Date) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!target) return;

    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setLabel("00:00:00");
        return;
      }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setLabel(
        [h, m, s].map((n) => String(n).padStart(2, "0")).join(":")
      );
    };

    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [target]);

  return label;
}

/**
 * Bandeau d'annonce noir en haut de page (rappel du bandeau promo de
 * delos.so). À utiliser uniquement avec un vrai événement/deadline —
 * ne pas y mettre de compte à rebours factice.
 */
export function AnnouncementBar({
  message,
  targetDate,
  ctaLabel,
  ctaHref,
  dismissible = true,
}: AnnouncementBarProps) {
  const [visible, setVisible] = useState(true);
  const countdown = useCountdown(targetDate);

  if (!visible) return null;

  return (
    <div className="relative bg-ink-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-center gap-3 text-xs">
        <span className="font-medium tracking-wide truncate">{message}</span>
        {countdown && (
          <span className="hidden sm:inline font-mono text-white/70">
            {countdown}
          </span>
        )}
        {ctaLabel && ctaHref && (
          <Link
            href={ctaHref}
            className="font-semibold underline underline-offset-2 decoration-white/40 hover:decoration-white shrink-0"
          >
            {ctaLabel} →
          </Link>
        )}
      </div>
      {dismissible && (
        <button
          onClick={() => setVisible(false)}
          aria-label="Fermer"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-white/50 hover:text-white transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
