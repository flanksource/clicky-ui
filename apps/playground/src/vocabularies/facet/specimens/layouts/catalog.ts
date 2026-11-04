import type { LayoutTaxonomy } from "./taxonomy";

export interface LayoutEntry extends LayoutTaxonomy {
  key: string;
  title: string;
}

export const LAYOUT_CATALOG: LayoutEntry[] = [
  { key: "pipeline", title: "Stage pipeline", family: "flow", layout: "snake", slots: ["legend-below"], order: "left-right", link: "explicit", scheme: "per-flow", theme: "role" },
  { key: "layer-stack", title: "Layer stack", family: "stack", layout: "bands", slots: ["surfaces-top", "side-rail", "foundation-bottom"], order: "top-down", link: "derived", scheme: "per-layer", theme: "role" },
  { key: "capability-map", title: "Capability map · financial crime management", family: "stack", layout: "matrix", slots: ["spanning-column", "legend-below"], order: "top-down", link: "none", scheme: "per-kind", theme: "business" },
  { key: "planes", title: "Alternative · Control and compute planes", family: "architecture", layout: "planes", slots: [], order: "left-right", link: "explicit", scheme: "per-zone", theme: "role" },
  { key: "durable-loop", title: "Alternative · Durable loop", family: "flow", layout: "nested", slots: ["external-beyond"], link: "explicit", scheme: "per-zone", theme: "role" },
  { key: "request-lanes", title: "Alternative · Request lanes", family: "flow", layout: "lanes", slots: ["legend-below"], order: "left-right", link: "explicit", scheme: "per-lane", theme: "role" },
  { key: "iso-stack", title: "Isometric stack", family: "stack", layout: "iso", slots: ["callouts-alternating"], order: "bottom-up", link: "none", scheme: "focal", theme: "role" },
  { key: "iso-stack-animated", title: "Isometric stack · animated", family: "stack", layout: "iso", slots: ["callouts-alternating"], order: "bottom-up", link: "none", scheme: "focal", theme: "role" },
  { key: "arc-platform", title: "Platform arc", family: "stack", layout: "radial", slots: [], link: "none", scheme: "focal", theme: "warm" },
  { key: "fan-out", title: "Fan-out with actors", family: "flow", layout: "fan-out", slots: [], order: "top-down", link: "bus", scheme: "per-kind", theme: "warm" },
  { key: "app-boundary", title: "Application boundary", family: "architecture", layout: "nested", slots: ["actors-left", "legend-below"], order: "left-right", link: "explicit", scheme: "focal", theme: "stone" },
  { key: "numbered-rail", title: "Numbered rail", family: "flow", layout: "rail", slots: [], order: "top-down", link: "chevrons", scheme: "per-zone", theme: "night" },
  { key: "night-layer-stack", title: "Numbered rail · layered stack, dark", family: "stack", layout: "bands", slots: ["header"], order: "top-down", link: "none", scheme: "per-layer", theme: "night" },
  { key: "wire-figures", title: "Wire figures", family: "architecture", layout: "hub", slots: [], link: "bus", scheme: "focal", theme: "wire" },
  { key: "reference-architecture", title: "Reference architecture", family: "architecture", layout: "grid", slots: ["actors-left"], order: "left-right", link: "explicit", scheme: "per-kind", theme: "edge" },
  { key: "stage-columns", title: "Stage columns", family: "flow", layout: "columns", slots: ["legend-below"], order: "left-right", link: "explicit", scheme: "per-kind", theme: "spectrum" },
  { key: "signal-lanes", title: "Signal lanes", family: "flow", layout: "lanes", slots: ["legend-below"], order: "left-right", link: "explicit", scheme: "per-lane", theme: "spectrum" },
  { key: "blueprint", title: "Blueprint", family: "architecture", layout: "nested", slots: ["header"], link: "explicit", scheme: "per-zone", theme: "spectrum" },
  { key: "layered-platform", title: "Layered platform", family: "stack", layout: "framed-tiers", slots: ["surfaces-top", "foundation-bottom", "legend-below"], order: "top-down", link: "explicit", scheme: "per-tier", theme: "role" },
  { key: "mission-control-hub", title: "Mission Control hub and spoke", family: "architecture", layout: "hub", slots: ["actors-left"], link: "explicit", scheme: "per-kind", theme: "role" },
  { key: "protocol-bands", title: "Protocol bands", family: "stack", layout: "subgrid", slots: ["foundation-bottom"], order: "top-down", link: "explicit", scheme: "per-flow", theme: "role" },
  { key: "titled-canvas", title: "Titled canvas", family: "architecture", layout: "grid", slots: ["header", "legend-below"], link: "explicit", scheme: "per-kind", theme: "role" },
  { key: "build-columns", title: "Build-time columns", family: "architecture", layout: "planes", slots: ["footer-chips"], order: "left-right", link: "explicit", scheme: "per-kind", theme: "role" },
  { key: "hub", title: "Hub and spoke", family: "architecture", layout: "hub", slots: ["foundation-bottom"], link: "derived", scheme: "per-flow", theme: "role" },
  { key: "containment", title: "Containment", family: "architecture", layout: "nested", slots: ["external-beyond"], link: "explicit", scheme: "per-zone", theme: "role" },
  { key: "node-graph", title: "Typed node graph", family: "architecture", layout: "graph", slots: ["legend-below"], order: "left-right", link: "derived", scheme: "per-kind", theme: "role" },
  { key: "cycle", title: "Cycle", family: "flow", layout: "ring", slots: [], order: "clockwise", link: "derived", scheme: "focal", theme: "role" },
  { key: "timeline", title: "Timeline", family: "flow", layout: "gantt", slots: ["legend-below"], order: "left-right", link: "none", scheme: "per-lane", theme: "role" },
];
