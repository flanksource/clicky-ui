import type {
  KeyPreview,
  SecretKind,
  SecretResource,
} from "../../../components/SecretKeySelector";
import type { StaticIconComponent } from "../../Icon";
import {
  UiBraces,
  UiFileText,
  UiGitCommit,
  UiGitBranch,
  UiRobotAi,
  UiSealCheck,
  UiShield,
  UiTerminal,
} from "../../../icons";

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
    hint: "Which model runs, how hard it reasons, and its budget ceiling.",
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
  {
    id: "permissions",
    label: "Permissions",
    hint: "What the agent may do without asking. Overrides the preset above.",
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

export function sectionNumber(id: SpecSectionId): string {
  const index = SPEC_RUNTIME_SECTIONS.findIndex((section) => section.id === id);
  return String(index + 1).padStart(2, "0");
}
