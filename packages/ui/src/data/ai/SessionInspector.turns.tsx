import {
  UiCheck,
  UiClock,
  UiCoins,
  UiError,
  UiRobotAi,
  UiSealCheck,
  UiTimer,
} from "../../icons";
import { Icon } from "../Icon";
import { providerIcon, providerIconColor } from "../chat/provider-icons";
import { cn } from "../../lib/utils";
import { compactTokens, costTotal, formatCost } from "./session-cost";
import { durationLabel, runtimeDescriptor } from "./SessionInspector.model";
import type { SessionTurn, UnifiedSessionInput } from "./SessionViewer.unified";

export function SessionTurnsPanel({
  session,
}: {
  session: UnifiedSessionInput;
}) {
  if (!session.turns?.length) {
    return <EmptyTurns />;
  }
  return (
    <div className="space-y-density-3">
      {session.turns.map((turn) => (
        <TurnCard key={turn.id} turn={turn} session={session} />
      ))}
    </div>
  );
}

function TurnCard({
  turn,
  session,
}: {
  turn: SessionTurn;
  session: UnifiedSessionInput;
}) {
  const presentation = turnPresentation(turn, session);

  return (
    <article className="rounded-lg border border-border bg-background p-density-4 shadow-sm">
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-density-3">
        <div className="flex min-w-0 items-center gap-density-3">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted/30">
            <Icon
              icon={presentation.ProviderIcon}
              size="sm"
              {...(presentation.providerColor
                ? { className: presentation.providerColor }
                : {})}
            />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-density-2">
              <h3 className="font-semibold text-foreground">
                Turn {turn.index}
              </h3>
              <span className="font-mono text-xs text-muted-foreground">
                {turn.id}
              </span>
            </div>
            <div className="mt-0.5 flex flex-wrap gap-x-density-2 text-xs text-muted-foreground">
              <span>
                {presentation.runtime?.family || session.provider || "AI"}
              </span>
              {turn.model || session.model ? (
                <span>{turn.model || session.model}</span>
              ) : null}
              {turn.reasoningEffort ? (
                <span>{turn.reasoningEffort} effort</span>
              ) : null}
            </div>
          </div>
        </div>
        <StatusBadge status={presentation.status} />
      </div>

      <TurnMetrics
        turn={turn}
        presentation={presentation}
        className="mt-density-4 grid-cols-2 gap-density-3 border-t border-border pt-density-3 sm:grid-cols-3 xl:grid-cols-6"
      />

      {turn.error ? (
        <div className="mt-density-3 flex items-start gap-density-2 rounded-md border border-destructive/30 bg-destructive/5 p-density-3 text-sm text-destructive">
          <Icon icon={UiError} size="sm" />
          <span>{turn.error}</span>
        </div>
      ) : null}
    </article>
  );
}

export function SessionTurnPickerItem({
  turn,
  session,
  agentId,
  selected = false,
}: {
  turn: SessionTurn;
  session: UnifiedSessionInput;
  agentId?: string;
  selected?: boolean;
}) {
  const presentation = turnPresentation(turn, session);
  return (
    <div className="min-w-0 flex-1 p-density-3 text-left">
      <div className="flex min-w-0 items-start justify-between gap-density-3">
        <div className="flex min-w-0 items-center gap-density-3">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted/30">
            <Icon
              icon={presentation.ProviderIcon}
              size="sm"
              {...(presentation.providerColor
                ? { className: presentation.providerColor }
                : {})}
            />
          </span>
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-density-2">
              <span className="font-semibold text-foreground">
                Turn {turn.index}
              </span>
              <span className="truncate font-mono text-[11px] text-muted-foreground">
                {turn.id}
              </span>
            </div>
            <div className="mt-0.5 flex flex-wrap gap-x-density-2 text-[11px] text-muted-foreground">
              <span>
                {presentation.runtime?.family || session.provider || "AI"}
              </span>
              {turn.model || session.model ? (
                <span>{turn.model || session.model}</span>
              ) : null}
              {turn.reasoningEffort ? (
                <span>{turn.reasoningEffort} effort</span>
              ) : null}
              {agentId ? <span>Agent {agentId}</span> : null}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-density-2">
          <StatusBadge status={presentation.status} />
          {selected ? (
            <Icon icon={UiCheck} className="size-4 text-primary" />
          ) : null}
        </div>
      </div>
      <TurnMetrics
        turn={turn}
        presentation={presentation}
        className="mt-density-3 grid-cols-3 gap-density-2 border-t border-border pt-density-3 sm:grid-cols-6"
      />
    </div>
  );
}

function turnPresentation(turn: SessionTurn, session: UnifiedSessionInput) {
  const runtime = runtimeDescriptor(turn.mode || session.modelMode);
  const providerId = runtime?.family || session.provider;
  return {
    runtime,
    ProviderIcon: providerIcon(providerId) ?? UiRobotAi,
    providerColor: providerIconColor(providerId),
    status: turn.status || (turn.endedAt ? "completed" : "running"),
    cost: costTotal(turn.cost),
  };
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize",
        normalized === "running"
          ? "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300"
          : normalized === "completed"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
            : "border-border bg-muted/40 text-muted-foreground",
      )}
    >
      {status}
    </span>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: typeof UiClock;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <Icon icon={icon} size="xs" />
        {label}
      </div>
      <div className="mt-0.5 truncate text-xs font-medium tabular-nums text-foreground">
        {value}
      </div>
    </div>
  );
}

function TurnMetrics({
  turn,
  presentation,
  className,
}: {
  turn: SessionTurn;
  presentation: ReturnType<typeof turnPresentation>;
  className?: string;
}) {
  return (
    <div className={cn("grid", className)}>
      <Metric
        icon={UiClock}
        label="Duration"
        value={durationLabel(turn.startedAt, turn.endedAt) || "-"}
      />
      <Metric
        icon={UiRobotAi}
        label="Input"
        value={
          turn.usage?.inputTokens
            ? `${compactTokens(turn.usage.inputTokens)} in`
            : "-"
        }
      />
      <Metric
        icon={UiRobotAi}
        label="Output"
        value={
          turn.usage?.outputTokens
            ? `${compactTokens(turn.usage.outputTokens)} out`
            : "-"
        }
      />
      <Metric
        icon={UiCoins}
        label="Cost"
        value={presentation.cost ? formatCost(presentation.cost) : "-"}
      />
      <Metric icon={UiSealCheck} label="Stop" value={turn.stopReason || "-"} />
      <Metric
        icon={UiTimer}
        label="Events"
        value={String(turn.events?.length ?? 0)}
      />
    </div>
  );
}

function EmptyTurns() {
  return (
    <div className="rounded-lg border border-dashed border-border p-density-6 text-center text-sm text-muted-foreground">
      No turn metadata.
    </div>
  );
}
