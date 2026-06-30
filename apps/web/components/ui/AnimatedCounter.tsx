"use client";

import { useEffect, useRef } from "react";
import { useInView, animate } from "framer-motion";

interface Props {
  value: string; // e.g. "98%", "44 000+", "3 700+"
  className?: string;
}

export function AnimatedCounter({ value, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (!isInView || !ref.current) return;

    // Strip non-numeric chars to get the target number
    const raw = value.replace(/\s/g, "");
    const num = parseFloat(raw.replace(/[^\d.]/g, ""));
    // Everything after the digits (e.g. "%" or "+")
    const suffix = raw.replace(/[\d.]/g, "");

    const el = ref.current;

    const controls = animate(0, num, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        const rounded = Math.round(v);
        const formatted =
          rounded >= 1000
            ? rounded.toLocaleString("fr-FR")
            : rounded.toString();
        el.textContent = formatted + suffix;
      },
    });

    return () => controls.stop();
  }, [isInView, value]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
