import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Modal,
  SegmentedControl,
  Switch,
  Timestamp,
  type BadgeTone,
} from "@flanksource/clicky-ui";
import { SessionInspector, SessionTail } from "@flanksource/clicky-ui/ai";
import { UiStop } from "@flanksource/clicky-ui/icons";
import { cn } from "@flanksource/clicky-ui/utils";
import { AgentTargetPicker } from "./AgentTargetPicker";
import { RuntimeIdentity } from "./RuntimeIdentity";

import {
  agentSessionSrc,
  type AgentSession,
  type AgentSessionGrouping,
  type AgentSessionSettings,
  type AgentSessionsFile,
} from "./agent-runs-api";

const STATE_TONE: Record<AgentSession["state"], BadgeTone> = {
  running: "info",
  ended: "neutral",
  stopped: "warning",
  failed: "danger",
};

const GROUPING_OPTIONS: { id: AgentSessionGrouping; label: string; title: string }[] = [
  { id: "shared", label: "Shared", title: "One session handles comments from every page" },
  { id: "page", label: "Per page", title: "Each page's comments go to that page's own session" },
];

function sessionLabel(session: AgentSession): string {
  return session.label ?? session.page ?? "Shared";
}

function SettingsRow({
  settings,
  busy,
  onSettings,
  onChangeRuntime,
}: {
  settings: AgentSessionSettings;
  busy: boolean;
  onSettings: (patch: Partial<AgentSessionSettings>) => void;
  onChangeRuntime: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-border px-3 py-2">
      <Switch
        checked={settings.autoRun}
        disabled={busy}
        onChange={(autoRun) => onSettings({ autoRun })}
        label="Auto-run new comments"
      />
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Sessions</span>
        <SegmentedControl
          size="sm"
          aria-label="Session grouping"
          value={settings.grouping}
          options={GROUPING_OPTIONS.map((option) => ({ ...option, disabled: busy }))}
          onChange={(grouping) => onSettings({ grouping })}
        />
      </div>
      <div className="ml-auto flex items-center gap-2 text-xs">
        <span className="text-muted-foreground">Runtime</span>
        <span className="font-medium">{settings.runtime ? <RuntimeIdentity runtime={settings.runtime} /> : "not set"}</span>
        <Button size="sm" variant="ghost" disabled={busy} onClick={onChangeRuntime}>
          Change…
        </Button>
      </div>
    </div>
  );
}

function SessionRow({
  session,
  selected,
  busy,
  onSelect,
  onStop,
  onForget,
}: {
  session: AgentSession;
  selected: boolean;
  busy: boolean;
  onSelect: () => void;
  onStop: () => void;
  onForget: () => void;
}) {
  return (
    <li
      className={cn(
        "flex flex-wrap items-center gap-2 px-3 py-1.5",
        selected && "bg-accent",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className="flex min-w-0 flex-1 items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="truncate font-medium">{sessionLabel(session)}</span>
        <Badge tone={STATE_TONE[session.state]} variant="soft" clickToCopy={false}>
          {session.state}
        </Badge>
        <span className="truncate text-xs text-muted-foreground">
          <RuntimeIdentity runtime={session.runtime} /> · started{" "}
          <Timestamp value={session.startedAt} format="relative" />
        </span>
      </button>
      {session.state === "running" && (
        <Button size="sm" variant="outline" disabled={busy} onClick={onStop}>
          <UiStop className="size-3.5" />
          Stop
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        disabled={busy}
        onClick={onForget}
        title="Stop and forget this session; the next thread for it starts a new one"
      >
        Forget
      </Button>
    </li>
  );
}

function SessionDetail({
  session,
  inspecting,
  setInspecting,
}: {
  session: AgentSession;
  inspecting: boolean;
  setInspecting: (update: (current: boolean) => boolean) => void;
}) {
  const running = session.state === "running";
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          {sessionLabel(session)} session
        </span>
        <Button
          size="sm"
          variant="ghost"
          className="ml-auto"
          onClick={() => setInspecting((current) => !current)}
          aria-pressed={inspecting}
        >
          {inspecting ? "Collapse" : "Inspect"}
        </Button>
      </div>
      {session.error && (
        <p role="alert" className="text-xs text-destructive">
          {session.error}
        </p>
      )}
      {!running && (
        <p className="text-xs text-muted-foreground">
          {session.purpose === "target" ? "This session is over. Choose another comment target or create a new session." : "This session is over. The next thread for it starts a replacement with the configured runtime."}
        </p>
      )}
      <SessionTail
        src={agentSessionSrc(session.sessionId)}
        follow={running}
        emptyLabel="Waiting for the agent…"
      />
      {inspecting && (
        <div className="h-[65vh] min-h-0 overflow-hidden rounded-md border border-border">
          <SessionInspector
            src={agentSessionSrc(session.sessionId)}
            follow={running}
            layout="compact"
          />
        </div>
      )}
    </div>
  );
}

/**
 * The playground's agent sessions: auto-run, grouping and runtime settings,
 * every stored session with its controls, and a live tail of the selected one.
 */
export function AgentSessionPanel({
  open,
  page,
  data,
  focusSessionId,
  error,
  busy,
  onSettings,
  onChangeRuntime,
  onStop,
  onForget,
  onClose,
}: {
  open: boolean;
  page?: string;
  data: AgentSessionsFile | null;
  /** Session to select when the panel opens, e.g. from a thread's chip. */
  focusSessionId: string | null;
  error: string | null;
  busy: boolean;
  onSettings: (patch: Partial<AgentSessionSettings>) => void;
  onChangeRuntime: () => void;
  onStop: (runId: string) => void;
  onForget: (runId: string) => void;
  onClose: () => void;
}) {
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [inspecting, setInspecting] = useState(false);
  useEffect(() => {
    if (open) setSelectedRunId(null);
  }, [open, focusSessionId]);

  const sessions = data?.sessions ?? [];
  const selected =
    sessions.find((session) => session.runId === selectedRunId) ??
    sessions.find((session) => session.sessionId === focusSessionId) ??
    sessions.find((session) => session.state === "running") ??
    sessions[0];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Agent sessions"
      size={inspecting && selected ? "2xl" : "lg"}
    >
      <div className="space-y-3 text-sm">
        {open && page && (
          <section aria-label="Page agent target" className="space-y-2 rounded-md border border-border p-3">
            <p className="break-all text-xs text-muted-foreground">Comments for <strong className="font-medium text-foreground">{page}</strong></p>
            <AgentTargetPicker key={page} />
            <p className="text-xs text-muted-foreground">Applies to future sends and auto-run comments on this page. Existing threads are not resent.</p>
          </section>
        )}
        {error && (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}
        {data && (
          <SettingsRow
            settings={data.settings}
            busy={busy}
            onSettings={onSettings}
            onChangeRuntime={onChangeRuntime}
          />
        )}
        {sessions.length === 0 ? (
          <p className="text-muted-foreground">
            No agent session yet. Choose <strong>Run agent</strong> from a
            comment&apos;s Assign menu, or turn on <strong>Auto-run new comments</strong>,
            to start one; later comments are sent into the same session (one per
            page with <strong>Per page</strong>).
          </p>
        ) : (
          <>
            <ul className="divide-y divide-border overflow-hidden rounded-md border border-border">
              {sessions.map((session) => (
                <SessionRow
                  key={session.runId}
                  session={session}
                  selected={session === selected}
                  busy={busy}
                  onSelect={() => setSelectedRunId(session.runId)}
                  onStop={() => onStop(session.runId)}
                  onForget={() => onForget(session.runId)}
                />
              ))}
            </ul>
            {selected && (
              <SessionDetail
                key={selected.runId}
                session={selected}
                inspecting={inspecting}
                setInspecting={setInspecting}
              />
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
