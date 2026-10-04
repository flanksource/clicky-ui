// What the call graph says about an edge, a group and what it left out, as text: pill labels,
// tooltips, chips. Pure, with no React and no layout; call-graph-model.ts maps it onto the diagram.
import type { CallGraphEdge, CallGraphOmitted, CallGraphSite } from "./types";

/** The room an edge type's icon (every type but a plain call has one) takes in a pill, in characters of guard text. */
const EDGE_ICON_CHARS = 3;

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function counted(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

/** The excluded nodes per group, most first, then by name. */
export function excludedTally(omitted: CallGraphOmitted): { group: string; count: number }[] {
  return Object.entries(omitted.excluded ?? {})
    .map(([group, count]) => ({ group, count }))
    .sort((a, b) => b.count - a.count || a.group.localeCompare(b.group));
}

/** The omitted chip's parts: what the response left out, with the excluded nodes as one total. */
export function omittedParts(omitted: CallGraphOmitted): string[] {
  const unreadable = omitted.unreadable_source?.length ?? 0;
  const excluded = excludedTally(omitted).reduce((total, { count }) => total + count, 0);
  return [
    omitted.node_limit ? "node limit reached" : "",
    omitted.beyond_depth ? `${omitted.beyond_depth} beyond depth` : "",
    omitted.unresolved ? `${omitted.unresolved} unresolved` : "",
    unreadable > 0 ? counted(unreadable, "unreadable file", "unreadable files") : "",
    excluded > 0 ? `${excluded} excluded` : "",
  ].filter(Boolean);
}

/** A group box caption: a path's last two segments. The full label is the caption's tooltip. */
export function groupCaption(label: string): string {
  return label.split("/").slice(-2).join("/");
}

/** Which of a site's nested guards the pill shows, how many there are, or none: the tooltip still names them. */
export type GuardLabel = "innermost" | "outermost" | "count" | "none";

export interface PillOptions {
  guardLabel: GuardLabel;
  /** Longest guard text a pill shows before it is cut with an ellipsis. */
  truncateAt: number;
}

function guardsOf(site: CallGraphSite): string[] {
  return site.guards ?? [];
}

/** An edge is conditional when no call site behind it can be reached unguarded. */
export function isConditional(edge: Pick<CallGraphEdge, "sites">): boolean {
  return edge.sites.length > 0 && edge.sites.every((site) => guardsOf(site).length > 0);
}

export function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

function guardCount(edge: CallGraphEdge): string {
  const counts = edge.sites.map((site) => guardsOf(site).length);
  const least = Math.min(...counts);
  const most = Math.max(...counts);
  if (least === most) return `${most} ${most === 1 ? "guard" : "guards"}`;
  return `${least}–${most} guards`;
}

/** The guard a conditional edge's sites share, or how many different ones they have. */
function guardText(edge: CallGraphEdge, { guardLabel, truncateAt }: PillOptions): string {
  if (!isConditional(edge) || guardLabel === "none") return "";
  if (guardLabel === "count") return guardCount(edge);
  const chosen = new Set(edge.sites.map((site) => guardsOf(site).at(guardLabel === "innermost" ? -1 : 0)));
  const [only] = chosen;
  if (chosen.size > 1 || only === undefined) return `${chosen.size} conditions`;
  return truncate(only, truncateAt - (edge.type === "call" ? 0 : EDGE_ICON_CHARS));
}

/**
 * The pill's text: the guard the edge's call sites share, then `×N` when there are several sites.
 * Sites with different guards show how many conditions there are instead of one of them, which would
 * read as if it covered every site. A dispatch edge's guard is cut shorter by the room its icon takes.
 */
export function edgeLabel(edge: CallGraphEdge, options: PillOptions): string | undefined {
  const text = [guardText(edge, options), edge.sites.length > 1 ? `×${edge.sites.length}` : ""].filter(Boolean).join(" ");
  return text === "" ? undefined : text;
}

/** The columns and fields a collapsed read or write touches, apart from the edge's other properties. */
export function memberChips(properties: Record<string, string> | undefined): { columns: string[]; fields: string[]; rest: Record<string, string> } {
  const { columns, fields, ...rest } = properties ?? {};
  const split = (members: string | undefined) => (members ?? "").split(",").map((member) => member.trim()).filter(Boolean);
  return { columns: split(columns), fields: split(fields), rest };
}

export type MemberAccessKind = "read" | "write" | "both";

/** A column or field a collapsed read or write touches, and whether it is read, written or both. */
export interface MemberAccess {
  name: string;
  kind: "column" | "field";
  access: MemberAccessKind;
}

/**
 * The columns and fields the reads and writes among `edges` touch, each once in first-seen order,
 * marked "both" when a read and a write both touch it. Other edges are passed over.
 */
export function memberAccess(edges: readonly CallGraphEdge[]): MemberAccess[] {
  const members = new Map<string, MemberAccess>();
  for (const edge of edges) {
    if (edge.type !== "read" && edge.type !== "write") continue;
    const { columns, fields } = memberChips(edge.properties);
    const touched = [...columns.map((name) => ({ name, kind: "column" as const })), ...fields.map((name) => ({ name, kind: "field" as const }))];
    for (const { name, kind } of touched) {
      const key = `${kind}:${name}`;
      const held = members.get(key);
      members.set(key, { name, kind, access: held && held.access !== edge.type ? "both" : edge.type });
    }
  }
  return [...members.values()];
}

/** The edge's properties as `key: value` lines, in key order. */
export function propertyLines(properties: Record<string, string> | undefined): string[] {
  return Object.entries(properties ?? {})
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}: ${value}`);
}

/**
 * The edge's tooltip: one line per distinct guard chain behind it, outermost first and joined with ∧,
 * then its properties.
 */
export function edgeTitle(edge: CallGraphEdge): string | undefined {
  const chains = new Set(
    edge.sites
      .map(guardsOf)
      .filter((guards) => guards.length > 0)
      .map((guards) => guards.join(" ∧ ")),
  );
  const lines = [...chains, ...propertyLines(edge.properties)];
  return lines.length === 0 ? undefined : lines.join("\n");
}
