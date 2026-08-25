import type { ChatBudgetConfig } from "../chat/types";
import {
  normalizeToolPolicyRules,
  type PermissionPolicy,
} from "../chat/tool-policy";

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

/**
 * Sandbox capabilities an adapter may declare. Mirrors captain's
 * registry.SandboxCapability: the editor reads these to decide what to offer —
 * an agent picker needs `remote-exec`, and `isolate-workspace` conflicts with a
 * worktree or setup checkout.
 */
export const SPEC_SANDBOX_CAPABILITIES = [
  "wrap-command",
  "remote-exec",
  "isolate-workspace",
  "egress-proxy",
] as const;
export type SpecSandboxCapability = (typeof SPEC_SANDBOX_CAPABILITIES)[number];

export const SPEC_WORKTREE_MODES = ["none", "new", "existing"] as const;
export type SpecWorktreeMode = (typeof SPEC_WORKTREE_MODES)[number];

export const SPEC_CLONE_MODES = ["clone", "skip"] as const;
export type SpecCloneMode = (typeof SPEC_CLONE_MODES)[number];

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

// The lifecycle boundary a commit fires on, mirroring captain's api.CommitPhase:
// "turn" after every loop iteration, "agent" once the generate/verify loop ends,
// "run" after the worktree is merged away.
export const SPEC_COMMIT_PHASES = ["turn", "agent", "run"] as const;
export type SpecCommitPhase = (typeof SPEC_COMMIT_PHASES)[number];

export const SPEC_COMMIT_MODES = ["commit", "fixup", "amend"] as const;
export type SpecCommitMode = (typeof SPEC_COMMIT_MODES)[number];

export const SPEC_COMMIT_CONDITIONS = [
  "always",
  "onSuccess",
  "onVerify",
] as const;
export type SpecCommitCondition = (typeof SPEC_COMMIT_CONDITIONS)[number];

export const SPEC_COMMIT_STAGES = ["worktree", "changed"] as const;
export type SpecCommitStage = (typeof SPEC_COMMIT_STAGES)[number];

export const SPEC_COMMIT_GATES = ["none", "cheap", "full"] as const;
export type SpecCommitGates = (typeof SPEC_COMMIT_GATES)[number];

export const SPEC_SCHEMA_STRICTNESS = ["warning", "error", "retry"] as const;
export type SpecSchemaStrictness = (typeof SPEC_SCHEMA_STRICTNESS)[number];

export type AISpecRuntimePrompt = {
  user?: string;
  system?: string;
  appendSystem?: string;
  schemaJSON?: unknown;
  schemaStrictness?: SpecSchemaStrictness | "";
  attachments?: AISpecRuntimeAttachment[];
};

export type AISpecRuntimeAttachment = {
  id?: string;
  path?: string;
  url?: string;
  filename?: string;
  mediaType?: string;
  size?: number;
  sha256?: string;
};

export type AISpecRuntimeModelFallback = {
  model?: string;
  id?: string;
  backend?: string;
  mode?: string;
  temperature?: number;
  effort?: string;
  noCache?: boolean;
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

/**
 * Bounds what a dispatched run may touch. Mirrors captain's api.SandboxPolicy;
 * zero values inherit the backend's configured policy.
 */
export type AISpecRuntimeSandboxPolicy = {
  /** Path allow/deny list, gitignore syntax with `!` negating. */
  paths?: string[];
  /** Bound on submit cycles per task. */
  maxAttempts?: number;
};

/**
 * The object form of captain's api.SandboxRef. `backend` names a configured
 * sandbox backend or a bare adapter kind; `agent` pins one enrolled agent of a
 * git-agent backend.
 */
export type AISpecRuntimeSandbox = {
  backend?: string;
  agent?: string;
  policy?: AISpecRuntimeSandboxPolicy;
};

export type AISpecRuntimeSpec = {
  model?: string;
  id?: string;
  backend?: string;
  mode?: string;
  /**
   * Sandbox the run executes under. Accepts a bare selector or the object form,
   * exactly as api.SandboxRef marshals: a ref carrying only a backend
   * round-trips as a scalar so `sandbox: git-agent` in a .prompt is not
   * rewritten into a mapping on save.
   */
  sandbox?: string | AISpecRuntimeSandbox;
  temperature?: number;
  effort?: string;
  noCache?: boolean;
  fallbacks?: AISpecRuntimeModelFallback[];
  prompt?: AISpecRuntimePrompt;
  budget?: AISpecRuntimeBudget;
  memory?: AISpecRuntimeMemory;
  permissions?: AISpecRuntimePermissions;
  /** Ordered, last-match-wins Captain tool authority rules. */
  toolPolicy?: PermissionPolicy;
  setup?: AISpecRuntimeSetup;
  workflow?: AISpecRuntimeWorkflow;
  sessionId?: string;
  /** Extra cmux CLI args (api.Spec.cliArgs), keyed by option json name. */
  cliArgs?: Record<string, unknown>;
};

export type AISpecRuntimeEnvVarSource = {
  secretKeyRef?: { name?: string; key?: string };
  configMapKeyRef?: { name?: string; key?: string };
  serviceAccount?: string;
  helmRef?: { name?: string; key?: string };
  onePassword?: string;
};

export type AISpecRuntimeEnvVar = {
  name?: string;
  value?: string;
  valueFrom?: string | AISpecRuntimeEnvVarSource;
};

export type AISpecRuntimeConnections = {
  fromConfigItem?: string;
  eksPodIdentity?: boolean;
  serviceAccount?: boolean;
  aws?: {
    connection?: string;
    accessKey?: AISpecRuntimeEnvVar;
    secretKey?: AISpecRuntimeEnvVar;
    sessionToken?: AISpecRuntimeEnvVar;
    assumeRole?: string;
    region?: string;
    endpoint?: string;
    skipTLSVerify?: boolean;
  };
  gcp?: {
    connection?: string;
    credentials?: AISpecRuntimeEnvVar;
    endpoint?: string;
    project?: string;
    skipTLSVerify?: boolean;
  };
  azure?: {
    connection?: string;
    clientID?: AISpecRuntimeEnvVar;
    clientSecret?: AISpecRuntimeEnvVar;
    tenantID?: string;
  };
  kubernetes?: {
    connection?: string;
    kubeconfig?: AISpecRuntimeEnvVar;
    eks?: Record<string, unknown>;
    gke?: Record<string, unknown>;
    cnrm?: Record<string, unknown>;
  };
};

export type AISpecRuntimeSetup = {
  cwd?: string;
  baseDir?: string;
  dotenv?: string[];
  envVars?: AISpecRuntimeEnvVar[];
  connections?: AISpecRuntimeConnections;
  checkout?: {
    mode?: SpecCheckoutMode | "";
    url?: string;
    path?: string;
    connection?: string;
    ref?: string;
    depth?: number;
    since?: string;
    worktree?: {
      mode?: SpecWorktreeMode | "";
      prefix?: string;
      base?: string;
      path?: string;
      keep?: boolean;
      uncommitted?: SpecCloneMode | "";
      ignored?: SpecCloneMode | "";
    };
    dirty?: {
      stash?: SpecStashMode | "";
      since?: string;
    };
  };
};

export type AISpecRuntimeVerify = {
  fixture?: string;
  scope?: SpecVerifyScope | "";
  maxIterations?: number;
};

// Mirrors captain's api.Commit: one commit policy keyed to a lifecycle phase.
// Every field is optional because an omitted field means "captain's default",
// which is why an empty stanza is still meaningful — see compactCommits.
export type AISpecRuntimeCommit = {
  on?: SpecCommitPhase | "";
  mode?: SpecCommitMode | "";
  when?: SpecCommitCondition | "";
  message?: string;
  anchor?: string;
  squash?: boolean;
  base?: string;
  stage?: SpecCommitStage | "";
  gates?: SpecCommitGates | "";
  dryRun?: boolean;
};

// Mirrors captain's api.Workflow (verify + commits) so the SpecRuntimeEditor's
// Verify/Commit sections round-trip through the spec frontmatter. Unlike the
// prior client-only shape, this is part of the compacted spec.
export type AISpecRuntimeWorkflow = {
  verify?: AISpecRuntimeVerify;
  commits?: AISpecRuntimeCommit[];
};

export type AISpecRuntimeValue = AISpecRuntimeSpec;

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
  const mode = cleanString(value.mode);
  if (mode) spec.mode = mode;
  if (value.temperature != null && Number.isFinite(value.temperature)) {
    spec.temperature = value.temperature;
  }
  const effort = cleanString(value.effort);
  if (effort) spec.effort = effort;
  if (value.noCache) spec.noCache = true;
  const fallbacks = compactFallbacks(value.fallbacks);
  if (fallbacks) spec.fallbacks = fallbacks;

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
  const toolPolicy = normalizeToolPolicyRules(value.toolPolicy);
  if (toolPolicy.length > 0) spec.toolPolicy = toolPolicy;
  const setup = compactSetup(value.setup);
  if (setup) spec.setup = setup;
  const workflow = compactWorkflow(value.workflow);
  if (workflow) spec.workflow = workflow;
  const sessionId = cleanString(value.sessionId);
  if (sessionId) spec.sessionId = sessionId;
  const sandbox = compactSandbox(value.sandbox);
  if (sandbox !== undefined) spec.sandbox = sandbox;
  if (value.cliArgs && hasKeys(value.cliArgs)) spec.cliArgs = value.cliArgs;
  return spec;
}

/**
 * Narrows a sandbox ref to what the Go side will accept, and collapses it back
 * to the scalar form when only a backend is set — the same rule as
 * api.SandboxRef.isScalar. Emitting `{backend: "git-agent"}` for a prompt
 * written as `sandbox: git-agent` would rewrite the user's frontmatter on every
 * save, so the shorthand has to survive the round-trip.
 *
 * An overrides-only ref (agent/policy with no backend) resolves to nothing and
 * is dropped: api.SandboxRef.Validate rejects it outright.
 */
function compactSandbox(
  value: string | AISpecRuntimeSandbox | undefined,
): string | AISpecRuntimeSandbox | undefined {
  if (value == null) return undefined;
  if (typeof value === "string") {
    return cleanString(value) || undefined;
  }
  const backend = cleanString(value.backend);
  if (!backend) return undefined;
  const agent = cleanString(value.agent);
  const policy = compactSandboxPolicy(value.policy);
  if (!agent && !policy) return backend;
  const sandbox: AISpecRuntimeSandbox = { backend };
  if (agent) sandbox.agent = agent;
  if (policy) sandbox.policy = policy;
  return sandbox;
}

function compactSandboxPolicy(
  value: AISpecRuntimeSandboxPolicy | undefined,
): AISpecRuntimeSandboxPolicy | undefined {
  if (!value) return undefined;
  const policy: AISpecRuntimeSandboxPolicy = {};
  const paths = value.paths
    ?.map((path) => cleanString(path))
    .filter((path) => path !== "");
  if (paths?.length) policy.paths = paths;
  // Validate rejects a negative bound, and 0 means "inherit the backend's".
  if (
    value.maxAttempts != null &&
    Number.isFinite(value.maxAttempts) &&
    value.maxAttempts > 0
  ) {
    policy.maxAttempts = Math.floor(value.maxAttempts);
  }
  return hasKeys(policy) ? policy : undefined;
}

function compactWorkflow(
  value: AISpecRuntimeWorkflow | undefined,
): AISpecRuntimeWorkflow | undefined {
  if (!value) return undefined;
  const workflow: AISpecRuntimeWorkflow = {};
  const verify = compactVerify(value.verify);
  if (verify) workflow.verify = verify;
  const commits = compactCommits(value.commits);
  if (commits) workflow.commits = commits;
  return hasKeys(workflow) ? workflow : undefined;
}

function compactVerify(
  value: AISpecRuntimeVerify | undefined,
): AISpecRuntimeVerify | undefined {
  if (!value) return undefined;
  const verify: AISpecRuntimeVerify = {};
  const fixture = cleanString(value.fixture);
  if (fixture) verify.fixture = fixture;
  if (value.scope === "all" || value.scope === "changed")
    verify.scope = value.scope;
  if (
    value.maxIterations != null &&
    Number.isFinite(value.maxIterations) &&
    value.maxIterations > 0
  ) {
    verify.maxIterations = Math.trunc(value.maxIterations);
  }
  return hasKeys(verify) ? verify : undefined;
}

// Presence in the list is what turns committing on, so an empty stanza survives
// compaction: `commits: [{}]` reads as "one commit at the end of the run with
// every default". Committing nothing is an absent list, not a stanza of falses.
function compactCommits(
  value: AISpecRuntimeCommit[] | undefined,
): AISpecRuntimeCommit[] | undefined {
  if (!value?.length) return undefined;
  return value.map(compactCommit);
}

function compactCommit(value: AISpecRuntimeCommit): AISpecRuntimeCommit {
  const commit: AISpecRuntimeCommit = {};
  const on = pickEnum(SPEC_COMMIT_PHASES, value.on);
  if (on) commit.on = on;
  const mode = pickEnum(SPEC_COMMIT_MODES, value.mode);
  if (mode) commit.mode = mode;
  const when = pickEnum(SPEC_COMMIT_CONDITIONS, value.when);
  if (when) commit.when = when;
  const message = cleanString(value.message);
  if (message) commit.message = message;
  const anchor = cleanString(value.anchor);
  if (anchor) commit.anchor = anchor;
  // Squash is a *bool in captain: `squash: false` is the instruction to keep the
  // fixup chain for review, so it cannot be pruned the way a plain flag is.
  if (value.squash != null) commit.squash = value.squash;
  const base = cleanString(value.base);
  if (base) commit.base = base;
  const stage = pickEnum(SPEC_COMMIT_STAGES, value.stage);
  if (stage) commit.stage = stage;
  const gates = pickEnum(SPEC_COMMIT_GATES, value.gates);
  if (gates) commit.gates = gates;
  if (value.dryRun) commit.dryRun = true;
  return commit;
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
  const schemaJSON = compactJSONValue(value.schemaJSON);
  if (schemaJSON !== undefined) prompt.schemaJSON = schemaJSON;
  if (
    value.schemaStrictness === "warning" ||
    value.schemaStrictness === "error" ||
    value.schemaStrictness === "retry"
  ) {
    prompt.schemaStrictness = value.schemaStrictness;
  }
  const attachments = value.attachments
    ?.map((attachment) => compactAttachment(attachment))
    .filter(
      (attachment): attachment is AISpecRuntimeAttachment =>
        attachment !== undefined,
    );
  if (attachments && attachments.length > 0) prompt.attachments = attachments;
  return hasKeys(prompt) ? prompt : undefined;
}

function compactAttachment(
  value: AISpecRuntimeAttachment,
): AISpecRuntimeAttachment | undefined {
  const attachment: AISpecRuntimeAttachment = {};
  for (const key of [
    "id",
    "path",
    "url",
    "filename",
    "mediaType",
    "sha256",
  ] as const) {
    const text = cleanString(value[key]);
    if (text) attachment[key] = text;
  }
  if (value.size != null && Number.isFinite(value.size) && value.size >= 0) {
    attachment.size = value.size;
  }
  return attachment.id || attachment.path || attachment.url
    ? attachment
    : undefined;
}

function compactFallbacks(
  value: AISpecRuntimeModelFallback[] | undefined,
): AISpecRuntimeModelFallback[] | undefined {
  if (!value) return undefined;
  const out: AISpecRuntimeModelFallback[] = [];
  for (const item of value) {
    const model = cleanString(item.model);
    if (!model) continue;
    const fallback: AISpecRuntimeModelFallback = { model };
    const id = cleanString(item.id);
    if (id) fallback.id = id;
    const backend = cleanString(item.backend);
    if (backend) fallback.backend = backend;
    const mode = cleanString(item.mode);
    if (mode) fallback.mode = mode;
    if (item.temperature != null && Number.isFinite(item.temperature)) {
      fallback.temperature = item.temperature;
    }
    const effort = cleanString(item.effort);
    if (effort) fallback.effort = effort;
    if (item.noCache) fallback.noCache = true;
    out.push(fallback);
  }
  return out.length > 0 ? out : undefined;
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
  if (value.connections && hasKeys(value.connections)) {
    setup.connections = structuredClone(value.connections);
  }
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
  if (kind === "op" && rest) return { onePassword: source };
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
  const onePassword = cleanString(value.onePassword);
  if (onePassword) source.onePassword = onePassword;
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
  const since = cleanString(value.since);
  if (since) checkout.since = since;

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
  if (
    value.worktree?.uncommitted === "clone" ||
    value.worktree?.uncommitted === "skip"
  ) {
    worktree.uncommitted = value.worktree.uncommitted;
  }
  if (
    value.worktree?.ignored === "clone" ||
    value.worktree?.ignored === "skip"
  ) {
    worktree.ignored = value.worktree.ignored;
  }
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
  const dirtySince = cleanString(value.dirty?.since);
  if (dirtySince) dirty.since = dirtySince;
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

function compactJSONValue(value: unknown) {
  if (value == null) return undefined;
  if (typeof value === "string") {
    const raw = value.trim();
    if (!raw) return undefined;
    try {
      return JSON.parse(raw);
    } catch {
      return undefined;
    }
  }
  return value;
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

// Narrows an editor-held string (which may be "" while unset) to a member of an
// enum, dropping anything the Go side would reject.
function pickEnum<T extends string>(
  options: readonly T[],
  value: string | undefined,
): T | undefined {
  return options.find((option) => option === value);
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
