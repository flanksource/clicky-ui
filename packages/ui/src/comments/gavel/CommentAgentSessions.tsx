import { Button } from "../../components/button";
import { Badge } from "../../data/Badge";
import { AgentIdentity } from "../../data/chat/AgentIdentity";
import { sessionBadgeOf, sessionContextPercent } from "./comment-agent-model";
import type { GavelAgentSession } from "./gavel-delivery";

/** The sessions threads can be delivered to, and what choosing one does. Values come from `useAgentSessions`. */
export type CommentAgentPickerSessions = {
  items: GavelAgentSession[];
  /** `error` shows neither the loading nor the empty message. */
  state: "loading" | "ready" | "error";
  /** The failure shown when `state` is `error`. */
  error?: string | null | undefined;
  /** The session threads go to; with `onNew`, `undefined` means a new session. Without `onNew` nothing is marked. */
  selectedId?: string | undefined;
  onSelect: (session: GavelAgentSession) => void;
  /** Offers a "New session" choice. */
  onNew?: (() => void) | undefined;
  /** Opens the full session list. */
  onAll?: (() => void) | undefined;
  /** Page-level "assign every open thread" to a listed session or to a new one. */
  assignAll?: { count: number; onSession: (session: GavelAgentSession) => void; onNew: () => void } | undefined;
};

const sessionLabel = (session: GavelAgentSession) => `Use session ${session.title}`;

function SessionRow(props: { session: GavelAgentSession; pressed: boolean | undefined; onSelect: () => void; assignAll?: { disabled: boolean; onAssign: () => void } | undefined }) {
  const { session, pressed, onSelect, assignAll } = props;
  const context = sessionContextPercent(session);
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        className="h-auto min-w-0 flex-1 justify-start gap-2 py-2 text-left"
        aria-label={sessionLabel(session)}
        {...(pressed === undefined ? {} : { "aria-pressed": pressed })}
        title={`${session.title}\n${session.cwd ?? ""}\n${session.id}`}
        onClick={onSelect}
      >
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="truncate">{session.title}</span>
          <span className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <AgentIdentity {...(session.model ? { model: session.model } : { provider: session.source })} identityId={session.id} />
            <span className="truncate">{session.cwd?.split("/").filter(Boolean).at(-1) ?? session.id.slice(0, 12)}</span>
            {context !== undefined && <span className="tabular-nums" title="Context window in use">{context}%</span>}
          </span>
        </span>
        <Badge variant="soft" tone={session.resumable ? "neutral" : "info"} clickToCopy={false}>
          {sessionBadgeOf(session)}
        </Badge>
      </Button>
      {assignAll && (
        <Button size="sm" variant="outline" aria-label={`Assign all to ${session.title}`} disabled={assignAll.disabled} onClick={assignAll.onAssign}>
          Assign all
        </Button>
      )}
    </div>
  );
}

/** The live and resumable sessions section of the comment agent picker. */
export function CommentAgentSessions({ sessions, busy }: { sessions: CommentAgentPickerSessions; busy: boolean }) {
  const { items, state, error, selectedId, onSelect, onNew, onAll, assignAll } = sessions;
  const newSelected = onNew !== undefined && selectedId === undefined;
  return (
    <section className="space-y-2" aria-label="Active sessions">
      <h2 className="font-semibold">Active sessions</h2>
      {state === "loading" && (
        <p role="status" className="text-muted-foreground">
          Loading active sessions…
        </p>
      )}
      {state === "ready" && items.length === 0 && <p className="text-muted-foreground">No active sessions.</p>}
      {state === "error" && error && <p className="break-words text-destructive">{error}</p>}
      {onNew && (
        <Button variant="ghost" size="sm" aria-pressed={newSelected} aria-label="New session" className="h-auto w-full justify-start gap-2 py-2 text-left" onClick={onNew}>
          <span className="truncate">New session</span>
          <span className="text-muted-foreground">runs the agent above</span>
        </Button>
      )}
      {assignAll && (
        <div className="space-y-1">
          <Button size="sm" variant="outline" className="w-full" aria-label="Assign all to a new session" disabled={busy || assignAll.count === 0} onClick={assignAll.onNew}>
            Assign all to a new session
          </Button>
          <p className="text-muted-foreground">{assignAll.count === 0 ? "No open threads" : `${assignAll.count} open ${assignAll.count === 1 ? "thread" : "threads"}`}</p>
        </div>
      )}
      {items.map((session) => (
        <SessionRow
          key={session.id}
          session={session}
          pressed={onNew ? selectedId === session.id : undefined}
          onSelect={() => onSelect(session)}
          assignAll={assignAll && { disabled: busy || assignAll.count === 0, onAssign: () => assignAll.onSession(session) }}
        />
      ))}
      {onAll && (
        <Button size="sm" variant="outline" className="w-full" onClick={onAll}>
          All sessions…
        </Button>
      )}
    </section>
  );
}
