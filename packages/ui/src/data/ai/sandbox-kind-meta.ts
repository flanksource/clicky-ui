import {
  UiBox,
  UiGitBranch,
  UiRobotAi,
  UiShieldCheck,
  UiShieldSlash,
} from "../../icons";
import type { StaticIconComponent } from "../Icon";

type SandboxKindMeta = {
  label: string;
  icon: StaticIconComponent;
  description?: string | undefined;
  iconClassName?: string | undefined;
  activeClassName?: string | undefined;
};

const SANDBOX_KIND_META: Record<string, SandboxKindMeta> = {
  srt: {
    label: "Sandbox Runtime",
    icon: UiShieldCheck,
  },
  container: {
    label: "Container",
    icon: UiBox,
  },
  off: {
    label: "Off",
    description: "Provider restrictions and approval prompts disabled",
    icon: UiShieldSlash,
    iconClassName: "text-rose-600 dark:text-rose-400",
    activeClassName:
      "border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/40",
  },
  native: {
    label: "Native",
    description: "Translate one policy to the provider's native sandbox",
    icon: UiShieldCheck,
    iconClassName: "text-emerald-600 dark:text-emerald-400",
    activeClassName:
      "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40",
  },
  docker: {
    label: "Docker",
    description: "Run in a configured container backend",
    icon: UiBox,
    iconClassName: "text-amber-600 dark:text-amber-400",
    activeClassName:
      "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40",
  },
  "git-agent": {
    label: "Git Agent",
    description: "Dispatch work to an enrolled agent through Git",
    icon: UiGitBranch,
    iconClassName: "text-sky-600 dark:text-sky-400",
    activeClassName:
      "border-sky-300 bg-sky-50 dark:border-sky-800 dark:bg-sky-950/40",
  },
};

export function sandboxKindMeta(kind: string): SandboxKindMeta {
  return SANDBOX_KIND_META[kind] ?? { label: kind, icon: UiRobotAi };
}
