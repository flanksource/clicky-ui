import type { Config } from "tailwindcss";
import preset from "@flanksource/clicky-ui/tailwind-preset";

/**
 * The `mv-*` scale exists for the approvals demo, which reproduces the Merivio
 * design artifact. Every value reads a `--mv-*` custom property defined by
 * `src/demos/approvals/merivio.css` under the `.merivio` scope — the utilities
 * are global but only resolve inside that scope, and they flip with
 * `data-theme` for free. Deliberately no opacity-modifier support: these are
 * plain `var()` colors, so reach for a `-soft` variant rather than `/40`.
 */
const config: Config = {
  presets: [preset as Config],
  content: ["./index.html", "./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        mv: {
          paper: "var(--mv-paper)",
          "paper-2": "var(--mv-paper-2)",
          surface: "var(--mv-surface)",
          "surface-2": "var(--mv-surface-2)",
          ink: "var(--mv-ink)",
          "ink-2": "var(--mv-ink-2)",
          "ink-3": "var(--mv-ink-3)",
          muted: "var(--mv-muted)",
          "muted-2": "var(--mv-muted-2)",
          border: "var(--mv-border)",
          "border-strong": "var(--mv-border-strong)",
          hair: "var(--mv-hair)",
          accent: "var(--mv-accent)",
          "accent-2": "var(--mv-accent-2)",
          "accent-soft": "var(--mv-accent-soft)",
          warm: "var(--mv-warm)",
          "warm-soft": "var(--mv-warm-soft)",
          negative: "var(--mv-negative)",
          "negative-soft": "var(--mv-negative-soft)",
          positive: "var(--mv-positive)",
          info: "var(--mv-info)",
          "info-soft": "var(--mv-info-soft)",
        },
      },
      borderRadius: {
        "mv-sm": "6px",
        "mv-md": "10px",
        "mv-lg": "14px",
      },
      boxShadow: {
        "mv-card": "var(--mv-shadow-card)",
        "mv-pop": "var(--mv-shadow-pop)",
      },
      fontSize: {
        "mv-eyebrow": ["10px", { lineHeight: "1.4", letterSpacing: "0.1em" }],
        "mv-2xs": ["10.5px", { lineHeight: "1.4" }],
        "mv-xs": ["11px", { lineHeight: "1.45" }],
        "mv-sm": ["11.5px", { lineHeight: "1.45" }],
        "mv-base": ["12.5px", { lineHeight: "1.5" }],
        "mv-md": ["13px", { lineHeight: "1.45" }],
        "mv-lg": ["13.5px", { lineHeight: "1.45", letterSpacing: "-0.01em" }],
        "mv-num": ["20px", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
        "mv-title": ["19px", { lineHeight: "1.25", letterSpacing: "-0.02em" }],
        "mv-stat": ["24px", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
      },
    },
  },
};

export default config;
