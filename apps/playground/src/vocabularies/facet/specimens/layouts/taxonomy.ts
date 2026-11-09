import type { DiagramPlacement } from "@flanksource/facet";

export const LAYOUT_FAMILIES = {
  stack: { label: "Stacks", question: "What is it made of, and what builds on what?" },
  architecture: { label: "Architecture", question: "What exists, where does it run, and which boundaries are crossed?" },
  flow: { label: "Flows", question: "How does one run or change move through it?" },
} as const;

export type LayoutFamily = keyof typeof LAYOUT_FAMILIES;

export const PLACEMENTS = {
  bands: "Full-width horizontal layers, read top-down",
  "framed-tiers": "Tier rows inside a titled frame; side columns aligned to the rows",
  matrix: "Numbered rows × content grid, with a spanning side column",
  subgrid: "Bands sharing one column template, so lanes hop rows straight",
  iso: "Isometric plates, bottom-up, callouts on leader lines",
  radial: "Concentric core, ring, sectors and outer band",
  planes: "Vertical columns as trust or responsibility planes",
  nested: "Containment zones by ownership",
  hub: "Fixed slots around one hub",
  grid: "Explicit grid canvas with straight edges",
  graph: "Auto-placed (dagre) typed graph",
  columns: "Numbered stage columns, left to right",
  lanes: "One party per horizontal lane, time left to right",
  snake: "Grid stages reading as a snake",
  "fan-out": "One root bussed into a row of results",
  ring: "Stages clockwise around a centre",
  rail: "Numbered vertical rail with a scene per step",
  gantt: "Label column × period axis",
} as const satisfies Record<DiagramPlacement, string>;

export type Placement = DiagramPlacement;

export const SLOTS = {
  "surfaces-top": "Entry surfaces in a row above",
  "foundation-bottom": "Shared foundation band at the foot",
  "side-rail": "A rail beside one layer, pointing into it",
  "spanning-column": "A column spanning every layer",
  "actors-left": "People and callers on the left",
  "external-beyond": "External dependencies outside the root",
  "callouts-alternating": "Leader-line callouts, alternating sides",
  header: "Eyebrow, title and subtitle above the canvas",
  "legend-below": "Legend under the figure",
  "footer-chips": "Technology chips in a footer on the same columns",
} as const;

export type Slot = keyof typeof SLOTS;

export const ORDERS = {
  "top-down": "Read top to bottom",
  "bottom-up": "Read bottom to top",
  "left-right": "Read left to right",
  clockwise: "Read clockwise",
} as const;

export type Order = keyof typeof ORDERS;

export const LINKS = {
  derived: "Connectors derived from layer order or slots",
  explicit: "Each connector placed by hand",
  bus: "Many sources combed into one line",
  chevrons: "Chevrons between tiles, no arrows",
  none: "Alignment or containment carries the meaning",
} as const;

export type LinkMode = keyof typeof LINKS;

export const SCHEMES = {
  "per-layer": "One role colour per layer, repeated on its label and tiles",
  "per-tier": "One hue; tiers told apart by tint and border",
  "per-zone": "Zone tinted by its tone; members stay neutral",
  "per-kind": "Node kind drives colour and the generated legend",
  "per-lane": "One tone per party lane",
  "per-flow": "Lines carry the meaning; nodes stay quiet",
  focal: "Greys plus one accent or a single focal node",
  brand: "Each element keeps its own brand mark and colour",
} as const;

export type Scheme = keyof typeof SCHEMES;

export const THEMES = {
  role: { source: "primitives.TONES + facet COLORS", canvas: "canvas/plain" },
  night: { source: "temporal-styles.NIGHT", canvas: "canvas/night" },
  warm: { source: "incident-styles.WARM", canvas: "warm band" },
  stone: { source: "inngest-styles.INK", canvas: "canvas/dots" },
  wire: { source: "tailscale-styles.WIRE", canvas: "frame/figure" },
  edge: { source: "cloudflare-styles.EDGE", canvas: "pale dots + frame/footer" },
  spectrum: { source: "archify-styles.KINDS / STROKES", canvas: "canvas/dots or canvas/grid + frame/crop" },
  business: { source: "capability-map.ROLES", canvas: "canvas/plain, pastel" },
} as const;

export type Theme = keyof typeof THEMES;

export interface LayoutTaxonomy {
  family: LayoutFamily;
  layout: Placement;
  slots: Slot[];
  order?: Order;
  link: LinkMode;
  scheme: Scheme;
  theme: Theme;
}

export const OTHER_STACKS: (LayoutTaxonomy & { name: string; source: string })[] = [
  { name: "Gavel architecture · stacked layers", source: "products/gavel.tsx GavelStack", family: "stack", layout: "bands", slots: [], order: "top-down", link: "none", scheme: "per-layer", theme: "role" },
  { name: "Mission Control for OIPA capability stack", source: "reference/capability-stack.tsx", family: "stack", layout: "bands", slots: ["header"], order: "top-down", link: "none", scheme: "per-layer", theme: "night" },
  { name: "Mission Control platform layer stack", source: "products/mission-control-stack.tsx", family: "stack", layout: "bands", slots: ["header"], order: "bottom-up", link: "none", scheme: "brand", theme: "role" },
];
