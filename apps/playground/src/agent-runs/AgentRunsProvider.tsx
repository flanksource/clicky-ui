import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  Badge,
  isUnresolved,
  type Comment,
  type DropdownMenuItem,
} from "@flanksource/clicky-ui";
import { UiRobotAi } from "@flanksource/clicky-ui/icons";

import {
  fetchAgentSessions,
  forgetAgentSession,
  stopAgentSession,
  updateAgentSessionSettings,
  type AgentSessionRuntime,
  type AgentSessionSettings,
  type AgentSessionsFile,
} from "./agent-runs-api";
import { AgentSessionPanel } from "./AgentSessionPanel";
import { RunAgentDialog } from "./RunAgentDialog";
import { PLAYGROUND_COMMENT_CONFIG } from "../comments/useComments";

type AgentRunsContext = {
  /** Menu entries for a comment's Assign menu. */
  extraAssignItems: (comment: Comment) => DropdownMenuItem[];
  /** The "sent to agent session" chip for a comment, or nothing. */
  renderRunDetails: (comment: Comment) => ReactNode;
  /** Settings and sessions, as last reported by the playground server. */
  data: AgentSessionsFile | null;
  /** Opens the sessions panel, optionally focused on one captain session. */
  openPanel: (sessionId?: string) => void;
};

/** What the runtime dialog is open for: a thread to run, or the runtime setting. */
type DialogTarget =
  | { mode: "run"; comment: Comment }
  | { mode: "configure"; enableAutoRun: boolean };

const AgentRuns = createContext<AgentRunsContext | null>(null);

export function useAgentRuns(): AgentRunsContext {
  const value = useContext(AgentRuns);
  if (!value) {
    throw new Error("useAgentRuns must be used inside <AgentRunsProvider>");
  }
  return value;
}

const NO_LIVE_SESSION = /no live agent session/;

function describeError(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}

const STATE_LABEL: Record<NonNullable<Comment["agentRun"]>["state"], string> = {
  queued: "queued",
  sent: "sent",
  done: "done",
  error: "failed",
};

function AgentRunChip({
  comment,
  onOpen,
}: {
  comment: Comment;
  onOpen: (sessionId?: string) => void;
}) {
  const run = comment.agentRun;
  if (!run) return null;
  return (
    <button
      type="button"
      onClick={() => onOpen(run.sessionId)}
      title={run.error ?? "Open the agent session"}
      className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Badge
        tone={
          run.state === "error"
            ? "danger"
            : run.state === "done"
              ? "success"
              : "info"
        }
        variant="soft"
        clickToCopy={false}
      >
        Sent to agent session · {STATE_LABEL[run.state]}
      </Badge>
    </button>
  );
}

function runAgentTitle(data: AgentSessionsFile | null): string {
  const model = data?.settings.runtime?.spec.model;
  if (!model) return "Choose a runtime and start an agent session for this thread";
  return data.settings.grouping === "page"
    ? `Send this thread to this page's ${model} session (started if none is running)`
    : `Send this thread to the shared ${model} session (started if none is running)`;
}

/**
 * Owns the playground's agent session UI: polls settings and sessions, offers
 * "Run agent" for any comment, and renders the sessions panel and the runtime
 * dialog once for the whole shell.
 */
export function AgentRunsProvider({
  runAgent,
  children,
}: {
  runAgent: (id: string, runtime?: AgentSessionRuntime) => Promise<void>;
  children: ReactNode;
}) {
  const [data, setData] = useState<AgentSessionsFile | null>(null);
  const [panelError, setPanelError] = useState<string | null>(null);
  const [panel, setPanel] = useState<{ focusSessionId: string | null } | null>(
    null,
  );
  const [target, setTarget] = useState<DialogTarget | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setData(await fetchAgentSessions());
      setPanelError(null);
    } catch (cause) {
      setPanelError(describeError(cause));
    }
  }, []);

  useEffect(() => {
    void refresh();
    const update = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    const timer = window.setInterval(update, 5000);
    window.addEventListener("focus", update);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", update);
    };
  }, [refresh]);

  // New and replacement sessions start with the configured runtime, so only a
  // playground without one needs the runtime dialog.
  const hasRuntime = data?.settings.runtime !== undefined;

  const send = useCallback(
    async (comment: Comment, runtime?: AgentSessionRuntime) => {
      await runAgent(comment.id, runtime);
      await refresh();
    },
    [refresh, runAgent],
  );

  const openDialog = useCallback((next: DialogTarget) => {
    setDialogError(null);
    setTarget(next);
  }, []);

  const start = useCallback(
    async (comment: Comment) => {
      if (!hasRuntime) {
        openDialog({ mode: "run", comment });
        return;
      }
      try {
        await send(comment);
      } catch (cause) {
        const message = describeError(cause);
        // The runtime was cleared since the last poll; ask for one instead.
        if (NO_LIVE_SESSION.test(message)) {
          openDialog({ mode: "run", comment });
          return;
        }
        setPanelError(message);
        setPanel({ focusSessionId: null });
      }
    },
    [hasRuntime, openDialog, send],
  );

  const act = useCallback(
    (work: () => Promise<unknown>) => {
      setBusy(true);
      work()
        .then(refresh)
        .catch((cause: unknown) => setPanelError(describeError(cause)))
        .finally(() => setBusy(false));
    },
    [refresh],
  );

  const changeSettings = useCallback(
    (patch: Partial<AgentSessionSettings>) => {
      // Auto-run starts sessions on its own, so it needs a runtime first.
      if (patch.autoRun && !hasRuntime) {
        openDialog({ mode: "configure", enableAutoRun: true });
        return;
      }
      act(() => updateAgentSessionSettings(patch));
    },
    [act, hasRuntime, openDialog],
  );

  const openPanel = useCallback(
    (sessionId?: string) => setPanel({ focusSessionId: sessionId ?? null }),
    [],
  );

  const value = useMemo<AgentRunsContext>(
    () => ({
      data,
      openPanel,
      extraAssignItems: (comment) =>
        comment.parentId
          ? []
          : [
              {
                label: hasRuntime ? "Run agent" : "Run agent…",
                icon: UiRobotAi,
                title: runAgentTitle(data),
                disabled: !isUnresolved(PLAYGROUND_COMMENT_CONFIG, comment.status),
                onSelect: () => void start(comment),
              },
            ],
      renderRunDetails: (comment) =>
        comment.agentRun ? (
          <div className="px-1">
            <AgentRunChip comment={comment} onOpen={openPanel} />
          </div>
        ) : null,
    }),
    [data, hasRuntime, openPanel, start],
  );

  const submitRuntime = (runtime: AgentSessionRuntime) => {
    if (!target) return;
    setStarting(true);
    setDialogError(null);
    const work =
      target.mode === "run"
        ? send(target.comment, runtime)
        : updateAgentSessionSettings({
            runtime,
            ...(target.enableAutoRun ? { autoRun: true } : {}),
          }).then(refresh);
    work.then(
      () => {
        setTarget(null);
        setStarting(false);
      },
      (cause: unknown) => {
        setDialogError(describeError(cause));
        setStarting(false);
      },
    );
  };

  return (
    <AgentRuns.Provider value={value}>
      {children}
      <RunAgentDialog
        open={target !== null}
        mode={target?.mode ?? "run"}
        grouping={data?.settings.grouping ?? "shared"}
        current={data?.settings.runtime}
        error={dialogError}
        busy={starting}
        onClose={() => setTarget(null)}
        onRun={submitRuntime}
      />
      <AgentSessionPanel
        open={panel !== null}
        data={data}
        focusSessionId={panel?.focusSessionId ?? null}
        error={panelError}
        busy={busy}
        onClose={() => setPanel(null)}
        onSettings={changeSettings}
        onChangeRuntime={() => openDialog({ mode: "configure", enableAutoRun: false })}
        onStop={(runId) => act(() => stopAgentSession(runId))}
        onForget={(runId) => act(() => forgetAgentSession(runId))}
      />
    </AgentRuns.Provider>
  );
}

/** Toolbar button that opens the agent sessions panel. */
export function AgentSessionButton() {
  const { data, openPanel } = useAgentRuns();
  const running = data?.sessions.filter((session) => session.state === "running") ?? [];
  return (
    <button
      type="button"
      onClick={() => openPanel()}
      title={
        data && data.sessions.length > 0
          ? `Agent sessions: ${running.length} running of ${data.sessions.length}${data.settings.autoRun ? " · auto-run on" : ""}`
          : "No agent session yet"
      }
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <UiRobotAi className="size-3.5" />
      Agent sessions
      {running.length > 0 && <span className="size-1.5 rounded-full bg-emerald-500" />}
    </button>
  );
}
