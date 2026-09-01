import type {
  RuntimeCatalogFamily,
  RuntimePermissionCapabilities,
  RuntimePermissionSupport,
  RuntimePermissionSupportKind,
} from "../../../packages/ui/src/data/runtime/runtime-mode";

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

function assertRuntimeCatalog(value: unknown): RuntimeCatalogFamily[] {
  if (!Array.isArray(value)) {
    throw new Error("Captain runtime catalog must be an array");
  }
  if (value.length === 0) {
    throw new Error("Captain runtime catalog contains no runtime families");
  }
  for (const [familyIndex, candidate] of value.entries()) {
    if (!isRecord(candidate)) {
      throw new Error(`runtime family at index ${familyIndex} must be an object`);
    }
    const family = requiredString(candidate.family, `runtime family at index ${familyIndex}`);
    requiredString(candidate.provider, `runtime family "${family}" provider`);
    requiredString(candidate.catalogPrefix, `runtime family "${family}" catalogPrefix`);
    if (!Array.isArray(candidate.modes) || candidate.modes.length === 0) {
      throw new Error(`runtime family "${family}" contains no modes`);
    }
    for (const [modeIndex, mode] of candidate.modes.entries()) {
      if (!isRecord(mode)) {
        throw new Error(`runtime family "${family}" mode ${modeIndex} must be an object`);
      }
      requiredString(mode.mode, `runtime family "${family}" mode ${modeIndex}`);
      const backend = requiredString(
        mode.backend,
        `runtime family "${family}" mode ${modeIndex} backend`,
      );
      assertPermissionCapabilities(mode.permissions, backend);
      assertRuntimeSchema(mode.schema, backend);
    }
  }
  return value as RuntimeCatalogFamily[];
}

function assertRuntimeSchema(value: unknown, backend: string): void {
  if (!isRecord(value)) {
    throw new Error(`runtime mode "${backend}" is missing its JSON schema`);
  }
  if (value.type !== "object" || !isRecord(value.properties)) {
    throw new Error(
      `runtime mode "${backend}" JSON schema must be an object with properties`,
    );
  }
}

function assertPermissionCapabilities(
  value: unknown,
  backend: string,
): asserts value is RuntimePermissionCapabilities {
  if (!isRecord(value)) {
    throw new Error(`runtime mode "${backend}" is missing permission capabilities`);
  }
  for (const field of ["modes", "toolPolicies", "resources"] as const) {
    if (!isRecord(value[field])) {
      throw new Error(`runtime mode "${backend}" permissions.${field} must be an object`);
    }
  }
  const modes = value.modes as Record<string, unknown>;
  for (const [mode, support] of Object.entries(modes)) {
    assertPermissionSupport(support, `runtime mode "${backend}" permission posture "${mode}"`);
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
  if (!isRecord(value) || !kinds.includes(value.kind as RuntimePermissionSupportKind)) {
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
