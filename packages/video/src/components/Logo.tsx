import React from "react";
import { theme, fontFamily } from "../theme";

export const Logo: React.FC<{ size?: number }> = ({ size = 28 }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: size * 0.35,
        fontFamily,
      }}
    >
      <div
        style={{
          width: size * 1.6,
          height: size * 1.6,
          borderRadius: size * 0.5,
          background: theme.accent500,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: size * 0.95,
          color: theme.white,
        }}
      >
        I
      </div>
      <span
        style={{
          color: theme.white,
          fontWeight: 700,
          fontSize: size,
          letterSpacing: -0.5,
        }}
      >
        ImmoExpert
      </span>
    </div>
  );
};
