import { Icon } from "../Icon";
import { useContext, type ReactNode } from "react";
import { AgentIdentityContext, type AgentIdentityMetadata } from "./agent-identity-context";
import { UiRobotAi } from "../../icons";
import { cn } from "../../lib/utils";
import { modelProvider, shortContextModelName } from "./ContextMeter.model";
import { providerIcon, providerIconColor } from "./provider-icons";
import { effortLevelIcon, effortLevelColor, effortLevelLabel } from "./effort-icons";
import { shortSessionId } from "../ai/SessionInspector.model";

export function AgentIdentityProvider({ identities, children }: { identities: Record<string, AgentIdentityMetadata>; children: ReactNode }) {
  return <AgentIdentityContext.Provider value={identities}>{children}</AgentIdentityContext.Provider>;
}

export function AgentIdentity({ model: suppliedModel, provider: suppliedProvider, effort: suppliedEffort, label, identityId, showSession = false, iconOnly = false, hideIcon = false, className }: {
  model?: string;
  provider?: string;
  effort?: string;
  label?: string;
  iconOnly?: boolean;
  hideIcon?: boolean;
  identityId?: string;
  showSession?: boolean;
  className?: string;
}) {
  const identities = useContext(AgentIdentityContext);
  const metadata = identityId ? identities[identityId] : undefined;
  const model = metadata?.model ?? suppliedModel;
  const provider = metadata?.provider ?? suppliedProvider;
  const effort = metadata?.effort ?? suppliedEffort;
  const family = provider ?? (model ? modelProvider(model) : undefined);
  const Effort = effort ? effortLevelIcon(effort) : undefined;
  const name = (showSession ? metadata?.sessionName : undefined) ?? label;
  return <span className={cn("inline-flex min-w-0 items-center gap-1.5", className)} title={[name, showSession && identityId, model, provider, effort && `${effort} effort`].filter(Boolean).join(" · ")}>
    {!hideIcon && <Icon icon={providerIcon(family) ?? UiRobotAi} className={cn("size-3.5 shrink-0", providerIconColor(family))} />}
    {!iconOnly && <span className="truncate">{name ?? (model ? modelProvider(model) ? shortContextModelName(model) : model : provider ?? "Agent")}</span>}
    {!iconOnly && showSession && identityId && name !== identityId && <code className="shrink-0 text-muted-foreground">{shortSessionId(identityId)}</code>}
    {effort && <span title={`${effortLevelLabel(effort)} effort`} aria-label={`${effortLevelLabel(effort)} effort`}>
      {Effort ? <Effort className={cn("size-3.5", effortLevelColor(effort))} /> : <span className="text-xs">{effort}</span>}
    </span>}
  </span>;
}
