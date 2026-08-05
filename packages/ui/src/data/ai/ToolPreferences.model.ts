import type { ToolMeta, ToolMode } from "../chat/types";

export const MODE_CYCLE: ToolMode[] = ["auto", "ask", "off", "on"];

export const MODE_LABEL: Record<ToolMode, string> = {
  on: "On",
  auto: "Auto",
  ask: "Ask",
  off: "Off",
};

export const MODE_DESCRIPTION: Record<ToolMode, string> = {
  on: "Always allow this tool to run automatically.",
  auto: "Use the backend's default permission policy.",
  ask: "Ask before running this tool.",
  off: "Hide this tool from the model.",
};

export type BadgeMode = ToolMode | "mixed";

export const BADGE_LABEL: Record<BadgeMode, string> = {
  ...MODE_LABEL,
  mixed: "Mixed",
};

export const BADGE_DESCRIPTION: Record<BadgeMode, string> = {
  ...MODE_DESCRIPTION,
  mixed: "Members have different permissions.",
};

export type ToolPreferenceEntry = {
  key: string;
  label: string;
  group: string;
  tool: ToolMeta;
  defaultPermission: ToolMode;
};

export const NO_PARENT = "\u0000no-parent";

export type ToolSubGroup = {
  parent: string;
  entries: ToolPreferenceEntry[];
};

export type ToolGroup = {
  group: string;
  entries: ToolPreferenceEntry[];
  subGroups: ToolSubGroup[];
};

export function groupedToolEntries(tools: ToolMeta[]): ToolGroup[] {
  const groups: Record<string, ToolPreferenceEntry[]> = {};
  for (const tool of tools) {
    const group = tool.group ?? "Tools";
    const entry: ToolPreferenceEntry = {
      key: tool.name,
      label: tool.label || tool.name,
      group,
      tool,
      defaultPermission: tool.defaultPermission ?? "auto",
    };
    (groups[group] ??= []).push(entry);
  }
  return Object.entries(groups)
    .map(([group, entries]) => buildToolGroup(group, entries))
    .sort((a, b) => a.group.localeCompare(b.group));
}

function buildToolGroup(
  group: string,
  entries: ToolPreferenceEntry[],
): ToolGroup {
  const byParent: Record<string, ToolPreferenceEntry[]> = {};
  for (const entry of entries) {
    const parent = entry.tool.parent?.trim() || NO_PARENT;
    (byParent[parent] ??= []).push(entry);
  }
  const subGroups = Object.entries(byParent)
    .map(([parent, subEntries]) => ({
      parent,
      entries: [...subEntries].sort((a, b) => a.label.localeCompare(b.label)),
    }))
    .sort(compareSubGroups);
  return {
    group,
    entries: [...entries].sort((a, b) => a.label.localeCompare(b.label)),
    subGroups,
  };
}

function compareSubGroups(a: ToolSubGroup, b: ToolSubGroup): number {
  if (a.parent === NO_PARENT) return b.parent === NO_PARENT ? 0 : -1;
  if (b.parent === NO_PARENT) return 1;
  return a.parent.localeCompare(b.parent);
}

export function groupedToolEntriesWithPreferences(
  tools: ToolMeta[],
  value: Record<string, ToolMode>,
): ToolGroup[] {
  const groups = groupedToolEntries(tools);
  const known = new Set(tools.map((tool) => tool.name));
  const customEntries = Object.entries(value).flatMap(([name, mode]) => {
    const normalizedMode = normalizeToolMode(mode);
    if (known.has(name) || !normalizedMode) return [];
    return [
      {
        key: name,
        label: name,
        group: "Custom",
        tool: {
          name,
          label: name,
          group: "Custom",
          defaultPermission: normalizedMode,
        },
        defaultPermission: normalizedMode,
      },
    ];
  });
  if (customEntries.length === 0) return groups;
  return [...groups, buildToolGroup("Custom", customEntries)];
}

function normalizeToolMode(value: string): ToolMode | undefined {
  switch (value.trim().toLowerCase()) {
    case "on":
    case "enabled":
      return "on";
    case "auto":
      return "auto";
    case "ask":
      return "ask";
    case "off":
    case "disabled":
      return "off";
    default:
      return undefined;
  }
}

export function entryMode(
  entry: ToolPreferenceEntry,
  value: Record<string, ToolMode>,
): ToolMode {
  return normalizeToolMode(value[entry.key] ?? "") ?? entry.defaultPermission;
}

export function groupToolMode(
  entries: ToolPreferenceEntry[],
  value: Record<string, ToolMode>,
): ToolMode {
  return entries.reduce<ToolMode>(
    (mode, entry) => mostRestrictiveMode(mode, entryMode(entry, value)),
    "on",
  );
}

export function commonMode(
  entries: ToolPreferenceEntry[],
  value: Record<string, ToolMode>,
): BadgeMode {
  const first = entries[0];
  if (!first) return "mixed";
  const firstMode = entryMode(first, value);
  return entries.every((entry) => entryMode(entry, value) === firstMode)
    ? firstMode
    : "mixed";
}

export function nextMode(mode: ToolMode): ToolMode {
  const current = MODE_CYCLE.indexOf(mode);
  return MODE_CYCLE[((current >= 0 ? current : 0) + 1) % MODE_CYCLE.length]!;
}

function mostRestrictiveMode(a: ToolMode, b: ToolMode): ToolMode {
  return modeRank(a) >= modeRank(b) ? a : b;
}

function modeRank(mode: ToolMode): number {
  switch (mode) {
    case "on":
      return 0;
    case "auto":
      return 1;
    case "ask":
      return 2;
    case "off":
      return 3;
  }
}
