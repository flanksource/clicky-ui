import type { ReactNode } from "react";
import { Badge } from "../data/Badge";
import { Callout } from "../data/Callout";
import { Icon } from "../data/Icon";
import { useResourceClock } from "../hooks/use-resource-clock";
import { UiClockCountdown, UiServer, UiWarningTriangle } from "../icons";
import { cn } from "../lib/utils";
import type { RenderLink } from "./EndpointList";
import {
  DEFAULT_SESSION_DURATION_PRESETS_MS,
  SESSION_STATE_TONES,
  formatSessionCountdown,
  formatSessionStoreLocation,
} from "./sessionHeaderModel";
import { SessionHeaderControls, type SessionConfirmRenderArgs } from "./SessionHeaderControls";
import { isSessionTerminal, type SessionInfo } from "./sessionTypes";
import type { SessionAction } from "./useSession";

export type { SessionConfirmRenderArgs } from "./SessionHeaderControls";

export type SessionHeaderProps = {
  session: SessionInfo;
  /** Route of another session's page, for `restartOf` / `restartedAs` links. */
  getSessionHref: (id: string) => string;
  /** Renders those links with the host's router. Defaults to a plain anchor. */
  renderLink?: RenderLink;
  onStop: () => void;
  onExtend: (durationMs: number) => void;
  /** Called with the run's own `params.durationMs`, or the duration picked when it had none. */
  onRestart: (options: { durationMs: number }) => void;
  /**
   * The session's kind changes the target's behaviour (a class patch, say):
   * Stop, Extend and Restart each wait for confirmation first.
   */
  mutating?: boolean;
  /** Confirmation slot for a mutating kind. Defaults to a small modal. */
  renderConfirm?: (args: SessionConfirmRenderArgs) => ReactNode;
  /** Durations offered by the Extend and Restart prompts. */
  durationPresetsMs?: readonly number[];
  /** The control request in flight (useSession's `pendingAction`). */
  pendingAction?: SessionAction | null;
  /** The last control request's failure (useSession's `actionError`); rendered until the next action. */
  actionError?: unknown;
  /** Heading; defaults to `labels.label`, then the profile. */
  title?: ReactNode;
  className?: string;
};

const defaultRenderLink: RenderLink = ({ to, children, className, title, key }) => (
  <a key={key} href={to} className={className} title={title}>
    {children}
  </a>
);

const LINK_CLASS = "font-mono text-primary underline-offset-2 hover:underline";

function shortId(id: string): string {
  return id.length > 8 ? id.slice(0, 8) : id;
}

export function SessionHeader({
  session,
  getSessionHref,
  renderLink = defaultRenderLink,
  onStop,
  onExtend,
  onRestart,
  mutating = false,
  renderConfirm,
  durationPresetsMs = DEFAULT_SESSION_DURATION_PRESETS_MS,
  pendingAction = null,
  actionError,
  title,
  className,
}: SessionHeaderProps) {
  const active = !isSessionTerminal(session.state);
  const countingDown = active && session.stopAt !== undefined;
  const now = useResourceClock(countingDown);
  // The `label` label is already the heading when no title is given.
  const labelIsHeading = title === undefined && session.labels?.label !== undefined;
  const labels = Object.entries(session.labels ?? {}).filter(
    ([key]) => !(labelIsHeading && key === "label"),
  );
  const sessionLink = (id: string) =>
    renderLink({ to: getSessionHref(id), children: shortId(id), className: LINK_CLASS, title: id, key: id });

  return (
    <header
      className={cn("space-y-3 rounded-md border border-border bg-card p-3", className)}
      data-slot="session-header"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-base font-semibold">
              {title ?? session.labels?.label ?? session.profile}
            </h2>
            <Badge tone={SESSION_STATE_TONES[session.state]} size="sm">
              {session.state}
            </Badge>
            {session.unresponsive && (
              <Badge tone="warning" variant="outline" size="sm" icon={UiWarningTriangle}>
                unresponsive
              </Badge>
            )}
            {countingDown && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Icon icon={UiClockCountdown} className="size-3.5" />
                {formatSessionCountdown(session.stopAt!, now)}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="font-mono">{session.profile}</span>
            {session.events && <span className="font-mono">Event kind: {session.events.kind}</span>}
            <span className="inline-flex items-center gap-1">
              <Icon icon={UiServer} className="size-3.5" />
              {`${session.owner.host} · pid ${session.owner.pid}`}
            </span>
            {session.principal && <span>by {session.principal}</span>}
            <span>{session.eventCount.toLocaleString()} events</span>
            {session.handle && <span className="font-mono">{session.handle}</span>}
            {!active && session.stopReason && <span>{session.stopReason}</span>}
          </div>
          {labels.length > 0 && (
            <ul role="list" className="flex flex-wrap gap-1" aria-label="Labels">
              {labels.map(([key, value]) => (
                <li key={key}>
                  <Badge tone="neutral" variant="outline" size="xs">
                    {`${key}=${value}`}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
          {(session.restartOf || (session.restartedAs?.length ?? 0) > 0) && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
              {session.restartOf && (
                <span>
                  Restart of {sessionLink(session.restartOf)}
                </span>
              )}
              {session.restartedAs && session.restartedAs.length > 0 && (
                <span className="inline-flex flex-wrap items-center gap-1">
                  Restarted as {session.restartedAs.map(sessionLink)}
                </span>
              )}
            </div>
          )}
        </div>
        <SessionHeaderControls
          session={session}
          onStop={onStop}
          onExtend={onExtend}
          onRestart={onRestart}
          mutating={mutating}
          renderConfirm={renderConfirm}
          durationPresetsMs={durationPresetsMs}
          pendingAction={pendingAction}
        />
      </div>
      <SessionHeaderNotices session={session} active={active} actionError={actionError} />
    </header>
  );
}

function SessionHeaderNotices({
  session,
  active,
  actionError,
}: {
  session: SessionInfo;
  active: boolean;
  actionError: unknown;
}) {
  const eventsLost = session.events !== undefined && !session.eventsAvailable;
  const uncontrolled = active && !session.controllable;
  const actionFailed = actionError !== undefined && actionError !== null;
  if (!actionFailed && !session.error && !session.warning && !eventsLost && !uncontrolled) return null;
  return (
    <div className="space-y-2">
      {actionFailed && (
        <Callout variant="caution" label="Action failed">
          {actionError instanceof Error ? actionError.message : String(actionError)}
        </Callout>
      )}
      {session.error && (
        <Callout variant="caution" label="Error">
          {session.error}
        </Callout>
      )}
      {session.warning && (
        <Callout variant="warning" label="Warning">
          {session.warning}
        </Callout>
      )}
      {eventsLost && session.events && (
        <Callout variant="warning" label="Events unavailable">
          {`Events were ${formatSessionStoreLocation(session.events.store)}; this server cannot read that store.`}
        </Callout>
      )}
      {uncontrolled && (
        <Callout variant="note" label="Read only">
          {`Controlled by ${session.owner.host} (pid ${session.owner.pid}); this server cannot stop or extend it.`}
        </Callout>
      )}
    </div>
  );
}
