import { clickyOperationsToTools } from "../../../packages/ui/src/data/chat/clickyOperationsToTools";
import type { ToolMeta } from "../../../packages/ui/src/data/chat/types";
import type {
  RuntimeCatalogFamily,
  RuntimePermissionCapabilities,
  RuntimePermissionSupport,
  RuntimePermissionSupportKind,
} from "../../../packages/ui/src/data/runtime/runtime-mode";
import type {
  OpenAPISpec,
  ResolvedOperation,
} from "../../../packages/ui/src/rpc/types";

export function runtimeProfileToolsFromSpec(spec: OpenAPISpec): ToolMeta[] {
  const operations: ResolvedOperation[] = [];
  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      operations.push({ path, method, operation });
    }
  }
  const tools = clickyOperationsToTools(operations, spec["x-clicky"]?.surfaces);
  if (tools.length === 0) {
    throw new Error(
      "the Clicky OpenAPI document contains no callable operations",
    );
  }
  return tools;
}

export async function loadRuntimeProfileToolCatalog(
  operationsURL: string,
): Promise<ToolMeta[]> {
  const response = await fetch(operationsURL);
  if (!response.ok) {
    throw new Error(
      `Gavel OpenAPI request failed with ${response.status} ${response.statusText}`,
    );
  }
  const document: unknown = await response.json();
  if (!isOpenAPISpec(document)) {
    throw new Error("Gavel OpenAPI response is missing a paths object");
  }
  return runtimeProfileToolsFromSpec(document);
}

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
    }
  }
  return value as RuntimeCatalogFamily[];
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

function isOpenAPISpec(value: unknown): value is OpenAPISpec {
  if (!value || typeof value !== "object") return false;
  const paths = (value as { paths?: unknown }).paths;
  return !!paths && typeof paths === "object" && !Array.isArray(paths);
}
