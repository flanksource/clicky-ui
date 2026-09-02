import type {
  AISpecRuntimePermissionCatalog,
  AISpecRuntimePermissionCatalogItem,
} from "../../../packages/ui/src/data/ai/SpecRuntimeEditor.model";
import type {
  RuntimeCatalogFamily,
  RuntimePermissionCapabilities,
  RuntimePermissionSupport,
  RuntimePermissionSupportKind,
} from "../../../packages/ui/src/data/runtime/runtime-mode";

export type RuntimePermissionTarget = {
  provider: string;
  mode: string;
};

export async function loadRuntimeProfileRuntimeCatalog(
  runtimesURL: string,
): Promise<RuntimeCatalogFamily[]> {
  const response = await fetch(runtimesURL);
  if (!response.ok) {
    throw new Error(
      `Captain runtime catalog request failed with ${response.status} ${response.statusText}`,
    );
  }
  const document: unknown = await response.json();
  return assertRuntimeCatalog(document);
}

export async function loadRuntimeProfilePermissionCatalog(
  permissionURL: string,
  target: RuntimePermissionTarget,
): Promise<AISpecRuntimePermissionCatalog> {
  const url = new URL(permissionURL);
  url.search = new URLSearchParams(target).toString();
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(
      `Captain permission catalog request failed with ${response.status} ${response.statusText}`,
    );
  }
  return assertPermissionCatalog(await response.json());
}

function assertPermissionCatalog(
  value: unknown,
): AISpecRuntimePermissionCatalog {
  if (!isRecord(value)) {
    throw new Error("Captain permission catalog must be an object");
  }
  for (const domain of ["tools", "mcp", "plugins", "skills"] as const) {
    if (!Array.isArray(value[domain])) {
      throw new Error(`Captain permission catalog.${domain} must be an array`);
    }
    for (const [index, item] of value[domain].entries()) {
      assertPermissionCatalogItem(item, `${domain}[${index}]`);
    }
  }
  return value as AISpecRuntimePermissionCatalog;
}

function assertPermissionCatalogItem(
  value: unknown,
  context: string,
): asserts value is AISpecRuntimePermissionCatalogItem {
  if (!isRecord(value)) {
    throw new Error(`Captain permission ${context} must be an object`);
  }
  requiredString(value.id, `Captain permission ${context} id`);
}

function assertRuntimeCatalog(value: unknown): RuntimeCatalogFamily[] {
  if (!Array.isArray(value)) {
    throw new Error("Captain runtime catalog must be an array");
  }
  if (value.length === 0) {
    throw new Error("Captain runtime catalog contains no runtime families");
  }
  for (const [familyIndex, candidate] of value.entries()) {
    if (!isRecord(candidate)) {
      throw new Error(
        `runtime family at index ${familyIndex} must be an object`,
      );
    }
    const family = requiredString(
      candidate.family,
      `runtime family at index ${familyIndex}`,
    );
    const provider = requiredString(
      candidate.provider,
      `runtime family "${family}" provider`,
    );
    requiredString(
      candidate.catalogPrefix,
      `runtime family "${family}" catalogPrefix`,
    );
    if (!Array.isArray(candidate.modes) || candidate.modes.length === 0) {
      throw new Error(`runtime family "${family}" contains no modes`);
    }
    for (const [modeIndex, mode] of candidate.modes.entries()) {
      if (!isRecord(mode)) {
        throw new Error(
          `runtime family "${family}" mode ${modeIndex} must be an object`,
        );
      }
      const runtimeMode = requiredString(
        mode.mode,
        `runtime family "${family}" mode ${modeIndex}`,
      );
      const runtime = `runtime provider "${provider}" mode "${runtimeMode}"`;
      assertPermissionCapabilities(mode.permissions, runtime);
      assertRuntimeSchema(mode.schema, runtime);
    }
  }
  return value as RuntimeCatalogFamily[];
}

function assertRuntimeSchema(value: unknown, runtime: string): void {
  if (!isRecord(value)) {
    throw new Error(`${runtime} is missing its JSON schema`);
  }
  if (value.type !== "object" || !isRecord(value.properties)) {
    throw new Error(`${runtime} JSON schema must be an object with properties`);
  }
}

function assertPermissionCapabilities(
  value: unknown,
  runtime: string,
): asserts value is RuntimePermissionCapabilities {
  if (!isRecord(value)) {
    throw new Error(`${runtime} is missing permission capabilities`);
  }
  for (const field of ["modes", "toolPolicies", "resources"] as const) {
    if (!isRecord(value[field])) {
      throw new Error(`${runtime} permissions.${field} must be an object`);
    }
  }
  const modes = value.modes as Record<string, unknown>;
  for (const [mode, support] of Object.entries(modes)) {
    assertPermissionSupport(support, `${runtime} permission posture "${mode}"`);
  }
}

function assertPermissionSupport(
  value: unknown,
  context: string,
): asserts value is RuntimePermissionSupport {
  const kinds: RuntimePermissionSupportKind[] = [
    "native",
    "approximated",
    "requires-broker",
    "unsupported",
  ];
  if (
    !isRecord(value) ||
    !kinds.includes(value.kind as RuntimePermissionSupportKind)
  ) {
    throw new Error(`${context} has an invalid support kind`);
  }
}

function requiredString(value: unknown, context: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${context} must be a non-empty string`);
  }
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
