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
  setPageAgentTarget,
  stopAgentSession,
  updateAgentSessionSettings,
  type AgentSessionRuntime,
  type AgentSessionSettings,
  type AgentSessionsFile,
  type AgentTarget,
  type CaptainAgentTarget,
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
  /** The live captain session `page`'s threads go to; undefined for the playground session. */
  target: CaptainAgentTarget | undefined;
  /** Points `page`'s threads at a target; rejects when no `page` was given. */
  setTarget: (target: AgentTarget) => Promise<void>;
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
  const where = run.target
    ? `Sent to ${run.target.label}${run.target.channel ? ` via ${run.target.channel}` : ""}`
    : "Sent to agent session";
  // A captain target is not one of the playground's sessions, so there is no panel to open.
  if (run.target) {
    return (
      <span title={run.error ?? where} className="inline-flex items-center">
        <Badge tone={runTone(run.state)} variant="soft" clickToCopy={false}>
          {where} · {STATE_LABEL[run.state]}
        </Badge>
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onOpen(run.sessionId)}
      title={run.error ?? "Open the agent session"}
      className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Badge tone={runTone(run.state)} variant="soft" clickToCopy={false}>
        {where} · {STATE_LABEL[run.state]}
      </Badge>
    </button>
  );
}

function runTone(state: NonNullable<Comment["agentRun"]>["state"]) {
  return state === "error" ? "danger" : state === "done" ? "success" : "info";
}

function runAgentTitle(
  data: AgentSessionsFile | null,
  target: CaptainAgentTarget | undefined,
): string {
  if (target) return `Deliver this thread into the live captain session ${target.label}`;
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
  page,
  children,
}: {
  runAgent: (id: string, runtime?: AgentSessionRuntime) => Promise<void>;
  /** The page whose agent target "Run agent" describes and `setTarget` changes. */
  page?: string;
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

  const pageTarget = page ? data?.settings.targets?.[page] : undefined;
  // New and replacement sessions start with the configured runtime, so only a
  // playground without one needs the runtime dialog.
  const hasRuntime = data?.settings.runtime !== undefined;

  const changePageTarget = useCallback(
    async (next: AgentTarget) => {
      if (!page) throw new Error("AgentRunsProvider has no page to set a target for");
      await setPageAgentTarget(page, next);
      await refresh();
    },
    [page, refresh],
  );

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
      // A captain target is delivered into as it is, with no runtime to choose.
      if (!hasRuntime && !pageTarget) {
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
    [hasRuntime, openDialog, pageTarget, send],
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
      target: pageTarget,
      setTarget: changePageTarget,
      extraAssignItems: (comment) =>
        comment.parentId
          ? []
          : [
              {
                label: pageTarget
                  ? `Send to ${pageTarget.label}`
                  : hasRuntime
                    ? "Run agent"
                    : "Run agent…",
                icon: UiRobotAi,
                title: runAgentTitle(data, pageTarget),
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
    [changePageTarget, data, hasRuntime, openPanel, pageTarget, start],
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
