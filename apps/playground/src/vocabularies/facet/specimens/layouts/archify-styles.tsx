import {
  UiCloud,
  UiCode2,
  UiDatabase,
  UiGlobe,
  UiShieldCheck,
  UiStack,
  UiUser,
} from "@flanksource/clicky-ui/icons";

import { type Icon } from "../products/blocks";

export const KINDS = {
  surface: { label: "Surface", border: "#0891b2", fill: "#ecfeff", icon: UiGlobe },
  gateway: { label: "Cloud edge", border: "#d97706", fill: "#fef3c7", icon: UiCloud },
  policy: { label: "Policy", border: "#e11d48", fill: "#ffe4e6", icon: UiShieldCheck },
  stream: { label: "Queue / action", border: "#ea580c", fill: "#ffedd5", icon: UiStack },
  store: { label: "Data store", border: "#7c3aed", fill: "#ede9fe", icon: UiDatabase },
  logic: { label: "Agent logic", border: "#059669", fill: "#d1fae5", icon: UiCode2 },
  external: { label: "External", border: "#64748b", fill: "#f1f5f9", icon: UiUser },
} satisfies Record<string, { label: string; border: string; fill: string; icon: Icon }>;

export const STROKES = {
  primary: { label: "primary data", color: "#059669", dash: undefined },
  policy: { label: "policy / secrets", color: "#e11d48", dash: "5 4" },
  async: { label: "async batch", color: "#7c3aed", dash: "3 3" },
  flow: { label: "flow", color: "#64748b", dash: undefined },
} satisfies Record<string, { label: string; color: string; dash: string | undefined }>;
