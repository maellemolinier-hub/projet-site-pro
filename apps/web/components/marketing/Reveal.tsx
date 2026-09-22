"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

interface RevealProps {
  children: ReactNode;
  /** Délai en ms avant le déclenchement de l'animation (pour un effet de stagger). */
  delay?: number;
  className?: string;
}

/**
 * Fait apparaître son contenu (fade + translateY) quand il entre dans le
 * viewport. Respecte prefers-reduced-motion (voir globals.css).
 *
 * Le contenu est visible par défaut (rendu serveur, JS désactivé, JS cassé,
 * crawler qui n'exécute pas le JS) : on ne bascule en état "caché en
 * attente de scroll" qu'une fois confirmé, côté client, qu'IntersectionObserver
 * est disponible pour le révéler ensuite. Un contenu qui reste invisible en
 * permanence serait pire qu'une animation qui ne se joue pas.
 */
export function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    setArmed(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -80px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const style: CSSProperties = visible ? { animationDelay: `${delay}ms` } : {};

  return (
    <div
      ref={ref}
      style={style}
      className={`${armed ? "reveal-root" : ""} ${visible ? "is-visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
