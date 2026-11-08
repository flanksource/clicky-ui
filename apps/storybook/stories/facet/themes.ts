import type { CSSProperties } from "react";
import type { NodePalette } from "@flanksource/facet";

// The eight theme/… palettes from the playground facet gallery
// (apps/playground/…/_facet-diagrams/layouts/themes.ts), as facet NodePalettes.
// `role` has no palette: nodes keep facet's DEFAULT_NODE_PALETTE.

export interface StoryTheme {
  label: string;
  palette: NodePalette | undefined;
  canvas: CSSProperties;
}

const WHITE = "#ffffff";

const grid = (line: string, size: number): CSSProperties => ({
  backgroundImage: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`,
  backgroundSize: `${size}px ${size}px`,
});
const dots = (dot: string): CSSProperties => ({ backgroundImage: `radial-gradient(${dot} 1px, transparent 1px)`, backgroundSize: "12px 12px" });

export const THEMES = {
  role: { label: "Role (default)", palette: undefined, canvas: { backgroundColor: WHITE } },
  night: {
    label: "Night",
    palette: {
      accent: "#a78bfa", tint: "#151b33", containerTint: "#0b1023", border: "#2a3354", surface: "#151b33",
      panel: "#151b33", panelBorder: "#2a3354", text: "#f8fafc", muted: "#94a3b8", onAccent: "#0b1023", dark: "#f8fafc", onDark: "#0b1023",
    },
    canvas: { backgroundColor: "#0b1023", ...grid("rgba(148,163,184,0.07)", 12) },
  },
  warm: {
    label: "Warm",
    palette: {
      accent: "#f25533", tint: "#fbe0da", containerTint: "#f5f1ea", border: "#e8e1d5", surface: WHITE,
      panel: "#f3efe8", panelBorder: "#e8e1d5", text: "#1c1917", muted: "#78716c", onAccent: WHITE, dark: "#1c1917", onDark: WHITE,
    },
    canvas: { backgroundColor: "#f5f1ea" },
  },
  stone: {
    label: "Stone",
    palette: {
      accent: "#7c3aed", tint: "#f5f5f4", containerTint: "#fbfbfa", border: "#d6d3d1", surface: WHITE,
      panel: "#f5f5f4", panelBorder: "#d6d3d1", text: "#1c1917", muted: "#78716c", onAccent: WHITE, dark: "#1c1917", onDark: WHITE,
    },
    canvas: { backgroundColor: "#fbfbfa", ...dots("#d6d3d1") },
  },
  wire: {
    label: "Wire",
    palette: {
      accent: "#4b6fd6", tint: "#e7e6e4", containerTint: "#f4f4f3", border: "#d4d3d0", surface: WHITE,
      panel: "#e7e6e4", panelBorder: "#d4d3d0", text: "#262626", muted: "#737373", onAccent: WHITE, dark: "#1f1f1f", onDark: WHITE,
    },
    canvas: { backgroundColor: "#f4f4f3" },
  },
  edge: {
    label: "Edge",
    palette: {
      accent: "#f6821f", tint: "#fde8d4", containerTint: "#fafafa", border: "#f6821f", surface: WHITE,
      panel: "#fafafa", panelBorder: "#e5e5e5", text: "#111111", muted: "#525252", onAccent: WHITE, dark: "#111111", onDark: WHITE,
    },
    canvas: { backgroundColor: "#fafafa", ...dots("#e5e5e5") },
  },
  spectrum: {
    label: "Spectrum",
    palette: {
      accent: "#059669", tint: "#d1fae5", containerTint: "#f1f5f9", border: "#059669", surface: WHITE,
      panel: "#f1f5f9", panelBorder: "#64748b", text: "#0f172a", muted: "#64748b", onAccent: WHITE, dark: "#0f172a", onDark: WHITE,
    },
    canvas: { backgroundColor: "#f8fbfd", ...grid("#e0eef6", 12) },
  },
  business: {
    label: "Business",
    palette: {
      accent: "#389ba5", tint: "#afe3e6", containerTint: "#eeeeee", border: "#777777", surface: WHITE,
      panel: "#eeeeee", panelBorder: "#777777", text: "#252525", muted: "#777777", onAccent: WHITE, dark: "#252525", onDark: WHITE,
    },
    canvas: { backgroundColor: WHITE },
  },
} satisfies Record<string, StoryTheme>;

export type ThemeId = keyof typeof THEMES;
export const THEME_IDS = Object.keys(THEMES) as ThemeId[];
