import type {
  AISpecRuntimeSetup,
  AISpecRuntimeSpec,
} from "./SpecRuntimeEditor.model";
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

type RuntimePresetCheckout = Pick<
  NonNullable<AISpecRuntimeSetup["checkout"]>,
  "mode" | "depth"
> & {
  worktree?: Pick<
    NonNullable<NonNullable<AISpecRuntimeSetup["checkout"]>["worktree"]>,
    "mode" | "keep" | "uncommitted" | "ignored"
  >;
};

export type RuntimePresetSetup = Pick<AISpecRuntimeSetup, "envVars"> & {
  checkout?: RuntimePresetCheckout;
};

export type RuntimePresetSpec = Pick<
  AISpecRuntimeSpec,
  | "model"
  | "mode"
  | "sandbox"
  | "temperature"
  | "effort"
  | "noCache"
  | "fallbacks"
  | "budget"
  | "memory"
  | "permissions"
  | "toolPolicy"
> & { setup?: RuntimePresetSetup };

export type RuntimePreset = {
  id: string;
  name: string;
  description?: string;
  scope: RuntimeProfileScope;
  spec: RuntimePresetSpec;
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

export type ResolvedRuntimeSpec = {
  spec: AISpecRuntimeSpec;
  constraints: RuntimeProfileConstraints;
  trace: RuntimeResolutionLayer[];
};

export type ResolvedRuntimeProfile = {
  resolved: ResolvedRuntimeSpec;
  tools: ToolMeta[];
  permissions: Record<string, ToolPolicy>;
  permissionSupport: Record<string, RuntimePermissionSupport>;
  effectivePolicy: PermissionPolicy;
};

const PRESET_SPEC_FIELDS = new Set([
  "model",
  "mode",
  "sandbox",
  "temperature",
  "effort",
  "noCache",
  "fallbacks",
  "budget",
  "memory",
  "permissions",
  "toolPolicy",
  "setup",
]);
const PRESET_SETUP_FIELDS = new Set(["envVars", "checkout"]);
const PRESET_CHECKOUT_FIELDS = new Set(["mode", "depth", "worktree"]);
const PRESET_WORKTREE_FIELDS = new Set([
  "mode",
  "keep",
  "uncommitted",
  "ignored",
]);

export function projectRuntimePresetSpec(
  spec: AISpecRuntimeSpec,
): RuntimePresetSpec {
  const projected = pickAllowed(spec, PRESET_SPEC_FIELDS);
  if (spec.setup) {
    const setup = pickAllowed(spec.setup, PRESET_SETUP_FIELDS);
    if (spec.setup.checkout) {
      const checkout = pickAllowed(spec.setup.checkout, PRESET_CHECKOUT_FIELDS);
      if (spec.setup.checkout.worktree) {
        checkout.worktree = pickAllowed(
          spec.setup.checkout.worktree,
          PRESET_WORKTREE_FIELDS,
        );
      }
      setup.checkout = checkout;
    }
    projected.setup = setup;
  }
  return projected as RuntimePresetSpec;
}

export function assertRuntimePresetSpec(
  spec: RuntimePresetSpec,
  path: string,
): void {
  assertRecord(spec, path);
  assertAllowedKeys(spec, PRESET_SPEC_FIELDS, path);
  if (spec.setup === undefined) return;
  assertRecord(spec.setup, `${path}.setup`);
  assertAllowedKeys(spec.setup, PRESET_SETUP_FIELDS, `${path}.setup`);
  const checkout = spec.setup.checkout;
  if (checkout !== undefined) {
    assertRecord(checkout, `${path}.setup.checkout`);
    assertAllowedKeys(
      checkout,
      PRESET_CHECKOUT_FIELDS,
      `${path}.setup.checkout`,
    );
    if (checkout.worktree !== undefined) {
      assertRecord(checkout.worktree, `${path}.setup.checkout.worktree`);
      assertAllowedKeys(
        checkout.worktree,
        PRESET_WORKTREE_FIELDS,
        `${path}.setup.checkout.worktree`,
      );
    }
  }
}

function pickAllowed(value: object, allowed: Set<string>) {
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => allowed.has(key))
      .map(([key, item]) => [key, structuredClone(item)]),
  );
}

function assertRecord(value: unknown, path: string): asserts value is object {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`runtime preset field "${path}" must be an object`);
  }
}

function assertAllowedKeys(
  value: object,
  allowed: Set<string>,
  path: string,
): void {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      throw new Error(`runtime preset field "${path}.${key}" is not allowed`);
    }
  }
}
