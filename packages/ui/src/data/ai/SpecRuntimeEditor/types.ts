import type {
  KeyPreview,
  SecretKind,
  SecretResource,
} from "../../../components/SecretKeySelector";
import type { StaticIconComponent } from "../../Icon";
import type { JsonSchemaObject } from "../../../components/json-schema-form-types";
import type { SpecSandboxCapability } from "../SpecRuntimeEditor.model";
import {
  UiBox,
  UiBraces,
  UiFileText,
  UiGitCommit,
  UiGitBranch,
  UiRobotAi,
  UiSealCheck,
  UiShield,
  UiTerminal,
} from "../../../icons";

/**
 * The sandbox surface a host serves alongside the spec schema (captain:
 * `GET /api/captain/ai/prompt/schema` → `sandboxes`, also
 * `GET /api/captain/sandboxes`). It is a projection of the adapter descriptor
 * table, so the editor can explain each choice and refuse invalid pairings
 * instead of failing at dispatch.
 */
export type SpecRuntimeSandboxCatalog = {
  /** The configured `sandbox.default` selector, when one is set. */
  default?: string | undefined;
  kinds?: SpecRuntimeSandboxKind[] | undefined;
  /**
   * Configured backends whose declared kind does not resolve to an adapter.
   * Reported rather than dropped, so a misconfigured backend reads as wrong
   * instead of missing — but never offered as a selectable choice.
   */
  invalid?: SpecRuntimeSandboxBackend[] | undefined;
};

export type SpecRuntimeSandboxKind = {
  kind: string;
  description?: string | undefined;
  /** Host-owned schema for a named backend's adapter-specific options. */
  configSchema?: JsonSchemaObject | undefined;
  /** True when `sandbox.default` names this bare kind. */
  default?: boolean | undefined;
  capabilities?: SpecSandboxCapability[] | undefined;
  /** Runtime modes this adapter can serve; a pairing outside it is an error. */
  modes?: string[] | undefined;
  backends?: SpecRuntimeSandboxBackend[] | undefined;
};

export type SpecRuntimeSandboxBackend = {
  name: string;
  kind?: string | undefined;
  /** True when `sandbox.default` names this backend. */
  default?: boolean | undefined;
  /** The endpoint a git-agent backend dispatches through. */
  url?: string | undefined;
  agents?: SpecRuntimeSandboxAgent[] | undefined;
  /** Why this backend cannot be selected; set only on `invalid` entries. */
  error?: string | undefined;
};

export type SpecRuntimeSandboxAgent = {
  name: string;
  /** "enrolled", or "pending until <expiry>" for an unclaimed join token. */
  status?: string | undefined;
  /** The host has every transport-specific credential needed to run here. */
  dispatchable: boolean;
  /** Safe diagnostic for a non-dispatchable agent; never a credential path. */
  dispatchIssue?: string | undefined;
};

export type SpecRuntimeSecretSelectorConfig = {
  loadResources: (kind: SecretKind) => Promise<SecretResource[]>;
  loadKeyPreview: (kind: SecretKind, name: string) => Promise<KeyPreview[]>;
  strict?: boolean | undefined;
  allowLiteral?: boolean | undefined;
};

export type SpecSectionId =
  | "model"
  | "prompt"
  | "workspace"
  | "sandbox"
  | "permissions"
  | "environment"
  | "verify"
  | "commit"
  | "cli";

export type SpecSectionMeta = {
  id: SpecSectionId;
  label: string;
  hint: string;
  icon: StaticIconComponent;
  iconClassName?: string | undefined;
};

// Rail/nav order; section numbers ("01"…) derive from the index. The "cli"
// section only renders when the host supplies a cliOptions schema.
export const SPEC_RUNTIME_SECTIONS: SpecSectionMeta[] = [
  {
    id: "model",
    label: "Model",
    hint: "Which model runs, how it reasons, what it loads, and its budget ceiling.",
    icon: UiRobotAi,
    iconClassName: "text-indigo-500",
  },
  {
    id: "prompt",
    label: "Prompt",
    hint: "Overrides layered on top of the base agent prompt.",
    icon: UiFileText,
    iconClassName: "text-primary",
  },
  {
    id: "workspace",
    label: "Workspace",
    hint: "Where the agent checks out code and runs.",
    icon: UiGitBranch,
    iconClassName: "text-sky-500",
  },
  // Adjacent to Workspace on purpose: a sandbox declaring `isolate-workspace`
  // materializes its own tree, so it conflicts with a worktree or checkout set
  // in the section directly above.
  {
    id: "sandbox",
    label: "Sandbox",
    hint: "What confines the run, and where it executes.",
    icon: UiBox,
    iconClassName: "text-amber-500",
  },
  {
    id: "permissions",
    label: "Permissions",
    hint: "Tool, MCP, and plugin access layered over the selected posture.",
    icon: UiShield,
    iconClassName: "text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "environment",
    label: "Environment",
    hint: "Variables and secrets injected before the run.",
    icon: UiBraces,
    iconClassName: "text-amber-600 dark:text-amber-400",
  },
  {
    id: "verify",
    label: "Verify",
    hint: "How the work is checked before finalization.",
    icon: UiSealCheck,
    iconClassName: "text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "commit",
    label: "Commit",
    hint: "Whether passing work is committed, previewed, or left as changes.",
    icon: UiGitCommit,
    iconClassName: "text-violet-600 dark:text-violet-400",
  },
  {
    id: "cli",
    label: "CLI flags",
    hint: "Extra interactive CLI flags passed straight to the agent binary.",
    icon: UiTerminal,
  },
];
