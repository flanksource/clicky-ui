import type { ToolMeta } from "../../chat/types";
import {
  normalizeMCPPermissions,
  normalizeResourcePolicies,
  normalizeToolPolicies,
  type AISpecRuntimeMCPPermissions,
  type AISpecRuntimePermissionCatalog,
  type AISpecRuntimePermissionCatalogItem,
  type AISpecRuntimeResourcePolicies,
  type AISpecRuntimeToolPolicies,
  type AISpecRuntimeValue,
  type SpecResourceMode,
  type SpecToolPolicy,
} from "../SpecRuntimeEditor.model";

export type PermissionDomain = "tools" | "mcp" | "plugins" | "skills";
export type PermissionListMode = SpecToolPolicy | SpecResourceMode;

export type PermissionListEntry = {
  id: string;
  label: string;
  group: string;
  domain: PermissionDomain;
  mode: PermissionListMode;
  description?: string | undefined;
  source?: string | undefined;
  sourcePath?: string | undefined;
};

export const TOOL_POLICY_MODES: SpecToolPolicy[] = [
  "auto",
  "ask",
  "allow",
  "deny",
];
export const RESOURCE_MODES: SpecResourceMode[] = ["enabled", "disabled"];

const TOOL_POLICY_LABEL: Record<SpecToolPolicy, string> = {
  auto: "Auto",
  ask: "Ask",
  allow: "Allow",
  deny: "Deny",
};
const RESOURCE_MODE_LABEL: Record<SpecResourceMode, string> = {
  enabled: "Enabled",
  disabled: "Disabled",
};

export function buildPermissionCatalog(
  catalog: AISpecRuntimePermissionCatalog | undefined,
  tools: ToolMeta[],
): Required<AISpecRuntimePermissionCatalog> {
  return {
    tools:
      catalog?.tools ??
      tools.map((tool) => {
        const item: AISpecRuntimePermissionCatalogItem = {
          id: tool.name,
          label: tool.label || tool.name,
          defaultMode: toolDefaultPolicy(tool.defaultPermission),
        };
        if (tool.group) item.group = tool.group;
        if (tool.description) item.description = tool.description;
        return item;
      }),
    mcp: catalog?.mcp ?? [],
    plugins: catalog?.plugins ?? [],
    skills: catalog?.skills ?? [],
  };
}

export function buildPermissionEntries(
  catalog: Required<AISpecRuntimePermissionCatalog>,
  toolPolicies: AISpecRuntimeToolPolicies,
  mcp: AISpecRuntimeMCPPermissions,
  pluginModes: AISpecRuntimeResourcePolicies,
  skillModes: AISpecRuntimeResourcePolicies,
): PermissionListEntry[] {
  return [
    ...buildToolPermissionEntries(catalog.tools, toolPolicies),
    ...buildResourcePermissionEntries(
      "mcp",
      catalog.mcp,
      mcpPermissionModes(mcp),
      mcp.servers,
      mcp.disabled ? "disabled" : "enabled",
    ),
    ...buildResourcePermissionEntries("plugins", catalog.plugins, pluginModes),
    ...buildResourcePermissionEntries("skills", catalog.skills, skillModes),
  ];
}

// Builds the entry list straight from a spec value: normalize the four policy
// maps, then merge them with the catalog.
export function specPermissionEntries(
  value: AISpecRuntimeValue,
  catalog: Required<AISpecRuntimePermissionCatalog>,
): PermissionListEntry[] {
  const skillModes = normalizeResourcePolicies(
    value.permissions?.skills,
    value.memory?.skills,
  );
  if (value.memory?.skipSkills) {
    for (const item of catalog.skills) {
      skillModes[item.id] = "disabled";
    }
    for (const id of value.memory.skills ?? []) {
      skillModes[id] = "disabled";
    }
  }
  return buildPermissionEntries(
    catalog,
    normalizeToolPolicies(value.permissions?.tools),
    normalizeMCPPermissions(value.permissions?.mcp),
    normalizeResourcePolicies(value.permissions?.plugins),
    skillModes,
  );
}

// Applies a mode to the given entries, returning the next spec value. Writing
// any skill entry migrates legacy memory.skills into permissions.skills.
export function withPermissionEntries(
  value: AISpecRuntimeValue,
  entries: PermissionListEntry[],
  mode: PermissionListMode,
): AISpecRuntimeValue {
  const nextTools: AISpecRuntimeToolPolicies = {
    ...normalizeToolPolicies(value.permissions?.tools),
  };
  let nextMCP = { ...normalizeMCPPermissions(value.permissions?.mcp) };
  const nextPlugins: AISpecRuntimeResourcePolicies = {
    ...normalizeResourcePolicies(value.permissions?.plugins),
  };
  const nextSkills: AISpecRuntimeResourcePolicies = {
    ...normalizeResourcePolicies(
      value.permissions?.skills,
      value.memory?.skills,
    ),
  };
  let touchedSkills = false;

  for (const entry of entries) {
    if (entry.domain === "tools" && isSpecToolPolicy(mode)) {
      nextTools[entry.id] = mode;
    } else if (entry.domain === "mcp" && isSpecResourceMode(mode)) {
      nextMCP = withMCPMode(nextMCP, entry.id, mode);
    } else if (entry.domain === "plugins" && isSpecResourceMode(mode)) {
      nextPlugins[entry.id] = mode;
    } else if (entry.domain === "skills" && isSpecResourceMode(mode)) {
      nextSkills[entry.id] = mode;
      touchedSkills = true;
    }
  }

  const memoryWithoutSkipSkills = { ...value.memory };
  delete memoryWithoutSkipSkills.skipSkills;
  return {
    ...value,
    permissions: {
      ...value.permissions,
      tools: nextTools,
      mcp: nextMCP,
      plugins: nextPlugins,
      skills: nextSkills,
    },
    ...(touchedSkills
      ? { memory: { ...memoryWithoutSkipSkills, skills: [] } }
      : undefined),
  };
}

export function withAddedPermission(
  value: AISpecRuntimeValue,
  domain: PermissionDomain,
  id: string,
): AISpecRuntimeValue | undefined {
  const trimmed = id.trim();
  if (!trimmed) return undefined;
  const mode: PermissionListMode = domain === "tools" ? "auto" : "enabled";
  return withPermissionEntries(
    value,
    [
      {
        id: trimmed,
        label: trimmed,
        group: permissionDomainGroup(domain),
        domain,
        mode,
      },
    ],
    mode,
  );
}

function buildToolPermissionEntries(
  items: AISpecRuntimePermissionCatalogItem[],
  policies: AISpecRuntimeToolPolicies,
) {
  const entries: PermissionListEntry[] = [];
  const seen = new Set<string>();
  const add = (
    id: string,
    item: AISpecRuntimePermissionCatalogItem | undefined,
  ) => {
    const key = id.trim();
    if (!key || seen.has(key)) return;
    seen.add(key);
    entries.push({
      id: key,
      label: item?.label || key,
      group: item?.group || "Tools",
      domain: "tools",
      mode: policies[key] ?? toolDefaultPolicy(item?.defaultMode),
      description: item?.description,
      source: item?.source,
      sourcePath: item?.sourcePath,
    });
  };
  for (const item of items) add(item.id, item);
  for (const id of Object.keys(policies)) add(id, undefined);
  return entries;
}

function buildResourcePermissionEntries(
  domain: Exclude<PermissionDomain, "tools">,
  items: AISpecRuntimePermissionCatalogItem[],
  modes: AISpecRuntimeResourcePolicies,
  extraIDs: string[] | undefined = undefined,
  defaultMode: SpecResourceMode = "enabled",
) {
  const entries: PermissionListEntry[] = [];
  const seen = new Set<string>();
  const add = (
    id: string,
    item: AISpecRuntimePermissionCatalogItem | undefined,
  ) => {
    const key = id.trim();
    if (!key || seen.has(key)) return;
    seen.add(key);
    entries.push({
      id: key,
      label: item?.label || key,
      group: item?.group || permissionDomainGroup(domain),
      domain,
      mode: modes[key] ?? resourceDefaultMode(item?.defaultMode, defaultMode),
      description: item?.description,
      source: item?.source,
      sourcePath: item?.sourcePath,
    });
  };
  for (const item of items) add(item.id, item);
  for (const id of extraIDs ?? []) add(id, undefined);
  for (const id of Object.keys(modes)) add(id, undefined);
  return entries;
}

export function groupPermissionEntries(entries: PermissionListEntry[]) {
  const groups = new Map<string, PermissionListEntry[]>();
  for (const entry of entries) {
    const group = entry.group || permissionDomainGroup(entry.domain);
    groups.set(group, [...(groups.get(group) ?? []), entry]);
  }
  return Array.from(groups.entries());
}

export function permissionGroupMode(
  entries: PermissionListEntry[],
): PermissionListMode | "mixed" {
  const first = entries[0]?.mode;
  if (!first) return "mixed";
  return entries.every((entry) => entry.mode === first) ? first : "mixed";
}

// Group-level bulk controls only make sense when the group is homogeneous:
// tool groups get the 4-state cycle, resource groups the 2-state one.
export function permissionGroupModeOptions(
  entries: PermissionListEntry[],
): readonly PermissionListMode[] {
  if (entries.length === 0) return [];
  const hasTools = entries.some((entry) => entry.domain === "tools");
  const hasResources = entries.some((entry) => entry.domain !== "tools");
  if (hasTools && hasResources) return [];
  return hasTools ? TOOL_POLICY_MODES : RESOURCE_MODES;
}

export function entryModeOptions(
  entry: PermissionListEntry,
): readonly PermissionListMode[] {
  return entry.domain === "tools" ? TOOL_POLICY_MODES : RESOURCE_MODES;
}

export function withMCPMode(
  value: AISpecRuntimeMCPPermissions,
  id: string,
  mode: SpecResourceMode,
): AISpecRuntimeMCPPermissions {
  const next: AISpecRuntimeMCPPermissions = {
    ...normalizeMCPPermissions(value),
  };
  const servers = new Set(next.servers ?? []);
  if (mode === "enabled") servers.add(id);
  if (servers.size > 0) {
    next.servers = Array.from(servers);
  } else {
    delete next.servers;
  }
  next[id] = mode;
  return next;
}

export function mcpPermissionModes(
  value: AISpecRuntimeMCPPermissions,
): AISpecRuntimeResourcePolicies {
  const out: AISpecRuntimeResourcePolicies = {};
  for (const [rawKey, rawValue] of Object.entries(value)) {
    const key = rawKey.trim();
    if (!key || key === "servers" || key === "disabled") continue;
    if (isSpecResourceMode(rawValue)) out[key] = rawValue;
  }
  return out;
}

export function toolDefaultPolicy(value: unknown): SpecToolPolicy {
  if (isSpecToolPolicy(value)) return value;
  if (value === "on") return "allow";
  if (value === "enabled") return "auto";
  if (value === "off") return "deny";
  if (value === "disabled") return "deny";
  if (value === "ask") return "ask";
  return "auto";
}

function resourceDefaultMode(
  value: unknown,
  fallback: SpecResourceMode,
): SpecResourceMode {
  return isSpecResourceMode(value) ? value : fallback;
}

export function permissionDomainGroup(domain: PermissionDomain) {
  switch (domain) {
    case "tools":
      return "Tools";
    case "mcp":
      return "MCP";
    case "plugins":
      return "Plugins";
    case "skills":
      return "Skills";
  }
}

export function permissionAddPlaceholder(domain: PermissionDomain) {
  switch (domain) {
    case "tools":
      return "Tool name";
    case "mcp":
      return "server name";
    case "plugins":
      return "/path/to/plugin";
    case "skills":
      return "$CWD/.skills";
  }
}

export function isDenyMode(mode: PermissionListMode) {
  return mode === "deny" || mode === "disabled";
}

export function permissionModeLabel(mode: PermissionListMode | "mixed") {
  if (mode === "mixed") return "Mixed";
  return isSpecToolPolicy(mode)
    ? TOOL_POLICY_LABEL[mode]
    : RESOURCE_MODE_LABEL[mode];
}

// Active-state colors per the v2 design: auto=success, ask=warning,
// allow=info, deny=error; resources keep enabled=success / disabled=muted.
export function permissionModeBadgeClass(mode: PermissionListMode | "mixed") {
  switch (mode) {
    case "auto":
    case "enabled":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300";
    case "ask":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300";
    case "allow":
      return "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300";
    case "deny":
      return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function isSpecToolPolicy(value: unknown): value is SpecToolPolicy {
  return (
    value === "auto" || value === "ask" || value === "allow" || value === "deny"
  );
}

export function isSpecResourceMode(value: unknown): value is SpecResourceMode {
  return value === "enabled" || value === "disabled";
}
