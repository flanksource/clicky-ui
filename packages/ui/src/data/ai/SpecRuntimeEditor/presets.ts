import type {
  AISpecRuntimeMCPPermissions,
  AISpecRuntimeMemory,
  AISpecRuntimePermissions,
  AISpecRuntimeResourcePolicies,
  AISpecRuntimeToolPolicies,
  AISpecRuntimeValue,
  SpecResourceMode,
  SpecToolPolicy,
} from "../SpecRuntimeEditor.model";
import type {
  PermissionDomain,
  PermissionListEntry,
} from "./permissions-model";

export type SpecRuntimePresetId = "edit" | "plan" | "readonly";

export type SpecRuntimePermissionSnapshot = {
  permissions: AISpecRuntimePermissions;
  memory?: AISpecRuntimeMemory | undefined;
};

export type SavedPermissionPreset = {
  id: string;
  label: string;
  snapshot: SpecRuntimePermissionSnapshot;
  updatedAt: string;
};

export type SpecRuntimePreset = {
  id: SpecRuntimePresetId;
  label: string;
  description: string;
  /** Per-tool policies applied by id. */
  policies: Record<string, SpecToolPolicy>;
  /** Fallback policy for catalog tools by group, when not named in policies. */
  groupPolicies: Record<string, SpecToolPolicy>;
  /** Fallback policy for catalog tools without an explicit or group policy. */
  defaultToolPolicy: SpecToolPolicy;
  /** Resource policies applied to MCP servers, plugins, and skills. */
  resources: Record<Exclude<PermissionDomain, "tools">, SpecResourceMode>;
};

export const SPEC_PERMISSION_PRESET_STORAGE_KEY =
  "clicky-ui:spec-runtime-editor:permission-presets:v1";

export const SPEC_RUNTIME_PRESETS: SpecRuntimePreset[] = [
  {
    id: "edit",
    label: "Edit",
    description: "Edits auto, shell and web ask.",
    policies: {
      Read: "allow",
      Edit: "auto",
      Write: "auto",
      Bash: "ask",
      WebSearch: "ask",
      WebFetch: "ask",
    },
    groupPolicies: { Files: "auto", Shell: "ask", Web: "ask" },
    defaultToolPolicy: "ask",
    resources: { mcp: "enabled", plugins: "enabled", skills: "enabled" },
  },
  {
    id: "plan",
    label: "Plan",
    description: "Read and web ask, writes off.",
    policies: {
      Read: "allow",
      Edit: "deny",
      Write: "deny",
      Bash: "deny",
      WebSearch: "ask",
      WebFetch: "ask",
    },
    groupPolicies: { Files: "deny", Shell: "deny", Web: "ask" },
    defaultToolPolicy: "deny",
    resources: { mcp: "disabled", plugins: "disabled", skills: "enabled" },
  },
  {
    id: "readonly",
    label: "Read-only",
    description: "No writes, shell, network, or resources.",
    policies: {
      Read: "ask",
      Edit: "deny",
      Write: "deny",
      Bash: "deny",
      WebSearch: "deny",
      WebFetch: "deny",
    },
    groupPolicies: { Files: "deny", Shell: "deny", Web: "deny" },
    defaultToolPolicy: "deny",
    resources: { mcp: "disabled", plugins: "disabled", skills: "disabled" },
  },
];

// Applies a built-in preset as a complete permission-tree snapshot for the
// current catalog. Manual resource/tool edits are intentionally replaced.
export function applySpecPreset(
  value: AISpecRuntimeValue,
  presetId: SpecRuntimePresetId,
  entries: PermissionListEntry[],
): AISpecRuntimeValue {
  const preset = SPEC_RUNTIME_PRESETS.find((item) => item.id === presetId);
  if (!preset) {
    throw new Error(`unknown spec runtime preset ${JSON.stringify(presetId)}`);
  }
  return applyPermissionPresetSnapshot(
    value,
    buildBuiltinPermissionSnapshot(preset, entries),
  );
}

export function applyPermissionPresetSnapshot(
  value: AISpecRuntimeValue,
  snapshot: SpecRuntimePermissionSnapshot,
): AISpecRuntimeValue {
  const { permissions: _permissions, memory: _memory, ...rest } = value;
  const next: AISpecRuntimeValue = {
    ...rest,
    permissions: clonePermissions(snapshot.permissions),
  };
  const memory = cloneMemory(snapshot.memory);
  return memory ? { ...next, memory } : next;
}

export function buildPermissionPresetSnapshot(
  value: AISpecRuntimeValue,
  entries: PermissionListEntry[],
): SpecRuntimePermissionSnapshot {
  const permissions: AISpecRuntimePermissions = {};
  const tools: AISpecRuntimeToolPolicies = {};
  const mcp: AISpecRuntimeMCPPermissions = {};
  const plugins: AISpecRuntimeResourcePolicies = {};
  const skills: AISpecRuntimeResourcePolicies = {};
  const mcpServers: string[] = [];

  for (const entry of entries) {
    if (entry.domain === "tools") {
      tools[entry.id] = entry.mode as SpecToolPolicy;
    } else if (entry.domain === "mcp") {
      const mode = entry.mode as SpecResourceMode;
      mcp[entry.id] = mode;
      if (mode === "enabled") mcpServers.push(entry.id);
    } else if (entry.domain === "plugins") {
      plugins[entry.id] = entry.mode as SpecResourceMode;
    } else if (entry.domain === "skills") {
      skills[entry.id] = entry.mode as SpecResourceMode;
    }
  }

  if (Object.keys(tools).length > 0) permissions.tools = tools;
  if (Object.keys(mcp).length > 0 || mcpServers.length > 0) {
    if (mcpServers.length > 0) mcp.servers = mcpServers;
    permissions.mcp = mcp;
  }
  if (Object.keys(plugins).length > 0) permissions.plugins = plugins;
  if (Object.keys(skills).length > 0) permissions.skills = skills;

  const memory = presetMemory(value.memory);
  return memory ? { permissions, memory } : { permissions };
}

// A preset is active when the normalized current permission tree exactly
// matches the normalized built-in snapshot for the current catalog.
export function activeSpecPreset(
  value: AISpecRuntimeValue,
  entries: PermissionListEntry[],
): SpecRuntimePresetId | undefined {
  const current = canonicalSnapshot(
    buildPermissionPresetSnapshot(value, entries),
  );
  return SPEC_RUNTIME_PRESETS.find(
    (preset) =>
      canonicalSnapshot(buildBuiltinPermissionSnapshot(preset, entries)) ===
      current,
  )?.id;
}

export function savedPresetMatches(
  value: AISpecRuntimeValue,
  entries: PermissionListEntry[],
  preset: SavedPermissionPreset,
) {
  return (
    canonicalSnapshot(buildPermissionPresetSnapshot(value, entries)) ===
    canonicalSnapshot(preset.snapshot)
  );
}

function buildBuiltinPermissionSnapshot(
  preset: SpecRuntimePreset,
  entries: PermissionListEntry[],
): SpecRuntimePermissionSnapshot {
  const permissions: AISpecRuntimePermissions = {};
  const tools: AISpecRuntimeToolPolicies = {};
  const mcp: AISpecRuntimeMCPPermissions = {};
  const plugins: AISpecRuntimeResourcePolicies = {};
  const skills: AISpecRuntimeResourcePolicies = {};
  const mcpServers: string[] = [];

  for (const entry of entries) {
    if (entry.domain === "tools") {
      tools[entry.id] = presetPolicyFor(preset, entry);
    } else if (entry.domain === "mcp") {
      const mode = preset.resources.mcp;
      mcp[entry.id] = mode;
      if (mode === "enabled") mcpServers.push(entry.id);
    } else if (entry.domain === "plugins") {
      plugins[entry.id] = preset.resources.plugins;
    } else if (entry.domain === "skills") {
      skills[entry.id] = preset.resources.skills;
    }
  }

  if (Object.keys(tools).length > 0) permissions.tools = tools;
  if (Object.keys(mcp).length > 0 || mcpServers.length > 0) {
    if (mcpServers.length > 0) mcp.servers = mcpServers;
    permissions.mcp = mcp;
  }
  if (Object.keys(plugins).length > 0) permissions.plugins = plugins;
  if (Object.keys(skills).length > 0) permissions.skills = skills;
  return { permissions };
}

function presetPolicyFor(
  preset: SpecRuntimePreset,
  entry: PermissionListEntry,
): SpecToolPolicy {
  return (
    preset.policies[entry.id] ??
    preset.groupPolicies[entry.group] ??
    preset.defaultToolPolicy
  );
}

function presetMemory(
  value: AISpecRuntimeMemory | undefined,
): AISpecRuntimeMemory | undefined {
  if (!value) return undefined;
  const memory: AISpecRuntimeMemory = {};
  if (value.skipProject) memory.skipProject = true;
  if (value.skipUser) memory.skipUser = true;
  if (value.skipHooks) memory.skipHooks = true;
  if (value.skipMemory) memory.skipMemory = true;
  if (value.bare) memory.bare = true;
  return Object.keys(memory).length > 0 ? memory : undefined;
}

function clonePermissions(
  value: AISpecRuntimePermissions,
): AISpecRuntimePermissions {
  const permissions: AISpecRuntimePermissions = {};
  if (value.tools)
    permissions.tools = { ...(value.tools as AISpecRuntimeToolPolicies) };
  if (value.mcp) {
    const mcp: AISpecRuntimeMCPPermissions = {};
    for (const [key, mode] of Object.entries(value.mcp)) {
      if (Array.isArray(mode)) mcp[key] = [...mode];
      else mcp[key] = mode;
    }
    permissions.mcp = mcp;
  }
  if (value.plugins && !Array.isArray(value.plugins)) {
    permissions.plugins = { ...value.plugins };
  } else if (Array.isArray(value.plugins)) {
    permissions.plugins = [...value.plugins];
  }
  if (value.skills && !Array.isArray(value.skills)) {
    permissions.skills = { ...value.skills };
  } else if (Array.isArray(value.skills)) {
    permissions.skills = [...value.skills];
  }
  return permissions;
}

function cloneMemory(
  value: AISpecRuntimeMemory | undefined,
): AISpecRuntimeMemory | undefined {
  const memory = presetMemory(value);
  return memory ? { ...memory } : undefined;
}

function canonicalSnapshot(snapshot: SpecRuntimePermissionSnapshot) {
  return JSON.stringify(sortValue(snapshot));
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return [...value].sort();
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value).sort()) {
      const item = (value as Record<string, unknown>)[key];
      if (item !== undefined) out[key] = sortValue(item);
    }
    return out;
  }
  return value;
}
