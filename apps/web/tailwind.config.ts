import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f4ff",
          100: "#e0e9ff",
          200: "#c7d7fe",
          300: "#a4bbfc",
          400: "#7c96f8",
          500: "#5b6ef2",
          600: "#4449e7",
          700: "#3835cc",
          800: "#302da5",
          900: "#2c2c83",
          950: "#1c1b4f",
        },
        accent: {
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
        },
        // Palette éditoriale "premium" (encre + or) — voir apps/web/DESIGN_SYSTEM.md
        ink: {
          50: "#f4f5f7",
          100: "#e4e7ec",
          200: "#c7cdd9",
          300: "#9ca6bb",
          400: "#6b7690",
          500: "#48526b",
          600: "#333c54",
          700: "#242b3f",
          800: "#171c2c",
          900: "#0f1320",
          950: "#090b14",
        },
        gold: {
          300: "#e9d9ae",
          400: "#d9bd78",
          500: "#c9a24c",
          600: "#ad8636",
          700: "#8c6b29",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.4s ease-out forwards",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
