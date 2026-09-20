import type { Config } from "tailwindcss";

// Palette is driven by CSS variables (see globals.css) so the
// "Для старших классов" (dark) / "Для младших классов" (light) switch re-themes everything.
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: { 900: "rgb(var(--bg-start-rgb) / <alpha-value>)", 800: "rgb(var(--bg-end-rgb) / <alpha-value>)", 700: "rgb(var(--surface-rgb) / <alpha-value>)" },
        teal: { DEFAULT: "rgb(var(--accent-rgb) / <alpha-value>)", 400: "rgb(var(--accent-rgb) / <alpha-value>)", 500: "rgb(var(--accent-hover-rgb) / <alpha-value>)" },
        sun: { DEFAULT: "rgb(var(--yellow-rgb) / <alpha-value>)", 400: "rgb(var(--yellow-rgb) / <alpha-value>)", 500: "rgb(var(--yellow-rgb) / <alpha-value>)" },
        lilac: "rgb(var(--purple-rgb) / <alpha-value>)",
        fg: "rgb(var(--text-rgb) / <alpha-value>)",
        fg2: "var(--text-secondary)",
        fg3: "var(--text-muted)",
        line: "var(--card-border)",
        card: "var(--card-bg)",
      },
      fontFamily: {
        sans: ["var(--font-rubik)", "system-ui", "sans-serif"],
        heading: ["var(--font-montserrat)", "var(--font-rubik)", "sans-serif"],
      },
      borderRadius: { pill: "50px" },
      boxShadow: {
        glow: "0 0 30px var(--glow)",
        "glow-sun": "0 0 30px rgba(255, 217, 0, 0.35)",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 10px var(--glow)" },
          "50%": { boxShadow: "0 0 30px var(--glow-strong)" },
        },
        float: { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-20px)" } },
      },
      animation: { pulseGlow: "pulseGlow 2s ease-in-out infinite", float: "float 4s ease-in-out infinite" },
    },
  },
  plugins: [],
};
export default config;
