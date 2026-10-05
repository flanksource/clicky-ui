// What a node kind means and how it is drawn. A host whose source names its own kinds (OIPA's
// transactions, copybooks and functions) passes its own vocabulary; the default is the one uir's
// `graph.Build` reports without a Theme: uir node types, a builtin, a package scope and an index
// location for every node with a source.
import {
  UiConstant,
  UiField,
  UiFunction,
  UiFunction1,
  UiFunction1Dark,
  UiFunctionSquare,
  UiInterface,
  UiMethod,
  UiMethod11,
  UiMethod11Dark,
  UiPackage,
  UiSqlColumn,
  UiSqlStoredProc,
  UiSqlTable,
  UiSymbol,
  UiSymbolDark,
  UiTableProperties,
  UiTypeParameter,
  UiUnknown,
  UiVariable,
  type IconComponent,
} from "../../icons";
import type { CallGraph, CallGraphNode } from "./types";

export interface CallGraphGlyph {
  id: string;
  /** The legend's name for it. */
  name: string;
  icon: IconComponent;
  /** Drawn instead of `icon` in the dark theme, for coloured artwork. */
  darkIcon?: IconComponent;
}

export interface CallGraphVocabulary {
  /** Every glyph the vocabulary draws, in legend order. */
  glyphs: readonly CallGraphGlyph[];
  /** The id of the one glyph a node shows. */
  glyphOf(graph: CallGraph, node: CallGraphNode): string;
  /** What the node is, in words: `method`, `external function`, `copybook`. */
  kindOf(graph: CallGraph, node: CallGraphNode): string;
  /** The node has a body the source walks: it can be expanded and opened. */
  hasSource(node: CallGraphNode): boolean;
  /** The graph can be drawn around the node: Focus is offered for it, with or without a source. */
  canRoot(node: CallGraphNode): boolean;
  /** A table, column, procedure, entity or field: its details count readers and writers. */
  isData(node: CallGraphNode): boolean;
  /** Drawn dimmed: the node leads nowhere further. */
  muted(node: CallGraphNode): boolean;
  /** The node's status line in its details. */
  status(node: CallGraphNode): string;
  /** The node a data node stands for, such as the column behind a field, offered as a Focus link. */
  backing?(node: CallGraphNode): { id: string; label: string } | undefined;
  /** What a group is, and the icon its box caption shows. */
  group: { noun: string; plural: string; icon: IconComponent; patternHint: string };
}

/** The glyph with that id, failing on one the vocabulary does not list. */
export function requireGlyph(vocabulary: CallGraphVocabulary, id: string): CallGraphGlyph {
  const glyph = vocabulary.glyphs.find((candidate) => candidate.id === id);
  if (!glyph) throw new Error(`call graph: the vocabulary has no glyph "${id}"`);
  return glyph;
}

/** The glyphs the graph's nodes use, once each, in legend order. */
export function usedGlyphs(graph: CallGraph, vocabulary: CallGraphVocabulary): CallGraphGlyph[] {
  const used = new Set(graph.nodes.map((node) => vocabulary.glyphOf(graph, node)));
  return vocabulary.glyphs.filter((glyph) => used.has(glyph.id));
}

/** The node's tooltip: its kind, its label and its group's full label. */
export function nodeTitle(graph: CallGraph, node: CallGraphNode, vocabulary: CallGraphVocabulary): string {
  const group = graph.groups?.find((candidate) => candidate.id === node.group)?.label ?? node.group;
  return `${vocabulary.kindOf(graph, node)} ${node.label}${group ? ` in ${group}` : ""}`;
}

export function callsItself(graph: CallGraph, node: CallGraphNode): boolean {
  return graph.edges.some((edge) => edge.from === node.id && edge.to === node.id);
}

export function siteKey(site: { path?: string; line?: number; column?: number }): string {
  return `${site.path}:${site.line}:${site.column}`;
}

// uir node types that have a glyph of their own, and the words for each.
const UIR_KINDS = new Map<string, { glyph: string; words: string }>([
  ["func", { glyph: "func", words: "function" }],
  ["method", { glyph: "method", words: "method" }],
  ["builtin", { glyph: "builtin", words: "builtin" }],
  ["type", { glyph: "type", words: "type" }],
  ["field", { glyph: "field", words: "field" }],
  ["var", { glyph: "var", words: "variable" }],
  ["const", { glyph: "const", words: "constant" }],
  ["package", { glyph: "package", words: "package scope" }],
]);

// Data access, as the graph's data model names it: `table:AsPolicy`, `column:AsPolicy.STATUSCODE`,
// `procedure:Update_ClassGroup`, `entity:Policy` and `field:Policy.StatusCode`, a field carrying
// `column` (its `x-oipa-column`) or `storage` (the table a dynamic field is kept in).

export const DATA_KIND_WORDS: Readonly<Record<string, string>> = {
  table: "table",
  column: "column",
  procedure: "stored procedure",
  entity: "entity",
  field: "field",
};

export const CALL_GRAPH_DATA_GLYPHS: readonly CallGraphGlyph[] = [
  { id: "table", name: "table", icon: UiSqlTable },
  { id: "column", name: "column", icon: UiSqlColumn },
  { id: "procedure", name: "stored procedure", icon: UiSqlStoredProc },
  { id: "entity", name: "entity", icon: UiTableProperties },
  { id: "field", name: "field", icon: UiField },
];

export function isDataNode(node: CallGraphNode): boolean {
  return Object.hasOwn(DATA_KIND_WORDS, node.kind);
}

/** The data node's name: its id after `<kind>:`, else its label. */
function dataName(node: CallGraphNode): string {
  const prefix = `${node.kind}:`;
  return node.id.startsWith(prefix) ? node.id.slice(prefix.length) : node.label;
}

export function dataNodeStatus(node: CallGraphNode): string {
  const name = dataName(node);
  switch (node.kind) {
    case "table": return `Table ${name}`;
    case "column": return `Column ${name}`;
    case "procedure": return `Stored procedure ${name}`;
    case "entity": return `${name} fields`;
  }
  const entity = name.includes(".") ? name.slice(0, name.indexOf(".")) : (node.group ?? "");
  const { column, storage } = node.properties ?? {};
  if (column) return `${entity} field → ${column}`;
  if (storage) return `${entity} field, dynamic, stored in ${storage}`;
  return `${entity} field`;
}

/** The column behind a field, by its `column` property. */
export function dataNodeBacking(node: CallGraphNode): { id: string; label: string } | undefined {
  const column = node.kind === "field" ? node.properties?.column : undefined;
  return column ? { id: `column:${column}`, label: column } : undefined;
}

export function isBuiltin(node: CallGraphNode): boolean {
  return node.kind === "builtin";
}

/** The node standing for the calls a package makes outside any declaration. */
function isPackageScope(node: CallGraphNode): boolean {
  return node.kind === "package";
}

/** A symbol declared outside the indexed snapshots: it has no source, so it cannot be opened or expanded. */
export function isExternal(node: CallGraphNode): boolean {
  return !node.location && !node.unresolved && !isBuiltin(node) && !isPackageScope(node) && !isDataNode(node);
}

/**
 * The index has no kind for an interface method: it is a `method`. It shows in the graph as the target
 * of a call whose site also carries a dispatch edge from the same caller, because the source adds that
 * dispatch edge to each implementation of the interface method called there.
 */
export function interfaceMethods(graph: CallGraph): Set<string> {
  const dispatched = new Set(
    graph.edges.filter((edge) => edge.type === "dispatch").flatMap((edge) => edge.sites.map((site) => `${edge.from} ${siteKey(site)}`)),
  );
  return new Set(
    graph.edges
      .filter((edge) => edge.type === "call" && edge.sites.some((site) => dispatched.has(`${edge.from} ${siteKey(site)}`)))
      .map((edge) => edge.to),
  );
}

/**
 * The one glyph a node shows. An unresolved call, a builtin and a package scope are what they are;
 * after those, a symbol that calls itself, an external function and an interface method outrank the
 * plain kind. An external method keeps the method glyph: its dimmed box already says it has no source.
 */
function uirGlyph(graph: CallGraph, node: CallGraphNode): string {
  if (node.unresolved) return "unresolved";
  if (isBuiltin(node)) return "builtin";
  if (isPackageScope(node)) return "package";
  if (isDataNode(node)) return node.kind;
  if (callsItself(graph, node)) return "recursive";
  if (isExternal(node) && node.kind === "func") return "external_func";
  if (interfaceMethods(graph).has(node.id)) return "interface_method";
  return UIR_KINDS.get(node.kind)?.glyph ?? "symbol";
}

function uirKind(graph: CallGraph, node: CallGraphNode): string {
  if (node.unresolved) return "unresolved call";
  const kind = interfaceMethods(graph).has(node.id) ? "interface method" : (UIR_KINDS.get(node.kind)?.words ?? DATA_KIND_WORDS[node.kind] ?? node.kind.replaceAll("_", " "));
  return [isExternal(node) ? "external" : "", callsItself(graph, node) ? "recursive" : "", kind].filter(Boolean).join(" ");
}

function uirStatus(node: CallGraphNode): string {
  if (node.unresolved) return "Unresolved: the index has no target for this call";
  if (isBuiltin(node)) return "Builtin: no source";
  if (isExternal(node)) return "External: declared outside the indexed snapshots";
  if (node.location) return "Indexed";
  return isDataNode(node) ? dataNodeStatus(node) : "Package scope: calls made outside any declaration";
}

export const UIR_CALL_GRAPH_VOCABULARY: CallGraphVocabulary = {
  glyphs: [
    { id: "func", name: "function", icon: UiFunction },
    { id: "method", name: "method", icon: UiMethod },
    { id: "interface_method", name: "interface method", icon: UiInterface },
    { id: "recursive", name: "calls itself", icon: UiMethod11, darkIcon: UiMethod11Dark },
    { id: "external_func", name: "external function", icon: UiFunction1, darkIcon: UiFunction1Dark },
    { id: "builtin", name: "builtin", icon: UiFunctionSquare },
    { id: "type", name: "type", icon: UiTypeParameter },
    { id: "field", name: "field", icon: UiField },
    { id: "var", name: "variable", icon: UiVariable },
    { id: "const", name: "constant", icon: UiConstant },
    { id: "package", name: "package scope", icon: UiPackage },
    // uir's `field` is already a glyph of its own: a struct field is data too.
    ...CALL_GRAPH_DATA_GLYPHS.filter((glyph) => glyph.id !== "field"),
    { id: "unresolved", name: "unresolved call", icon: UiUnknown },
    { id: "symbol", name: "other symbol", icon: UiSymbol, darkIcon: UiSymbolDark },
  ],
  glyphOf: uirGlyph,
  kindOf: uirKind,
  hasSource: (node) => Boolean(node.location),
  canRoot: (node) => Boolean(node.location) || isDataNode(node),
  isData: isDataNode,
  muted: (node) => Boolean(node.unresolved) || isBuiltin(node) || isExternal(node),
  status: uirStatus,
  backing: dataNodeBacking,
  group: { noun: "package", plural: "packages", icon: UiPackage, patternHint: "example.com/module/..." },
};
