import type { ReactNode } from "react";
import {
  UiClock,
  UiCoins,
  UiFingerprint,
  UiRobotAi,
  UiServerProcess,
  UiTimer,
} from "../../icons";
import { Icon, type StaticIconComponent } from "../Icon";
import { providerIcon, providerIconColor } from "../chat/provider-icons";
import { effortIcon } from "./agent-action-icons";
import {
  compactTokens,
  costTotal,
  formatCost,
  tokenTotal,
} from "./session-cost";
import {
  durationLabel,
  formatDate,
  runtimeDescriptor,
} from "./SessionInspector.model";
import { SessionContextMeter } from "./SessionViewer.header";
import { getSessionMetadata } from "./SessionViewer.model";
import type { UnifiedSessionInput } from "./SessionViewer.unified";

export function SessionInspectorHeader({
  session,
}: {
  session: UnifiedSessionInput;
}) {
  const provider = runtimeDescriptor(session.backend);
  const providerId = session.provider || provider?.family;
  const ProviderIcon = providerIcon(providerId) ?? UiRobotAi;
  const providerColor = providerIconColor(providerId);
  const effort = session.reasoningEffort
    ? effortIcon(session.reasoningEffort)
    : undefined;
  const status = session.live?.active
    ? session.live.status || "running"
    : session.endedAt
    ? "completed"
    : session.live?.status || "session";
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
              {titleCase(status)} with{" "}
              {session.model || provider?.family || session.provider || "AI"}
            </h2>
            {effort ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-xs max-sm:basis-full max-sm:border-0 max-sm:bg-transparent max-sm:px-0">
                <Icon icon={effort.icon} size="xs" />
                {effort.label}
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

export function SessionInspectorSidebar({
  session,
}: {
  session: UnifiedSessionInput;
}) {
  const runtime = runtimeDescriptor(session.backend);
  const RuntimeIcon = runtime?.icon ?? UiRobotAi;
  const usage = session.usage ?? session.cost;
  const tokens = tokenTotal(usage);
  const cost = costTotal(session.cost);

  return (
    <aside className="border-t border-border bg-muted/10 p-density-4 lg:min-h-0 lg:overflow-auto lg:border-l lg:border-t-0">
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Session details
        </h3>
        <dl className="mt-density-3 space-y-density-3">
          <DetailRow
            icon={UiClock}
            label="Started"
            value={formatDate(session.startedAt)}
          />
          <DetailRow
            icon={UiRobotAi}
            label="Connection"
            value={session.provider || session.source}
          />
          <div data-testid="session-runtime-mode">
            <DetailRow
              icon={RuntimeIcon}
              label="Mode"
              value={runtime?.mode || session.backend}
              {...(runtime?.title ? { title: runtime.title } : {})}
            />
          </div>
          <DetailRow
            icon={UiServerProcess}
            label="PID"
            value={session.live?.pid}
          />
          <DetailRow
            icon={UiFingerprint}
            label="Session ID"
            value={session.id}
            mono
          />
        </dl>
      </section>

      <section className="mt-density-5 rounded-lg border border-border bg-background p-density-3 shadow-sm">
        <div className="flex items-center gap-density-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Icon icon={UiCoins} size="xs" />
          Usage
        </div>
        <div className="mt-density-3 grid grid-cols-2 gap-density-3">
          <UsageMetric
            label="Tokens"
            value={tokens ? preciseTokens(tokens) : "-"}
          />
          <UsageMetric label="Cost" value={cost ? formatCost(cost) : "-"} />
          <UsageMetric
            label="Input"
            value={usage?.inputTokens ? compactTokens(usage.inputTokens) : "-"}
          />
          <UsageMetric
            label="Output"
            value={
              usage?.outputTokens ? compactTokens(usage.outputTokens) : "-"
            }
          />
        </div>
      </section>
    </aside>
  );
}

function DetailRow({
  icon,
  label,
  value,
  title,
  mono = false,
}: {
  icon: StaticIconComponent;
  label: string;
  value: ReactNode;
  title?: string;
  mono?: boolean;
}) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="grid grid-cols-[1rem_minmax(0,1fr)] gap-x-density-2">
      <Icon icon={icon} size="xs" className="mt-0.5 text-muted-foreground" />
      <div className="min-w-0">
        <dt className="text-[11px] text-muted-foreground">{label}</dt>
        <dd
          className={
            mono
              ? "truncate font-mono text-xs text-foreground"
              : "truncate text-sm text-foreground"
          }
          title={title}
        >
          {value}
        </dd>
      </div>
    </div>
  );
}

function UsageMetric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
        {value}
      </div>
    </div>
  );
}

function titleCase(value: string) {
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value;
}

function preciseTokens(value: number) {
  if (value >= 1_000 && value < 10_000 && value % 1_000 !== 0) {
    return `${(value / 1_000).toFixed(1)}k`;
  }
  return compactTokens(value);
}
