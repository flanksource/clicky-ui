import type { KeyboardEvent, ReactNode } from "react";
import type { BadgeTone } from "./Badge";
import type { GraphLayoutPosition } from "./graph-layout";

export interface GraphDiagramNode {
  id: string;
  label: ReactNode;
  /** Drawn before the label, on the same line. Give the icon its own `title` so it names itself. */
  icon?: ReactNode;
  /** Right-aligned content on a record row, such as a column type. */
  aside?: ReactNode;
  /**
   * A small mark at the end of the node's line, such as how it is accessed (see `AccessMark`). It is
   * hidden from assistive technology, so the node's accessible name stays its own: give it a title.
   */
  mark?: ReactNode;
  detail?: ReactNode;
  badge?: ReactNode;
  tone?: BadgeTone;
  shape?: "pill" | "rect";
  /** Accessible name for the node, when `label` alone isn't enough. */
  ariaLabel?: string;
  /** Full text for the node, shown as its native tooltip. */
  title?: string;
  /** Column of the node. Required by the "columns" layout; may be negative. */
  level?: number;
  /** "columns" layout: nodes sharing a group are stacked together and boxed. */
  group?: string;
  /**
   * "columns" layout: "compact" draws the node on one short line at `compactNodeHeight`, its icon and
   * label only, for a member its group box already names the owner of. Defaults to "regular".
   */
  size?: "regular" | "compact";
  /** Dimmed styling, for a node that leads nowhere further: external, unresolved, not expandable. */
  muted?: boolean;
  /** Neighbours not drawn yet. Renders a `+N` control on the node's outer side. */
  expandCount?: number;
}

export interface GraphDiagramEdge {
  id: string;
  from: string;
  to: string;
  /** Short text shown in a pill on the edge. */
  label?: string;
  /** Drawn in the pill before the label. An edge with an icon and no label still gets a pill. */
  icon?: ReactNode;
  /** What `icon` says, in words. It precedes the label in the edge's accessible name. */
  iconLabel?: string;
  /** Full text for the edge, shown as its native tooltip. */
  title?: string;
  tone?: BadgeTone;
  dashed?: boolean;
}

export interface GraphDiagramGroup {
  id: string;
  label: ReactNode;
  /** A record draws a header and flush compact member rows. Defaults to a box. */
  variant?: "box" | "record";
  /** Full text for the group, shown as its caption's native tooltip: what a shortened `label` stands for. */
  title?: string;
  /**
   * "columns" layout: whether the group is drawn as its header alone. Set (true or false) to make it
   * collapsible: its header then shows a chevron calling `onGroupToggle`. A collapsed group holds one
   * node, the stand-in its edges attach to, which is not drawn: its header stands for it.
   */
  collapsed?: boolean;
  /** Right-aligned content in the group's header, such as what a collapsed group holds. */
  aside?: ReactNode;
}

/** The group's name in words: its title, else a plain-text label, else its id. */
export function groupName(group: GraphDiagramGroup | undefined, id: string): string {
  if (group?.title !== undefined) return group.title;
  return typeof group?.label === "string" ? group.label : id;
}

export type GraphDiagramLayout = "ring" | "columns";

/**
 * Whether edges compete for attention or take turns. With focus on, an edge
 * shows its label pill only while it is in focus — selected, hovered, or
 * attached to the selected or hovered node — and while anything is in focus
 * the other edges fade. "auto" turns it on past `DENSE_EDGE_COUNT` edges.
 */
export type GraphDiagramEdgeFocus = "auto" | "on" | "off";

/** The most edges a diagram draws with every pill showing under `edgeFocus="auto"`. */
export const DENSE_EDGE_COUNT = 32;

export function edgeFocusOn(mode: GraphDiagramEdgeFocus, edgeCount: number): boolean {
  return mode === "on" || (mode === "auto" && edgeCount > DENSE_EDGE_COUNT);
}

/** The edges in focus: the named ones, and every edge attached to a named node. */
export function focusedEdgeIds(
  edges: readonly { id: string; from: string; to: string }[],
  focus: { nodes: readonly (string | undefined)[]; edges: readonly (string | undefined)[] },
): Set<string> {
  return new Set(
    edges
      .filter((edge) => focus.edges.includes(edge.id) || focus.nodes.includes(edge.from) || focus.nodes.includes(edge.to))
      .map((edge) => edge.id),
  );
}

/** Maps a point in layout coordinates to the CSS offsets of the stage it is drawn on. */
export type GraphPlacer = (point: GraphLayoutPosition) => { left: number | string; top: number | string };

export const TONE_TEXT_CLASS: Record<BadgeTone, string> = {
  neutral: "text-muted-foreground",
  success: "text-emerald-600 dark:text-emerald-400",
  danger: "text-red-600 dark:text-red-400",
  warning: "text-amber-600 dark:text-amber-400",
  info: "text-sky-600 dark:text-sky-400",
};

export const TONE_NODE_CLASS: Record<BadgeTone, string> = {
  neutral: "border-border bg-card text-foreground",
  success: "border-emerald-500/50 bg-emerald-500/10 text-foreground",
  danger: "border-red-500/50 bg-red-500/10 text-foreground",
  warning: "border-amber-500/50 bg-amber-500/10 text-foreground",
  info: "border-sky-500/50 bg-sky-500/10 text-foreground",
};

/** The node's accessible name: its `ariaLabel`, else a plain-text label, else its id. */
export function nodeName(node: GraphDiagramNode): string {
  if (node.ariaLabel !== undefined) return node.ariaLabel;
  return typeof node.label === "string" ? node.label : node.id;
}

/** A selectable edge's accessible name: `<from> to <to>`, then what its pill shows, in words. */
export function edgeName(edge: GraphDiagramEdge, names: Record<string, string>): string {
  const ends = `${requireEntry(names, edge.from, "node name")} to ${requireEntry(names, edge.to, "node name")}`;
  const pill = [edge.iconLabel, edge.label].filter(Boolean).join(" ");
  return pill === "" ? ends : `${ends}: ${pill}`;
}

// A pill is not measured: its size is estimated from its content, at the mean
// glyph advance of its 10px medium label plus its padding and border.
const LABEL_CHAR_WIDTH = 5.4;
const LABEL_CHROME = 14;
// The pill's icon slot (`text-sm`, so a 1em icon is 14px) and its `gap-1` to the text.
const LABEL_ICON_SIZE = 14;
const LABEL_ICON_GAP = 4;

/** Estimated px width of an edge's pill. An icon counts as a fixed width, whatever it draws. */
export function edgeLabelWidth(edge: GraphDiagramEdge): number {
  const icon = edge.icon == null ? 0 : LABEL_ICON_SIZE + (edge.label ? LABEL_ICON_GAP : 0);
  return (edge.label?.length ?? 0) * LABEL_CHAR_WIDTH + icon + LABEL_CHROME;
}

export function requireEntry<T>(entries: Record<string, T>, id: string, what: string): T {
  const entry = entries[id];
  if (entry === undefined) {
    throw new Error(`GraphDiagram: no ${what} computed for "${id}"`);
  }
  return entry;
}

/** Props that report an element as hovered while the pointer is over it or the keyboard focus is inside it. */
export function hoverHandlers(id: string, onHover: (id: string | undefined) => void) {
  const enter = () => onHover(id);
  const leave = () => onHover(undefined);
  return { onMouseEnter: enter, onMouseLeave: leave, onFocus: enter, onBlur: leave };
}

/** Enter and Space activate a focused `role="button"` element, as they do a native button. */
export function activateOnKey(event: KeyboardEvent<Element>, activate: () => void): void {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    activate();
  }
}
