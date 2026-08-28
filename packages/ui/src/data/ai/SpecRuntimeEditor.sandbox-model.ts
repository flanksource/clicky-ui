export const SPEC_PERMISSION_MODES = [
  "default",
  "acceptEdits",
  "auto",
  "bypassPermissions",
  "dontAsk",
  "plan",
] as const;

export type SpecPermissionMode = (typeof SPEC_PERMISSION_MODES)[number];

export const SPEC_SANDBOX_MODES = [
  "off",
  "native",
  "docker",
  "git-agent",
] as const;

export type SpecSandboxMode = (typeof SPEC_SANDBOX_MODES)[number];
export type SpecSandboxFilesystemAccess = "read-only" | "workspace-write";
export type SpecSandboxNetworkAccess =
  | "disabled"
  | "restricted"
  | "unrestricted";

export type AISpecRuntimeSandboxFilesystemPolicy = {
  access?: SpecSandboxFilesystemAccess;
  writableRoots?: string[];
  readableRoots?: string[];
  deniedReadRoots?: string[];
  deniedWriteRoots?: string[];
  includeSystemTemp?: boolean;
};

export type AISpecRuntimeSandboxNetworkPolicy = {
  access?: SpecSandboxNetworkAccess;
  allowedDomains?: string[];
  deniedDomains?: string[];
  allowedUnixSockets?: string[];
  allowAllUnixSockets?: boolean;
  allowLocalBinding?: boolean;
  allowedMachServices?: string[];
  httpProxyPort?: number;
  socksProxyPort?: number;
};

export type AISpecRuntimeSandboxPolicy = {
  required?: boolean;
  filesystem?: AISpecRuntimeSandboxFilesystemPolicy;
  network?: AISpecRuntimeSandboxNetworkPolicy;
  commands?: {
    excludedFromSandbox?: string[];
    allowUnsandboxed?: boolean;
  };
  credentials?: {
    deniedFiles?: string[];
    deniedEnv?: string[];
    maskedEnv?: string[];
  };
  platform?: {
    allowAppleEvents?: boolean;
    weakerNestedIsolation?: boolean;
    weakerNetworkIsolation?: boolean;
  };
};

export type AISpecRuntimeSandboxDispatch = {
  paths?: string[];
  maxAttempts?: number;
};

export type AISpecRuntimeSandbox = {
  mode?: SpecSandboxMode;
  approval?: SpecPermissionMode;
  backend?: string;
  agent?: string;
  policy?: AISpecRuntimeSandboxPolicy;
  dispatch?: AISpecRuntimeSandboxDispatch;
};

export function compactRuntimeSandbox(
  value: string | AISpecRuntimeSandbox | undefined,
): string | AISpecRuntimeSandbox | undefined {
  if (value == null) return undefined;
  if (typeof value === "string") {
    const raw = value.trim();
    return raw ? sandboxMode(raw) : undefined;
  }
  assertKnownKeys(
    value,
    ["mode", "approval", "backend", "agent", "policy", "dispatch"],
    "sandbox",
  );
  const configured = Object.values(value).some(
    (item) => item != null && item !== "",
  );
  if (!value.mode) {
    if (configured)
      throw new Error(
        "sandbox.mode is required when sandbox settings are configured",
      );
    return undefined;
  }
  const mode = sandboxMode(value.mode);
  const approval = permissionMode(value.approval);
  const backend = cleanString(value.backend);
  const agent = cleanString(value.agent);
  const policy = compactNativePolicy(value.policy);
  const dispatch = compactDispatch(value.dispatch);

  if (mode === "off") {
    rejectSandboxFields(mode, { approval, backend, agent, policy, dispatch });
    return mode;
  }
  if (mode === "native") {
    rejectSandboxFields(mode, { backend, agent, dispatch });
    return compactSandboxObject({
      mode,
      ...(approval ? { approval } : {}),
      ...(policy ? { policy } : {}),
    });
  }
  if (mode === "docker") {
    rejectSandboxFields(mode, { agent, policy, dispatch });
    return compactSandboxObject({
      mode,
      ...(approval ? { approval } : {}),
      ...(backend ? { backend } : {}),
    });
  }
  rejectSandboxFields(mode, { policy });
  return compactSandboxObject({
    mode,
    ...(approval ? { approval } : {}),
    ...(backend ? { backend } : {}),
    ...(agent ? { agent } : {}),
    ...(dispatch ? { dispatch } : {}),
  });
}

function compactSandboxObject(
  value: AISpecRuntimeSandbox,
): string | AISpecRuntimeSandbox {
  const entries = Object.entries(value).filter(
    ([, item]) => item !== undefined,
  );
  if (entries.length === 1) return value.mode!;
  return Object.fromEntries(entries) as AISpecRuntimeSandbox;
}

function compactNativePolicy(
  value: AISpecRuntimeSandboxPolicy | undefined,
): AISpecRuntimeSandboxPolicy | undefined {
  if (!value) return undefined;
  assertKnownKeys(
    value,
    [
      "required",
      "filesystem",
      "network",
      "commands",
      "credentials",
      "platform",
    ],
    "sandbox.policy",
  );
  const policy: AISpecRuntimeSandboxPolicy = {};
  if (value.required != null) policy.required = value.required;
  const filesystem = compactFilesystem(value.filesystem);
  if (filesystem) policy.filesystem = filesystem;
  const network = compactNetwork(value.network);
  if (network) policy.network = network;
  const commands = compactBooleanAndLists(
    value.commands,
    ["excludedFromSandbox"],
    ["allowUnsandboxed"],
    "sandbox.policy.commands",
  );
  if (commands) policy.commands = commands;
  const credentials = compactBooleanAndLists(
    value.credentials,
    ["deniedFiles", "deniedEnv", "maskedEnv"],
    [],
    "sandbox.policy.credentials",
  );
  if (credentials) policy.credentials = credentials;
  const platform = compactBooleanAndLists(
    value.platform,
    [],
    ["allowAppleEvents", "weakerNestedIsolation", "weakerNetworkIsolation"],
    "sandbox.policy.platform",
  );
  if (platform) policy.platform = platform;
  return hasKeys(policy) ? policy : undefined;
}

function compactFilesystem(
  value: AISpecRuntimeSandboxFilesystemPolicy | undefined,
): AISpecRuntimeSandboxFilesystemPolicy | undefined {
  if (!value) return undefined;
  assertKnownKeys(
    value,
    [
      "access",
      "writableRoots",
      "readableRoots",
      "deniedReadRoots",
      "deniedWriteRoots",
      "includeSystemTemp",
    ],
    "sandbox.policy.filesystem",
  );
  const filesystem = compactBooleanAndLists(
    value,
    ["writableRoots", "readableRoots", "deniedReadRoots", "deniedWriteRoots"],
    ["includeSystemTemp"],
    "sandbox.policy.filesystem",
    ["access"],
  ) as AISpecRuntimeSandboxFilesystemPolicy | undefined;
  const access = value.access;
  if (access && access !== "read-only" && access !== "workspace-write") {
    throw new Error(
      `sandbox.policy.filesystem.access ${JSON.stringify(access)} is invalid`,
    );
  }
  if (access) return { ...filesystem, access };
  return filesystem;
}

function compactNetwork(
  value: AISpecRuntimeSandboxNetworkPolicy | undefined,
): AISpecRuntimeSandboxNetworkPolicy | undefined {
  if (!value) return undefined;
  assertKnownKeys(
    value,
    [
      "access",
      "allowedDomains",
      "deniedDomains",
      "allowedUnixSockets",
      "allowAllUnixSockets",
      "allowLocalBinding",
      "allowedMachServices",
      "httpProxyPort",
      "socksProxyPort",
    ],
    "sandbox.policy.network",
  );
  const network = (compactBooleanAndLists(
    value,
    [
      "allowedDomains",
      "deniedDomains",
      "allowedUnixSockets",
      "allowedMachServices",
    ],
    ["allowAllUnixSockets", "allowLocalBinding"],
    "sandbox.policy.network",
    ["access", "httpProxyPort", "socksProxyPort"],
  ) ?? {}) as AISpecRuntimeSandboxNetworkPolicy;
  if (
    value.access &&
    !["disabled", "restricted", "unrestricted"].includes(value.access)
  ) {
    throw new Error(
      `sandbox.policy.network.access ${JSON.stringify(value.access)} is invalid`,
    );
  }
  if (value.access) network.access = value.access;
  for (const key of ["httpProxyPort", "socksProxyPort"] as const) {
    const port = value[key];
    if (port == null) continue;
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error(
        `sandbox.policy.network.${key} must be between 1 and 65535`,
      );
    }
    network[key] = port;
  }
  return hasKeys(network) ? network : undefined;
}

function compactDispatch(
  value: AISpecRuntimeSandboxDispatch | undefined,
): AISpecRuntimeSandboxDispatch | undefined {
  if (!value) return undefined;
  assertKnownKeys(value, ["paths", "maxAttempts"], "sandbox.dispatch");
  const dispatch: AISpecRuntimeSandboxDispatch = {};
  const paths = cleanList(value.paths);
  if (paths) dispatch.paths = paths;
  if (value.maxAttempts != null) {
    if (!Number.isInteger(value.maxAttempts) || value.maxAttempts < 0) {
      throw new Error(
        "sandbox.dispatch.maxAttempts must be a non-negative integer",
      );
    }
    if (value.maxAttempts > 0) dispatch.maxAttempts = value.maxAttempts;
  }
  return hasKeys(dispatch) ? dispatch : undefined;
}

function compactBooleanAndLists<T extends object>(
  value: T | undefined,
  listKeys: readonly string[],
  booleanKeys: readonly string[],
  path: string,
  additionalKeys: readonly string[] = [],
): T | undefined {
  if (!value) return undefined;
  assertKnownKeys(
    value,
    [...listKeys, ...booleanKeys, ...additionalKeys],
    path,
  );
  const out: Record<string, unknown> = {};
  for (const key of listKeys) {
    const list = cleanList(
      (value as Record<string, unknown>)[key] as string[] | undefined,
    );
    if (list) out[key] = list;
  }
  for (const key of booleanKeys) {
    const item = (value as Record<string, unknown>)[key];
    if (item != null) out[key] = item;
  }
  return hasKeys(out) ? (out as T) : undefined;
}

function rejectSandboxFields(
  mode: SpecSandboxMode,
  values: Record<string, unknown>,
) {
  const field = Object.entries(values).find(
    ([, value]) => value !== undefined,
  )?.[0];
  if (field) throw new Error(`sandbox mode ${mode} does not accept ${field}`);
}

function sandboxMode(value: string): SpecSandboxMode {
  const mode = SPEC_SANDBOX_MODES.find((item) => item === value);
  if (!mode)
    throw new Error(`sandbox.mode ${JSON.stringify(value)} is invalid`);
  return mode;
}

function permissionMode(
  value: string | undefined,
): SpecPermissionMode | undefined {
  if (!value) return undefined;
  const mode = SPEC_PERMISSION_MODES.find((item) => item === value);
  if (!mode)
    throw new Error(`sandbox.approval ${JSON.stringify(value)} is invalid`);
  return mode;
}

function assertKnownKeys(value: object, keys: readonly string[], path: string) {
  const unknown = Object.keys(value).find((key) => !keys.includes(key));
  if (unknown) throw new Error(`${path}.${unknown} is not supported`);
}

function cleanList(value: string[] | undefined) {
  if (!value) return undefined;
  const items = Array.from(
    new Set(value.map((item) => item.trim()).filter(Boolean)),
  );
  return items.length > 0 ? items : undefined;
}

function cleanString(value: string | undefined) {
  return value?.trim() || undefined;
}

function hasKeys(value: object) {
  return Object.keys(value).length > 0;
}
