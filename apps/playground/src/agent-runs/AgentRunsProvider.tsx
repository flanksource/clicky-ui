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
  isUnresolved,
  type Comment,
  type DropdownMenuItem,
} from "@flanksource/clicky-ui";
import { UiRobotAi } from "@flanksource/clicky-ui/icons";
import { AgentIdentityProvider, type AgentIdentityMetadata } from "@flanksource/clicky-ui/chat";

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
  type SessionAgentTarget,
  createAgentSession,
} from "./agent-runs-api";
import { AgentRunChip } from "./AgentRunChip";
import { rememberAgentTarget } from "./agent-targets";
import { AgentSendFailure } from "./AgentSendFailure";
import { AgentSessionPanel } from "./AgentSessionPanel";
import { RunAgentDialog } from "./RunAgentDialog";
import { fetchComments, PLAYGROUND_COMMENT_CONFIG } from "../comments/useComments";

type AgentRunsContext = {
  /** Sends a thread; `target` first points the thread's page at that session. */
  start: (comment: Comment, target?: AgentTarget) => Promise<void>;
  /** Menu entries for a comment's Assign menu. */
  extraAssignItems: (comment: Comment) => DropdownMenuItem[];
  /** The "sent to agent session" chip for a comment, or nothing. */
  renderRunDetails: (comment: Comment) => ReactNode;
  /** Settings and sessions, as last reported by the playground server. */
  data: AgentSessionsFile | null;
  error: string | null;
  /** Opens the sessions panel, optionally focused on one captain session. */
  openPanel: (sessionId?: string) => void;
  /** The live captain session `page`'s threads go to; undefined for the playground session. */
  target: SessionAgentTarget | undefined;
  createSession: (project: string, runtime: AgentSessionRuntime) => Promise<void>;
  busy: boolean;
  changeSettings: (patch: Partial<AgentSessionSettings>) => void;
  configureRuntime: () => void;
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

function runAgentTitle(
  data: AgentSessionsFile | null,
  target: SessionAgentTarget | undefined,
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
  const [failedSend, setFailedSend] = useState<{ comment: Comment; error: string } | null>(null);
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
      rememberAgentTarget(next);
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

  const pointAt = useCallback(async (comment: Comment, next: AgentTarget) => {
    const commentPage = "page" in comment && typeof comment.page === "string" ? comment.page : page ?? (await fetchComments()).find(entry => entry.id === comment.id)?.page;
    if (!commentPage) throw new Error(`Cannot find the page for comment ${comment.id}`);
    await setPageAgentTarget(commentPage, next);
    rememberAgentTarget(next);
    await refresh();
  }, [page, refresh]);

  const retry = useCallback(async (comment: Comment, next?: AgentTarget) => {
    if (next) await pointAt(comment, next);
    await send(comment);
  }, [pointAt, send]);

  const openDialog = useCallback((next: DialogTarget) => {
    setDialogError(null);
    setTarget(next);
  }, []);

  const start = useCallback(
    async (comment: Comment, next?: AgentTarget) => {
      if (next) await pointAt(comment, next);
      // A session target is delivered into as it is, with no runtime to choose.
      if (!hasRuntime && !(next ? next.kind !== "playground" : pageTarget)) {
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
        setFailedSend({ comment, error: message });
      }
    },
    [hasRuntime, openDialog, pageTarget, pointAt, send],
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
      error: panelError,
      busy,
      changeSettings,
      configureRuntime: () => openDialog({ mode: "configure", enableAutoRun: false }),
      createSession: async (project, runtime) => {
        if (!page) throw new Error("Select a page before creating a session");
        await createAgentSession({ page, project, runtime });
        await refresh();
      },
      start,
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
            <AgentRunChip comment={comment} managedSessions={data?.sessions ?? []} onOpen={openPanel} onRetry={next => retry(comment, next)} />
          </div>
        ) : null,
    }),
    [busy, changeSettings, openDialog, changePageTarget, data, panelError, hasRuntime, openPanel, pageTarget, retry, start, page, refresh],
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

  const identities = useMemo(() => Object.fromEntries((data?.sessions ?? []).map(session => {
    const { model, provider, effort } = session.runtime.spec;
    const metadata: AgentIdentityMetadata = { model, ...(typeof provider === "string" ? { provider } : {}), ...(typeof effort === "string" ? { effort } : {}) };
    return [session.sessionId, metadata];
  })), [data]);
  return (
    <AgentRuns.Provider value={value}>
      <AgentIdentityProvider identities={identities}>
      {children}
      {failedSend && (
        <AgentSendFailure
          managedSessions={data?.sessions ?? []}
          comment={failedSend.comment}
          error={failedSend.error}
          {...(pageTarget ? { targetLabel: pageTarget.label } : {})}
          onRetry={next => retry(failedSend.comment, next)}
          onClose={() => setFailedSend(null)}
          onOpen={openPanel}
        />
      )}
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
        {...(page ? { page } : {})}
        data={data}
        focusSessionId={panel?.focusSessionId ?? null}
        error={panelError}
        busy={busy}
        onClose={() => setPanel(null)}
        onStop={(runId) => act(() => stopAgentSession(runId))}
        onForget={(runId) => act(() => forgetAgentSession(runId))}
      />
      </AgentIdentityProvider>
    </AgentRuns.Provider>
  );
}
