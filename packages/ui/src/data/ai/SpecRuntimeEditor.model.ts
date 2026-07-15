import type { ChatBudgetConfig } from "../chat/types";

export const SPEC_PERMISSION_MODES = [
  "default",
  "acceptEdits",
  "auto",
  "bypassPermissions",
  "dontAsk",
  "plan",
] as const;

export type SpecPermissionMode = (typeof SPEC_PERMISSION_MODES)[number];

export const SPEC_TOOL_POLICIES = ["auto", "ask", "allow", "deny"] as const;
export type SpecToolPolicy = (typeof SPEC_TOOL_POLICIES)[number];

export const SPEC_RESOURCE_MODES = ["enabled", "disabled"] as const;
export type SpecResourceMode = (typeof SPEC_RESOURCE_MODES)[number];

export const SPEC_CHECKOUT_MODES = ["none", "remote", "local"] as const;
export type SpecCheckoutMode = (typeof SPEC_CHECKOUT_MODES)[number];

export const SPEC_WORKTREE_MODES = ["none", "new", "existing"] as const;
export type SpecWorktreeMode = (typeof SPEC_WORKTREE_MODES)[number];

export const SPEC_STASH_MODES = [
  "none",
  "untracked",
  "unstaged",
  "staged",
  "all",
] as const;
export type SpecStashMode = (typeof SPEC_STASH_MODES)[number];

export const SPEC_VERIFY_SCOPES = ["all", "changed"] as const;
export type SpecVerifyScope = (typeof SPEC_VERIFY_SCOPES)[number];

export type AISpecRuntimePrompt = {
  user?: string;
  system?: string;
  appendSystem?: string;
  source?: string;
  metadata?: Record<string, string>;
};

export type AISpecRuntimeMemory = {
  skills?: string[];
  skipProject?: boolean;
  skipUser?: boolean;
  skipSkills?: boolean;
  skipHooks?: boolean;
  skipMemory?: boolean;
  bare?: boolean;
};

export type AISpecRuntimeToolPolicies = Record<string, SpecToolPolicy>;

export type AISpecRuntimeLegacyToolPermissions = {
  allow?: string[];
  deny?: string[];
  modes?: Record<string, string>;
};

export type AISpecRuntimeResourcePolicies = Record<string, SpecResourceMode>;

export type AISpecRuntimeMCPPermissions = {
  disabled?: boolean;
  servers?: string[];
  [name: string]: SpecResourceMode | string[] | boolean | undefined;
};

export type AISpecRuntimePermissions = {
  mode?: SpecPermissionMode | "";
  presets?: string[];
  tools?: AISpecRuntimeToolPolicies | AISpecRuntimeLegacyToolPermissions;
  mcp?: AISpecRuntimeMCPPermissions;
  plugins?: AISpecRuntimeResourcePolicies | string[];
  skills?: AISpecRuntimeResourcePolicies | string[];
};

export type AISpecRuntimePermissionCatalogItem = {
  id: string;
  label?: string;
  group?: string;
  description?: string;
  source?: string;
  sourcePath?: string;
  configured?: boolean;
  available?: boolean;
  defaultMode?: string;
};

export type AISpecRuntimePermissionCatalog = {
  tools?: AISpecRuntimePermissionCatalogItem[];
  mcp?: AISpecRuntimePermissionCatalogItem[];
  plugins?: AISpecRuntimePermissionCatalogItem[];
  skills?: AISpecRuntimePermissionCatalogItem[];
};

export type AISpecRuntimeBudget = ChatBudgetConfig & {
  maxTurns?: number;
  timeout?: string;
};

export type AISpecRuntimeSpec = {
  model?: string;
  id?: string;
  backend?: string;
  temperature?: number;
  effort?: string;
  noCache?: boolean;
  prompt?: AISpecRuntimePrompt;
  budget?: AISpecRuntimeBudget;
  memory?: AISpecRuntimeMemory;
  permissions?: AISpecRuntimePermissions;
  setup?: AISpecRuntimeSetup;
  sessionId?: string;
  /** Extra cmux CLI args (api.Spec.cliArgs), keyed by option json name. */
  cliArgs?: Record<string, unknown>;
};

export type AISpecRuntimeEnvVarSource = {
  secretKeyRef?: { name?: string; key?: string };
  configMapKeyRef?: { name?: string; key?: string };
  serviceAccount?: string;
  helmRef?: { name?: string; key?: string };
};

export type AISpecRuntimeEnvVar = {
  name?: string;
  value?: string;
  valueFrom?: string | AISpecRuntimeEnvVarSource;
};

export type AISpecRuntimeSetup = {
  cwd?: string;
  baseDir?: string;
  dotenv?: string[];
  envVars?: AISpecRuntimeEnvVar[];
  checkout?: {
    mode?: SpecCheckoutMode | "";
    url?: string;
    path?: string;
    connection?: string;
    ref?: string;
    depth?: number;
    worktree?: {
      mode?: SpecWorktreeMode | "";
      prefix?: string;
      base?: string;
      path?: string;
      keep?: boolean;
    };
    dirty?: {
      stash?: SpecStashMode | "";
      staged?: boolean;
      unstaged?: boolean;
      untracked?: boolean;
      since?: string;
    };
  };
};

export type AISpecRuntimeVerify = {
  commands?: string[];
  fixture?: string;
  scope?: SpecVerifyScope | "";
  maxIterations?: number;
};

export type AISpecRuntimeFinalize = {
  commit?: boolean;
  commitMessage?: string;
  dryRun?: boolean;
};

export type AISpecRuntimeLocalWorkflow = {
  verify?: {
    commands?: string[];
    fixture?: string;
    scope?: SpecVerifyScope | "";
    maxIterations?: number;
  };
  finalize?: {
    commit?: boolean;
    commitMessage?: string;
    dryRun?: boolean;
    keepWorktree?: boolean;
  };
};

export type AISpecRuntimeValue = AISpecRuntimeSpec & {
  workflow?: AISpecRuntimeLocalWorkflow;
};

export type AISpecRuntimePayload = {
  spec?: AISpecRuntimeSpec;
};

export function buildAISpecRuntimePayload(
  value: AISpecRuntimeValue,
): AISpecRuntimePayload {
  const payload: AISpecRuntimePayload = {};
  const spec = compactAISpecRuntime(value);
  if (hasKeys(spec)) payload.spec = spec;
  return payload;
}

export function compactAISpecRuntime(
  value: AISpecRuntimeValue,
): AISpecRuntimeSpec {
  const spec: AISpecRuntimeSpec = {};

  const model = cleanString(value.model);
  if (model) spec.model = model;
  const id = cleanString(value.id);
  if (id) spec.id = id;
  const backend = cleanString(value.backend);
  if (backend) spec.backend = backend;
  if (value.temperature != null && Number.isFinite(value.temperature)) {
    spec.temperature = value.temperature;
  }
  const effort = cleanString(value.effort);
  if (effort) spec.effort = effort;
  if (value.noCache) spec.noCache = true;

  const prompt = compactPrompt(value.prompt);
  if (prompt) spec.prompt = prompt;
  const budget = compactBudget(value.budget);
  if (budget) spec.budget = budget;
  const memory = compactMemory(value.memory);
  if (memory) spec.memory = memory;
  const permissions = compactPermissions(
    value.permissions,
    value.memory?.skills,
  );
  if (permissions) spec.permissions = permissions;
  const setup = compactSetup(value.setup);
  if (setup) spec.setup = setup;
  if (value.cliArgs && hasKeys(value.cliArgs)) spec.cliArgs = value.cliArgs;
  return spec;
}

function compactPrompt(
  value: AISpecRuntimePrompt | undefined,
): AISpecRuntimePrompt | undefined {
  if (!value) return undefined;
  const prompt: AISpecRuntimePrompt = {};
  const user = cleanString(value.user);
  if (user) prompt.user = user;
  const system = cleanString(value.system);
  if (system) prompt.system = system;
  const appendSystem = cleanString(value.appendSystem);
  if (appendSystem) prompt.appendSystem = appendSystem;
  const source = cleanString(value.source);
  if (source) prompt.source = source;
  const metadata = compactRecord(value.metadata);
  if (metadata) prompt.metadata = metadata;
  return hasKeys(prompt) ? prompt : undefined;
}

function compactBudget(
  value: AISpecRuntimeBudget | undefined,
): AISpecRuntimeBudget | undefined {
  if (!value) return undefined;
  const budget: AISpecRuntimeBudget = {};
  if (value.cost != null && Number.isFinite(value.cost) && value.cost > 0) {
    budget.cost = value.cost;
  }
  if (
    value.maxTokens != null &&
    Number.isFinite(value.maxTokens) &&
    value.maxTokens > 0
  ) {
    budget.maxTokens = Math.trunc(value.maxTokens);
  }
  if (
    value.maxTurns != null &&
    Number.isFinite(value.maxTurns) &&
    value.maxTurns > 0
  ) {
    budget.maxTurns = Math.trunc(value.maxTurns);
  }
  const timeout = cleanString(value.timeout);
  if (timeout) budget.timeout = timeout;
  return hasKeys(budget) ? budget : undefined;
}

function compactMemory(
  value: AISpecRuntimeMemory | undefined,
): AISpecRuntimeMemory | undefined {
  if (!value) return undefined;
  const memory: AISpecRuntimeMemory = {};
  if (value.skipProject) memory.skipProject = true;
  if (value.skipUser) memory.skipUser = true;
  if (value.skipHooks) memory.skipHooks = true;
  if (value.skipMemory) memory.skipMemory = true;
  if (value.bare) memory.bare = true;
  return hasKeys(memory) ? memory : undefined;
}

function compactPermissions(
  value: AISpecRuntimePermissions | undefined,
  legacySkills?: string[] | undefined,
): AISpecRuntimePermissions | undefined {
  if (!value && !legacySkills?.length) return undefined;
  const permissions: AISpecRuntimePermissions = {};
  if (value?.mode && value.mode !== "default") permissions.mode = value.mode;
  const presets = compactList(value?.presets);
  if (presets) permissions.presets = presets;

  const tools = compactToolPolicies(value?.tools);
  if (tools) permissions.tools = tools;

  const mcp = compactMCPPermissions(value?.mcp);
  if (mcp) permissions.mcp = mcp;

  const plugins = compactResourcePolicies(value?.plugins);
  if (plugins) permissions.plugins = plugins;
  const skills = compactResourcePolicies(value?.skills, legacySkills);
  if (skills) permissions.skills = skills;
  return hasKeys(permissions) ? permissions : undefined;
}

function compactSetup(
  value: AISpecRuntimeSetup | undefined,
): AISpecRuntimeSetup | undefined {
  if (!value) return undefined;
  const setup: AISpecRuntimeSetup = {};
  const cwd = cleanString(value.cwd);
  if (cwd) setup.cwd = cwd;
  const baseDir = cleanString(value.baseDir);
  if (baseDir) setup.baseDir = baseDir;
  const dotenv = compactList(value.dotenv);
  if (dotenv) setup.dotenv = dotenv;
  const envVars = compactEnvVars(value.envVars);
  if (envVars) setup.envVars = envVars;
  const checkout = compactSetupCheckout(value.checkout);
  if (checkout) setup.checkout = checkout;
  return hasKeys(setup) ? setup : undefined;
}

function compactEnvVars(value: AISpecRuntimeEnvVar[] | undefined) {
  if (!value) return undefined;
  const out: AISpecRuntimeEnvVar[] = [];
  for (const item of value) {
    const name = cleanString(item.name);
    if (!name) continue;
    const env: AISpecRuntimeEnvVar = { name };
    const literal = cleanString(item.value);
    const valueFrom =
      typeof item.valueFrom === "string"
        ? compactEnvVarSource(item.valueFrom)
        : compactStructuredEnvVarSource(item.valueFrom);
    if (literal) env.value = literal;
    if (valueFrom) env.valueFrom = valueFrom;
    if (env.value || env.valueFrom) out.push(env);
  }
  return out.length > 0 ? out : undefined;
}

function compactEnvVarSource(
  value: string | undefined,
): AISpecRuntimeEnvVarSource | undefined {
  const source = cleanString(value);
  if (!source) return undefined;
  const [kind, rest = ""] = source.split("://", 2);
  const [name = "", key = ""] = rest.split("/", 2).map((part) => part.trim());
  if (!name) return undefined;
  if (kind === "secret" && key) return { secretKeyRef: { name, key } };
  if (kind === "configmap" && key) return { configMapKeyRef: { name, key } };
  if (kind === "serviceaccount") return { serviceAccount: name };
  if (kind === "helm" && key) return { helmRef: { name, key } };
  return undefined;
}

function compactStructuredEnvVarSource(
  value: AISpecRuntimeEnvVarSource | undefined,
): AISpecRuntimeEnvVarSource | undefined {
  if (!value) return undefined;
  const source: AISpecRuntimeEnvVarSource = {};
  const secretName = cleanString(value.secretKeyRef?.name);
  const secretKey = cleanString(value.secretKeyRef?.key);
  if (secretName && secretKey)
    source.secretKeyRef = { name: secretName, key: secretKey };
  const configMapName = cleanString(value.configMapKeyRef?.name);
  const configMapKey = cleanString(value.configMapKeyRef?.key);
  if (configMapName && configMapKey) {
    source.configMapKeyRef = { name: configMapName, key: configMapKey };
  }
  const serviceAccount = cleanString(value.serviceAccount);
  if (serviceAccount) source.serviceAccount = serviceAccount;
  const helmName = cleanString(value.helmRef?.name);
  const helmKey = cleanString(value.helmRef?.key);
  if (helmName && helmKey) source.helmRef = { name: helmName, key: helmKey };
  return hasKeys(source) ? source : undefined;
}

function compactSetupCheckout(
  value: AISpecRuntimeSetup["checkout"] | undefined,
): NonNullable<AISpecRuntimeSetup["checkout"]> | undefined {
  if (!value) return undefined;
  const checkout: NonNullable<AISpecRuntimeSetup["checkout"]> = {};
  if (value.mode === "remote" || value.mode === "local")
    checkout.mode = value.mode;
  const url = cleanString(value.url);
  if (url) checkout.url = url;
  const path = cleanString(value.path);
  if (path) checkout.path = path;
  const connection = cleanString(value.connection);
  if (connection) checkout.connection = connection;
  const ref = cleanString(value.ref);
  if (ref) checkout.ref = ref;
  if (value.depth != null && Number.isFinite(value.depth) && value.depth > 0) {
    checkout.depth = Math.trunc(value.depth);
  }

  const worktree: NonNullable<
    NonNullable<AISpecRuntimeSetup["checkout"]>["worktree"]
  > = {};
  const worktreeMode = value.worktree?.mode;
  if (worktreeMode === "new" || worktreeMode === "existing") {
    worktree.mode = worktreeMode;
  }
  const worktreePrefix = cleanString(value.worktree?.prefix);
  if (worktreePrefix) worktree.prefix = worktreePrefix;
  const worktreeBase = cleanString(value.worktree?.base);
  if (worktreeBase) worktree.base = worktreeBase;
  const worktreePath = cleanString(value.worktree?.path);
  if (worktreePath) worktree.path = worktreePath;
  if (worktree.mode === "new" && value.worktree?.keep) worktree.keep = true;
  if (hasKeys(worktree)) checkout.worktree = worktree;

  const dirty: NonNullable<
    NonNullable<AISpecRuntimeSetup["checkout"]>["dirty"]
  > = {};
  const stash = value.dirty?.stash;
  if (
    stash === "untracked" ||
    stash === "unstaged" ||
    stash === "staged" ||
    stash === "all"
  ) {
    dirty.stash = stash;
  }
  if (value.dirty?.staged) dirty.staged = true;
  if (value.dirty?.unstaged) dirty.unstaged = true;
  if (value.dirty?.untracked) dirty.untracked = true;
  const since = cleanString(value.dirty?.since);
  if (since) dirty.since = since;
  if (hasKeys(dirty)) checkout.dirty = dirty;

  return hasKeys(checkout) ? checkout : undefined;
}

function compactToolPolicies(
  value: AISpecRuntimePermissions["tools"] | undefined,
) {
  const normalized = normalizeToolPolicies(value);
  return hasKeys(normalized) ? normalized : undefined;
}

function compactResourcePolicies(
  value: AISpecRuntimePermissions["plugins"] | undefined,
  legacyEnabled?: string[] | undefined,
) {
  const normalized = normalizeResourcePolicies(value, legacyEnabled);
  return hasKeys(normalized) ? normalized : undefined;
}

function compactMCPPermissions(
  value: AISpecRuntimeMCPPermissions | undefined,
): AISpecRuntimeMCPPermissions | undefined {
  if (!value) return undefined;
  const out: AISpecRuntimeMCPPermissions = {};
  for (const [rawKey, rawValue] of Object.entries(value)) {
    const key = rawKey.trim();
    if (!key) continue;
    if (key === "servers") {
      const servers = Array.isArray(rawValue)
        ? compactList(
            rawValue.filter((item): item is string => typeof item === "string"),
          )
        : undefined;
      if (servers) out.servers = servers;
      continue;
    }
    if (key === "disabled") {
      if (rawValue === true) out.disabled = true;
      continue;
    }
    if (isSpecResourceMode(rawValue)) out[key] = rawValue;
  }
  return hasKeys(out) ? out : undefined;
}

export function normalizeToolPolicies(
  value: AISpecRuntimePermissions["tools"] | undefined,
): AISpecRuntimeToolPolicies {
  const out: AISpecRuntimeToolPolicies = {};
  if (!value) return out;
  const legacy = value as AISpecRuntimeLegacyToolPermissions;
  for (const tool of compactList(legacy.allow) ?? []) out[tool] = "allow";
  for (const tool of compactList(legacy.deny) ?? []) out[tool] = "deny";
  for (const [rawKey, rawMode] of Object.entries(legacy.modes ?? {})) {
    const key = rawKey.trim();
    if (!key) continue;
    if (rawMode === "enabled") out[key] = "auto";
    if (rawMode === "ask") out[key] = "ask";
    if (rawMode === "disabled") out[key] = "deny";
  }
  for (const [rawKey, policy] of Object.entries(value)) {
    const key = rawKey.trim();
    if (!key || key === "allow" || key === "deny" || key === "modes") {
      continue;
    }
    if (isSpecToolPolicy(policy)) out[key] = policy;
  }
  return out;
}

export function normalizeResourcePolicies(
  value: AISpecRuntimePermissions["plugins"] | undefined,
  legacyEnabled?: string[] | undefined,
): AISpecRuntimeResourcePolicies {
  const out: AISpecRuntimeResourcePolicies = {};
  for (const id of compactList(legacyEnabled) ?? []) out[id] = "enabled";
  if (!value) return out;
  if (Array.isArray(value)) {
    for (const id of compactList(value) ?? []) out[id] = "enabled";
    return out;
  }
  for (const [rawKey, rawMode] of Object.entries(value)) {
    const key = rawKey.trim();
    if (!key) continue;
    if (isSpecResourceMode(rawMode)) out[key] = rawMode;
  }
  return out;
}

export function normalizeMCPPermissions(
  value: AISpecRuntimeMCPPermissions | undefined,
): AISpecRuntimeMCPPermissions {
  const out: AISpecRuntimeMCPPermissions = {};
  if (!value) return out;
  const servers = compactList(value.servers);
  if (servers) out.servers = servers;
  if (value.disabled) out.disabled = true;
  for (const [rawKey, rawMode] of Object.entries(value)) {
    const key = rawKey.trim();
    if (!key || key === "servers" || key === "disabled") continue;
    if (isSpecResourceMode(rawMode)) out[key] = rawMode;
  }
  return out;
}

function compactRecord(value: Record<string, string> | undefined) {
  if (!value) return undefined;
  const out: Record<string, string> = {};
  for (const [rawKey, rawValue] of Object.entries(value)) {
    const key = rawKey.trim();
    if (!key) continue;
    out[key] = rawValue;
  }
  return hasKeys(out) ? out : undefined;
}

function compactList(value: string[] | undefined) {
  if (!value) return undefined;
  const out = Array.from(
    new Set(value.map((item) => item.trim()).filter(Boolean)),
  );
  return out.length > 0 ? out : undefined;
}

function cleanString(value: string | undefined) {
  return value?.trim() ?? "";
}

function hasKeys(value: object) {
  return Object.keys(value).length > 0;
}

function isSpecToolPolicy(value: unknown): value is SpecToolPolicy {
  return (
    value === "auto" || value === "ask" || value === "allow" || value === "deny"
  );
}

function isSpecResourceMode(value: unknown): value is SpecResourceMode {
  return value === "enabled" || value === "disabled";
}
