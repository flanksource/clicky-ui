import type { AISpecRuntimeSpec } from "./SpecRuntimeEditor.model";
import type { PermissionPolicy } from "../chat/tool-policy";
import type { ToolMeta, ToolPolicy } from "../chat/types";
import type { RuntimePermissionSupport } from "../runtime/runtime-mode";

export const RUNTIME_PROFILE_SCOPES = [
  "global",
  "context",
  "surface",
  "user",
] as const;

export type RuntimeProfileScope = (typeof RUNTIME_PROFILE_SCOPES)[number];

export type RuntimePresetSpec = AISpecRuntimeSpec;
/** @deprecated Use the setup field on RuntimePresetSpec. */
export type RuntimePresetSetup = NonNullable<RuntimePresetSpec["setup"]>;

export type RuntimePreset = {
  id: string;
  name: string;
  description?: string;
  scope: RuntimeProfileScope;
  spec: RuntimePresetSpec;
  /** Reserved for nested preset resolution; authoring UI is intentionally deferred. */
  presets?: string[];
};

export type RuntimeProfile = {
  id: string;
  name: string;
  description?: string;
  spec: AISpecRuntimeSpec;
  presets: string[];
};

export type RuntimeResolutionLayerSource =
  | "preset"
  | "profile"
  | "prompt"
  | "request";

export type RuntimeResolutionLayer = {
  id?: string;
  name: string;
  description?: string;
  scope: RuntimeProfileScope;
  source: RuntimeResolutionLayerSource;
  spec: AISpecRuntimeSpec;
  constraints: RuntimeProfileConstraints;
};

export type RuntimeProfileConstraints = {
  models?: string[];
  limits?: {
    maxInputTokens?: number;
    budget?: AISpecRuntimeSpec["budget"];
  };
  quotas?: Array<{
    name: string;
    scope: RuntimeProfileScope;
    layer: string;
    tokenLimit?: number;
    tokensUsed?: number;
    costLimitUsd?: number;
    costUsedUsd?: number;
  }>;
};

export type RuntimeProfileResolveRequest = {
  profile: RuntimeProfile;
  presets: RuntimePreset[];
};

export type RuntimePresetResolveRequest = {
  selected: string[];
  presets: RuntimePreset[];
};

export type ResolvedRuntimeSpec = {
  spec: AISpecRuntimeSpec;
  constraints: RuntimeProfileConstraints;
  trace: RuntimeResolutionLayer[];
  warnings?: string[];
};

export type ResolvedRuntimeProfile = {
  resolved: ResolvedRuntimeSpec;
  tools: ToolMeta[];
  permissions: Record<string, ToolPolicy>;
  permissionSupport: Record<string, RuntimePermissionSupport>;
  effectivePolicy: PermissionPolicy;
};

export type ResolvedRuntimePreset = ResolvedRuntimeProfile;

export function projectRuntimePresetSpec(
  spec: AISpecRuntimeSpec,
): RuntimePresetSpec {
  return structuredClone(spec);
}

export function assertRuntimePresetSpec(
  spec: RuntimePresetSpec,
  path: string,
): void {
  assertRecord(spec, path);
}

function assertRecord(value: unknown, path: string): asserts value is object {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`runtime preset field "${path}" must be an object`);
  }
}
