import type {
  AISpecRuntimeSetup,
  AISpecRuntimeSpec,
  PermissionPolicy,
  ToolMeta,
  ToolPolicy,
} from "@flanksource/clicky-ui/ai";

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

type RuntimePresetConnectionReference = { connection?: string };

export type RuntimePresetSetup = Pick<AISpecRuntimeSetup, "envVars"> & {
  connections?: Pick<
    NonNullable<AISpecRuntimeSetup["connections"]>,
    "fromConfigItem" | "eksPodIdentity" | "serviceAccount"
  > & {
    aws?: RuntimePresetConnectionReference;
    azure?: RuntimePresetConnectionReference;
    gcp?: RuntimePresetConnectionReference;
    kubernetes?: RuntimePresetConnectionReference;
  };
  checkout?: RuntimePresetCheckout;
};

export type RuntimePresetSpec = Pick<
  AISpecRuntimeSpec,
  | "model"
  | "backend"
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

export type RuntimeProfileRecord = {
  id: string;
  name: string;
  description?: string;
  spec: AISpecRuntimeSpec;
  presets: string[];
};

export type RuntimeResolutionLayer = {
  id: string;
  name: string;
  description?: string;
  scope: RuntimeProfileScope;
  source: "preset" | "profile";
  spec: AISpecRuntimeSpec;
};

export type RuntimeProfileResolveRequest = {
  profile: RuntimeProfileRecord;
  presets: RuntimePreset[];
};

export type ResolvedRuntimeProfile = {
  resolved: {
    spec: AISpecRuntimeSpec;
    trace: RuntimeResolutionLayer[];
  };
  tools: ToolMeta[];
  permissions: Record<string, ToolPolicy>;
  effectivePolicy: PermissionPolicy;
};
