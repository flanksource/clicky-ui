import type { PermissionRule } from "../chat/tool-policy";
import type { ToolMeta, ToolPolicy } from "../chat/types";
import {
  commonMode,
  groupToolPolicy,
  nextMode,
  toolEntry,
  type BadgePolicy,
} from "./ToolPreferences.model";

export type ToolSchemaViewMode = "group" | "tree";
export type ToolSchemaBrowserTab = "schema" | "json";
export type ToolHintKey =
  | "readOnlyHint"
  | "destructiveHint"
  | "idempotentHint"
  | "openWorldHint";
export type ToolHintFilter = "any" | "yes" | "no";
export type ToolHintFilters = Record<ToolHintKey, ToolHintFilter>;

export type ToolSection = {
  label: string;
  count: number;
  children: Array<{ label: string; tools: ToolMeta[] }>;
};

export const TOOL_HINTS: Array<{ key: ToolHintKey; label: string }> = [
  { key: "readOnlyHint", label: "Read only" },
  { key: "destructiveHint", label: "Destructive" },
  { key: "idempotentHint", label: "Idempotent" },
  { key: "openWorldHint", label: "Open world" },
];

export const EMPTY_TOOL_HINT_FILTERS: ToolHintFilters = {
  readOnlyHint: "any",
  destructiveHint: "any",
  idempotentHint: "any",
  openWorldHint: "any",
};

const NO_GROUP = "Tools";
const NO_PARENT = "General";

export function cycleToolHintFilter(value: ToolHintFilter): ToolHintFilter {
  if (value === "any") return "yes";
  if (value === "yes") return "no";
  return "any";
}

export function toolHintFilterLabel(value: ToolHintFilter): string {
  if (value === "yes") return "Yes";
  if (value === "no") return "No";
  return "Any";
}

export function filterToolSchemaBrowserTools(
  tools: ToolMeta[],
  query: string,
  filters: ToolHintFilters,
): ToolMeta[] {
  const q = query.trim().toLowerCase();
  return tools.filter((tool) => {
    if (!matchesHintFilters(tool, filters)) return false;
    if (!q) return true;
    return [
      tool.name,
      tool.label,
      tool.title,
      tool.description,
      tool.group,
      tool.parent,
      tool.entity,
      tool.icon,
      tool.defaultPermission,
      tool.source,
      tool.server,
      ...annotationSearchText(tool),
      ...(tool.hints ?? []),
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(q));
  });
}

function matchesHintFilters(tool: ToolMeta, filters: ToolHintFilters): boolean {
  return TOOL_HINTS.every(({ key }) => {
    const filter = filters[key];
    if (filter === "any") return true;
    const value = tool.annotations?.[key];
    return filter === "yes" ? value === true : value !== true;
  });
}

function annotationSearchText(tool: ToolMeta): string[] {
  if (!tool.annotations) return [];
  return Object.entries(tool.annotations)
    .flatMap(([key, value]) => [key, primitiveAnnotationText(value)])
    .filter((value): value is string => Boolean(value));
}

function primitiveAnnotationText(value: unknown): string | undefined {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }
  return undefined;
}

export function buildToolSchemaSections(
  tools: ToolMeta[],
  view: ToolSchemaViewMode,
): ToolSection[] {
  const outerOf = (tool: ToolMeta) =>
    view === "group" ? tool.group || NO_GROUP : tool.parent || NO_PARENT;
  const innerOf = (tool: ToolMeta) =>
    view === "group" ? tool.parent || NO_PARENT : tool.group || NO_GROUP;

  const outer = new Map<string, Map<string, ToolMeta[]>>();
  for (const tool of tools) {
    const outerKey = outerOf(tool);
    const innerKey = innerOf(tool);
    const inner = outer.get(outerKey) ?? new Map<string, ToolMeta[]>();
    const bucket = inner.get(innerKey) ?? [];
    bucket.push(tool);
    inner.set(innerKey, bucket);
    outer.set(outerKey, inner);
  }

  return [...outer.entries()]
    .map(([label, inner]) => {
      const children = [...inner.entries()]
        .map(([childLabel, childTools]) => ({
          label: childLabel,
          tools: [...childTools].sort((a, b) =>
            (a.label || a.name).localeCompare(b.label || b.name),
          ),
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
      return {
        label,
        count: children.reduce((sum, child) => sum + child.tools.length, 0),
        children,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function directoryPermissionRule({
  tools,
  view,
  depth,
  policy,
}: {
  tools: ToolMeta[];
  view: ToolSchemaViewMode;
  depth: "section" | "child";
  policy: ToolPolicy;
}): PermissionRule {
  const group = singleDirectoryValue(tools, "group");
  const parent = singleDirectoryValue(tools, "parent");
  const facets =
    depth === "section"
      ? view === "group"
        ? { group }
        : { parent }
      : { group, parent };
  // Metadata facets keep applying as the catalog grows; only a directory with
  // no metadata at all falls back to the names it holds today.
  if (!facets.group && !facets.parent) {
    return { name: tools.map((tool) => tool.name).sort(), policy };
  }
  return {
    ...(facets.group ? { group: facets.group } : {}),
    ...(facets.parent ? { parent: facets.parent } : {}),
    policy,
  };
}

function singleDirectoryValue(
  tools: ToolMeta[],
  key: "group" | "parent",
): string | undefined {
  const values = new Set(tools.map((tool) => tool[key]).filter(Boolean));
  return values.size === 1 ? [...values][0] : undefined;
}

/** The badge a directory shows and the rule a click on it emits: one cycle step
 *  past its most restrictive member, matching the quick menu's group toggle. */
export function directoryPolicyToggle(
  tools: ToolMeta[],
  value: Record<string, ToolPolicy>,
): { badge: BadgePolicy; next: ToolPolicy } {
  const entries = tools.map(toolEntry);
  return {
    badge: commonMode(entries, value),
    next: nextMode(groupToolPolicy(entries, value)),
  };
}
