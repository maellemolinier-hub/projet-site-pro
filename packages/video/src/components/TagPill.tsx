import React from "react";
import { theme, fontFamily } from "../theme";

export const TagPill: React.FC<{ label: string }> = ({ label }) => {
  return (
    <span
      style={{
        fontFamily,
        fontSize: 22,
        fontWeight: 600,
        color: theme.white,
        background: "rgba(255,255,255,0.12)",
        border: `1px solid rgba(255,255,255,0.25)`,
        borderRadius: 999,
        padding: "8px 20px",
      }}
    >
      #{label}
    </span>
  );
};
