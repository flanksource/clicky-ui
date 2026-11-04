import type { CSSProperties } from "react";

import type { NodePalette } from "@flanksource/facet";

import { TONES } from "./primitives";

import { NIGHT } from "./temporal-styles";

import { WARM } from "./incident-styles";

import { INK } from "./inngest-styles";

import { WIRE } from "./tailscale-styles";

import { EDGE } from "./cloudflare-styles";

import { KINDS } from "./archify-styles";

import { ROLES as BUSINESS } from "./capability-map";

import type { Theme } from "./taxonomy";

const WHITE = "#ffffff";

export interface ThemeStyle {
  palette?: NodePalette;
  canvas: CSSProperties;
  swatches: string[];
}

const grid = (line: string, size: number): CSSProperties => ({
  backgroundImage: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`,
  backgroundSize: `${size}px ${size}px`,
});

const dots = (dot: string): CSSProperties => ({ backgroundImage: `radial-gradient(${dot} 1px, transparent 1px)`, backgroundSize: "12px 12px" });

export const THEME_STYLES: Record<Theme, ThemeStyle> = {
  role: {
    canvas: { backgroundColor: WHITE },
    swatches: [TONES.new.color, TONES.existing.color, TONES.future.color, TONES.output.color, TONES.store.color, TONES.exception.color],
  },
  night: {
    palette: {
      accent: NIGHT.purple, tint: NIGHT.card, containerTint: NIGHT.bg, border: NIGHT.edge, surface: NIGHT.card,
      panel: NIGHT.card, panelBorder: NIGHT.edge, text: NIGHT.text, muted: NIGHT.muted, onAccent: NIGHT.bg, dark: NIGHT.text, onDark: NIGHT.bg,
    },
    canvas: { backgroundColor: NIGHT.bg, ...grid(NIGHT.grid, 12) },
    swatches: [NIGHT.green, NIGHT.purple, NIGHT.orange, NIGHT.rail, NIGHT.text, NIGHT.muted],
  },
  warm: {
    palette: {
      accent: WARM.accent, tint: WARM.ring, containerTint: WARM.band, border: WARM.line, surface: WHITE,
      panel: WARM.tile, panelBorder: WARM.line, text: WARM.ink, muted: WARM.muted, onAccent: WHITE, dark: WARM.ink, onDark: WHITE,
    },
    canvas: { backgroundColor: WARM.band },
    swatches: [WARM.accent, WARM.ring, WARM.line, WARM.tile, WARM.ink, WARM.muted],
  },
  stone: {
    palette: {
      accent: INK.accent, tint: INK.panel, containerTint: INK.canvas, border: INK.border, surface: WHITE,
      panel: INK.panel, panelBorder: INK.border, text: INK.text, muted: INK.muted, onAccent: WHITE, dark: INK.text, onDark: WHITE,
    },
    canvas: { backgroundColor: INK.canvas, ...dots(INK.dot) },
    swatches: [INK.accent, INK.panel, INK.border, INK.line, INK.text, INK.muted],
  },
  wire: {
    palette: {
      accent: WIRE.line, tint: WIRE.pill, containerTint: WIRE.card, border: WIRE.pillEdge, surface: WHITE,
      panel: WIRE.pill, panelBorder: WIRE.pillEdge, text: WIRE.text, muted: WIRE.muted, onAccent: WHITE, dark: WIRE.hub, onDark: WHITE,
    },
    canvas: { backgroundColor: WIRE.card },
    swatches: [WIRE.line, WIRE.hub, WIRE.pill, WIRE.address, WIRE.text, WIRE.muted],
  },
  edge: {
    palette: {
      accent: EDGE.orange, tint: EDGE.peach, containerTint: EDGE.canvas, border: EDGE.orange, surface: WHITE,
      panel: EDGE.canvas, panelBorder: EDGE.dot, text: EDGE.ink, muted: EDGE.muted, onAccent: WHITE, dark: EDGE.ink, onDark: WHITE,
    },
    canvas: { backgroundColor: EDGE.canvas, ...dots(EDGE.dot) },
    swatches: [EDGE.orange, EDGE.peach, EDGE.person, EDGE.personIcon, EDGE.ink, EDGE.muted],
  },
  spectrum: {
    palette: {
      accent: KINDS.logic.border, tint: KINDS.logic.fill, containerTint: KINDS.external.fill, border: KINDS.logic.border, surface: WHITE,
      panel: KINDS.external.fill, panelBorder: KINDS.external.border, text: "#0f172a", muted: KINDS.external.border, onAccent: WHITE, dark: "#0f172a", onDark: WHITE,
    },
    canvas: { backgroundColor: "#f8fbfd", ...grid("#e0eef6", 12) },
    swatches: Object.values(KINDS).map((kind) => kind.border),
  },
  business: {
    palette: {
      accent: BUSINESS.digital.border, tint: BUSINESS.digital.fill, containerTint: BUSINESS.neutral.fill, border: BUSINESS.neutral.border, surface: WHITE,
      panel: BUSINESS.neutral.fill, panelBorder: BUSINESS.neutral.border, text: "#252525", muted: BUSINESS.neutral.border, onAccent: WHITE, dark: "#252525", onDark: WHITE,
    },
    canvas: { backgroundColor: WHITE },
    swatches: Object.values(BUSINESS).flatMap((role) => [role.fill, role.border]).slice(0, 8),
  },
};
