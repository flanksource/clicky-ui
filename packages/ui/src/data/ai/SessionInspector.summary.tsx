import { UiRobotAi, UiTimer } from "../../icons";
import { Icon } from "../Icon";
import { effortLevelLabel } from "../chat/effort-icons";
import { providerIcon, providerIconColor } from "../chat/provider-icons";
import { effortIcon } from "./agent-action-icons";
import { durationLabel, runtimeDescriptor } from "./SessionInspector.model";
import { SessionContextMeter } from "./SessionViewer.header";
import { getSessionMetadata } from "./SessionViewer.model";
import type { UnifiedSessionInput } from "./SessionViewer.unified";

export function SessionInspectorHeader({
  session,
}: {
  session: UnifiedSessionInput;
}) {
  const provider = runtimeDescriptor(session.modelMode);
  const providerId = session.provider || provider?.family;
  const ProviderIcon = providerIcon(providerId) ?? UiRobotAi;
  const providerColor = providerIconColor(providerId);
  const effortValue = session.reasoningEffort?.trim();
  const effort = effortValue ? effortIcon(effortValue) : undefined;
  const title =
    session.title?.trim() ||
    session.initialPrompt?.trim() ||
    session.model ||
    provider?.family ||
    session.provider ||
    "Session";
  const metadata = getSessionMetadata(session);
  const showMeter = Boolean(metadata?.context);

  return (
    <header className="shrink-0 border-b border-border bg-muted/20 px-density-2 py-density-3">
      <div className="flex min-w-0 items-start gap-density-3">
        {showMeter && metadata ? (
          <div className="-ml-1.5 shrink-0">
            <SessionContextMeter metadata={metadata} mode="gauge" />
          </div>
        ) : (
          <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-foreground shadow-sm">
            <Icon
              icon={ProviderIcon}
              size="md"
              {...(providerColor ? { className: providerColor } : {})}
            />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-density-2">
            <h2 className="min-w-0 max-w-full truncate text-base font-semibold tracking-tight text-foreground">
              {title}
            </h2>
            {effortValue ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-xs max-sm:basis-full max-sm:border-0 max-sm:bg-transparent max-sm:px-0">
                {effort ? <Icon icon={effort.icon} size="xs" /> : null}
                {effortLevelLabel(effortValue)}
              </span>
            ) : null}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-density-3 gap-y-1 text-xs text-muted-foreground">
            {session.startedAt ? (
              <span className="inline-flex items-center gap-1">
                <Icon icon={UiTimer} size="xs" />
                {durationLabel(session.startedAt, session.endedAt)}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
