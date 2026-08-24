import type { ToolMeta, ToolPolicy } from "../chat/types";
import { normalizeToolPolicy } from "../chat/types";
import {
  resolveToolPolicy,
  type PermissionPolicy,
  type PermissionRule,
} from "../chat/tool-policy";

export const POLICY_CYCLE: ToolPolicy[] = ["auto", "ask", "deny", "allow"];

/** On and Off stay as the control's labels — they read better on a toggle than
 *  allow/deny do. The wire vocabulary is the policy; this is presentation. */
export const POLICY_LABEL: Record<ToolPolicy, string> = {
  allow: "On",
  auto: "Auto",
  ask: "Ask",
  deny: "Off",
};

export const POLICY_DESCRIPTION: Record<ToolPolicy, string> = {
  allow: "Always allow this tool to run automatically.",
  auto: "Use the backend's default permission policy.",
  ask: "Ask before running this tool.",
  deny: "Hide this tool from the model.",
};

export type BadgePolicy = ToolPolicy | "mixed";

export const BADGE_LABEL: Record<BadgePolicy, string> = {
  ...POLICY_LABEL,
  mixed: "Mixed",
};

export const BADGE_DESCRIPTION: Record<BadgePolicy, string> = {
  ...POLICY_DESCRIPTION,
  mixed: "Members have different permissions.",
};

export type ToolPreferenceEntry = {
  key: string;
  label: string;
  group: string;
  tool: ToolMeta;
  defaultPermission: ToolPolicy;
};

export const NO_PARENT = "\u0000no-parent";

export type ToolSubGroup = {
  parent: string;
  entries: ToolPreferenceEntry[];
};

/** A toggle in the popover emits one rule rather than writing a mode per tool.
 *  Which control was used is the thing worth recording: a group toggle means
 *  "this whole family", so it keeps applying to tools that arrive later, while
 *  writing every current member's name would silently stop at today's catalog.
 *
 *  Rules are held in specificity order — group, then group+parent, then name —
 *  so a per-tool toggle beats the group toggle above it however they were
 *  clicked. Position, not a precedence number, is what encodes that. */
const RULE_RANKS: ((rule: PermissionRule) => boolean)[] = [
  (rule) => rule.name === undefined && rule.parent === undefined,
  (rule) => rule.name === undefined,
  () => true,
];

function ruleRank(rule: PermissionRule): number {
  return RULE_RANKS.findIndex((matches) => matches(rule));
}

function ruleKey(patterns: PermissionRule["name"]): string {
  if (patterns === undefined) return "";
  return (typeof patterns === "string" ? [patterns] : patterns).join(",");
}

function sameSubject(a: PermissionRule, b: PermissionRule): boolean {
  return (
    ruleKey(a.name) === ruleKey(b.name) &&
    ruleKey(a.group) === ruleKey(b.group) &&
    ruleKey(a.parent) === ruleKey(b.parent)
  );
}

/** Adds one toggle's rule to the user's list, replacing any earlier rule for the
 *  same subject in place so re-toggling a control does not grow the list, and
 *  keeping the list in specificity order. */
export function withUserRule(
  rules: PermissionPolicy,
  rule: PermissionRule,
): PermissionPolicy {
  const replaced = rules.map((existing) =>
    sameSubject(existing, rule) ? rule : existing,
  );
  const next = replaced.includes(rule) ? replaced : [...replaced, rule];
  return [...next].sort((a, b) => ruleRank(a) - ruleRank(b));
}

/** The mode to show for each tool: the user's own rules over the surface's, then
 *  what the catalog says about the tool, then the fallback.
 *
 *  `auto` from a rule is a refusal to decide rather than an answer, so it hands
 *  the tool back to its catalog default — the same reading the server applies. */
export function effectiveToolPolicies({
  tools,
  surfacePolicy,
  userRules,
  fallback,
}: {
  tools: ToolMeta[];
  surfacePolicy?: PermissionPolicy | undefined;
  userRules?: PermissionPolicy | undefined;
  fallback: ToolPolicy;
}): Record<string, ToolPolicy> {
  const policy = [...(surfacePolicy ?? []), ...(userRules ?? [])];
  const resolved: Record<string, ToolPolicy> = {};
  for (const tool of tools) {
    const matched = resolveToolPolicy(policy, tool);
    resolved[tool.name] =
      (matched === "auto" ? undefined : matched) ??
      tool.defaultPermission ??
      fallback;
  }
  return resolved;
}

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
  value: Record<string, ToolPolicy>,
): ToolGroup[] {
  const groups = groupedToolEntries(tools);
  const known = new Set(tools.map((tool) => tool.name));
  const customEntries = Object.entries(value).flatMap(([name, mode]) => {
    const normalizedMode = normalizeToolPolicy(mode);
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

export function entryMode(
  entry: ToolPreferenceEntry,
  value: Record<string, ToolPolicy>,
): ToolPolicy {
  return normalizeToolPolicy(value[entry.key] ?? "") ?? entry.defaultPermission;
}

export function groupToolPolicy(
  entries: ToolPreferenceEntry[],
  value: Record<string, ToolPolicy>,
): ToolPolicy {
  return entries.reduce<ToolPolicy>(
    (mode, entry) => mostRestrictiveMode(mode, entryMode(entry, value)),
    "allow",
  );
}

export function commonMode(
  entries: ToolPreferenceEntry[],
  value: Record<string, ToolPolicy>,
): BadgePolicy {
  const first = entries[0];
  if (!first) return "mixed";
  const firstMode = entryMode(first, value);
  return entries.every((entry) => entryMode(entry, value) === firstMode)
    ? firstMode
    : "mixed";
}

export function nextMode(mode: ToolPolicy): ToolPolicy {
  const current = POLICY_CYCLE.indexOf(mode);
  return POLICY_CYCLE[((current >= 0 ? current : 0) + 1) % POLICY_CYCLE.length]!;
}

function mostRestrictiveMode(a: ToolPolicy, b: ToolPolicy): ToolPolicy {
  return modeRank(a) >= modeRank(b) ? a : b;
}

function modeRank(mode: ToolPolicy): number {
  switch (mode) {
    case "allow":
      return 0;
    case "auto":
      return 1;
    case "ask":
      return 2;
    case "deny":
      return 3;
  }
}
