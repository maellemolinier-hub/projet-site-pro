"use client";

import { motion } from "framer-motion";

interface Props {
  items: { label: string; icon?: string }[];
  speed?: number;
  direction?: "left" | "right";
}

export function Marquee({ items, speed = 40, direction = "left" }: Props) {
  const doubled = [...items, ...items];
  const x = direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"];

  return (
    <div className="overflow-hidden relative select-none">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-gradient-to-r from-brand-950 to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-gradient-to-l from-brand-950 to-transparent" />

      <motion.div
        className="flex gap-0 w-max"
        animate={{ x }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white/40 whitespace-nowrap"
          >
            {item.icon && <span className="text-base">{item.icon}</span>}
            <span>{item.label}</span>
            <span className="ml-6 w-1 h-1 rounded-full bg-white/20 inline-block" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
