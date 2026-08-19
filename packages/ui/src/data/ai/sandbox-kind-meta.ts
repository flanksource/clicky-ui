import { UiBox, UiGitBranch, UiRobotAi, UiShieldCheck } from "../../icons";
import type { StaticIconComponent } from "../Icon";

type SandboxKindMeta = {
  label: string;
  icon: StaticIconComponent;
};

const SANDBOX_KIND_META: Record<string, SandboxKindMeta> = {
  container: { label: "Container", icon: UiBox },
  srt: { label: "Sandbox Runtime", icon: UiShieldCheck },
  "git-agent": { label: "Git agent", icon: UiGitBranch },
};

export function sandboxKindMeta(kind: string): SandboxKindMeta {
  return SANDBOX_KIND_META[kind] ?? { label: kind, icon: UiRobotAi };
}
