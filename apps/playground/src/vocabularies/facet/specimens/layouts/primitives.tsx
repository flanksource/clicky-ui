import { COLORS } from "@flanksource/facet";

import { STORE, SURFACE } from "../products/blocks";

export type Tone =
  | "new"
  | "existing"
  | "future"
  | "output"
  | "surface"
  | "store"
  | "neutral"
  | "exception";

export const TONES: Record<Tone, { color: string; body: string; dashed?: boolean }> = {
  new: { color: COLORS.primary, body: COLORS.background },
  existing: { color: "#64748b", body: "#f8fafc" },
  future: { color: "#7c3aed", body: "#faf5ff", dashed: true },
  output: { color: COLORS.outputBorder, body: "#f0fdf4" },
  surface: { color: SURFACE, body: "#faf5ff" },
  store: { color: STORE, body: "#f8fafc" },
  neutral: { color: COLORS.muted, body: "#ffffff" },
  exception: { color: "#dc2626", body: "#fef2f2", dashed: true },
};
