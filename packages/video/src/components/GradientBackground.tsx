import React from "react";
import { AbsoluteFill } from "remotion";
import { theme } from "../theme";

export const GradientBackground: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 20% 15%, ${theme.brand700} 0%, ${theme.brand950} 55%, ${theme.ink} 100%)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
