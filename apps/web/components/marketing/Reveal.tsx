"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Délai en ms avant le déclenchement de l'animation (pour un effet de stagger). */
  delay?: number;
  className?: string;
}

/**
 * Fait apparaître son contenu (fade + translateY) quand il entre dans le
 * viewport. Respecte prefers-reduced-motion (voir globals.css).
 */
export function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

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
      className={`reveal-root ${visible ? "is-visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
