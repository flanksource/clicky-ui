import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  isUnresolved,
  useCommentContextOptional,
  type Comment,
  type DropdownMenuItem,
} from "@flanksource/clicky-ui";
import { UiRobotAi } from "@flanksource/clicky-ui/icons";
import { AgentIdentityProvider, type AgentIdentityMetadata } from "@flanksource/clicky-ui/chat";

import {
  fetchAgentSessions,
  forgetAgentSession,
  setPageAutoRun,
  stopAgentSession,
  updateAgentSessionSettings,
  type AgentSessionRuntime,
  type AgentSessionSettings,
  type AgentSessionsView,
  type AgentTarget,
  type SessionAgentTarget,
  createAgentSession,
} from "./agent-runs-api";
import { AgentRunChip } from "./AgentRunChip";
import { rememberAgentTarget, sessionAgentTarget } from "./agent-targets";
import { readPageTarget, rememberPageTarget } from "./page-targets";
import { AgentSendFailure } from "./AgentSendFailure";
import { AgentSessionPanel } from "./AgentSessionPanel";
import { RunAgentDialog } from "./RunAgentDialog";
import { useCaptainSessions } from "./useCaptainSessions";
import { useProjectSession } from "./useProjectSession";
import { fetchComments, PLAYGROUND_COMMENT_CONFIG, type AgentRunOptions, type PageComment } from "../comments/useComments";

type AgentRunsContext = {
  project?: string;
  selectProject?: (project: string) => void;
  savedRuntime?: AgentSessionRuntime;
  ready: boolean;
  /** Sends a thread; `target` first points the thread's page at that session. */
  start: (comment: Comment, target?: AgentTarget) => Promise<void>;
  /** Menu entries for a comment's Assign menu. */
  extraAssignItems: (comment: Comment) => DropdownMenuItem[];
  /** The "sent to agent session" chip for a comment, or nothing. */
  renderRunDetails: (comment: Comment) => ReactNode;
  /** Settings and sessions, as last reported by the playground server. */
  data: AgentSessionsView | null;
  error: string | null;
  /** Opens the sessions panel, optionally focused on one captain session. */
  openPanel: (sessionId?: string) => void;
  /** The live session this browser sends `page`'s threads to; undefined for the playground session. */
  target: SessionAgentTarget | undefined;
  /** Whether gavel delivers new human comments on `page` to the playground's agent as they are created. */
  autoRun: boolean;
  /** Switches `autoRun` for `page`; absent on routes that have no page. */
  setAutoRun?: (enabled: boolean) => void;
  createSession: (project: string, runtime: AgentSessionRuntime) => Promise<void>;
  busy: boolean;
  changeSettings: (patch: Partial<AgentSessionSettings>) => void;
  configureRuntime: () => void;
  /** Chooses the session `page`'s threads are sent to (kept in this browser); rejects when no `page` was given. */
  setTarget: (target: AgentTarget) => Promise<void>;
  /** How many open threads `page` has, which "assign all" would send. */
  openThreads: number;
  /**
   * Sends every open thread of `page` into one session in a single delivery.
   * A chosen session becomes the page's target; a new session becomes it once
   * gavel records it on a thread. Absent without a page, in a project scope, or without `runBatch`.
   */
  assignAll?: (choice: AssignAllChoice) => Promise<void>;
};

export type AssignAllChoice = { kind: "session"; target: SessionAgentTarget } | { kind: "new" };

/** What the runtime dialog is open for: a thread to run, the open threads to assign, or the runtime setting. */
type DialogTarget =
  | { mode: "run"; comment: Comment }
  | { mode: "assign-all" }
  | { mode: "configure"; enableAutoRun: boolean };

/** The hand-off each thread had when a run was sent, so only a newer one is taken for that run's session. */
type PendingAdoption = { page: string; before: Record<string, string | undefined> };

const AgentRuns = createContext<AgentRunsContext | null>(null);

export function useAgentRuns(): AgentRunsContext {
  const value = useContext(AgentRuns);
  if (!value) {
    throw new Error("useAgentRuns must be used inside <AgentRunsProvider>");
  }
  return value;
}

const NO_LIVE_SESSION = /no live agent session/;

/** An unresolved thread root on `page`; a comment that names no page belongs to the page the provider is open on. */
function isOpenRoot(comment: Comment, page: string | undefined): boolean {
  return !comment.parentId && ((comment as Partial<PageComment>).page ?? page) === page && isUnresolved(PLAYGROUND_COMMENT_CONFIG, comment.status);
}

function describeError(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}

function runAgentTitle(
  data: AgentSessionsView | null,
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
  runBatch,
  page,
  projectScope = false,
  children,
}: {
  runAgent: (id: string, runtime?: AgentSessionRuntime, options?: AgentRunOptions) => Promise<void>;
  /** Sends every open thread of a page into one session; without it no "assign all" is offered. */
  runBatch?: (page: string, runtime?: AgentSessionRuntime, options?: AgentRunOptions) => Promise<void>;
  /** The page whose agent target "Run agent" describes and `setTarget` changes. */
  page?: string;
  projectScope?: boolean;
  children: ReactNode;
}) {
  const [data, setData] = useState<AgentSessionsView | null>(null);
  const projectSession = useProjectSession(projectScope, page, data);
  const [panelError, setPanelError] = useState<string | null>(null);
  const [panel, setPanel] = useState<{ focusSessionId: string | null } | null>(
    null,
  );
  const [target, setTarget] = useState<DialogTarget | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [failedSend, setFailedSend] = useState<{ comment: Comment; error: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [adoption, setAdoption] = useState<PendingAdoption | null>(null);
  const { sessions: listedSessions } = useCaptainSessions();
  const threads = (useCommentContextOptional()?.comments ?? []) as readonly Comment[];
  const threadsRef = useRef(threads);
  threadsRef.current = threads;
  const openThreads = threads.filter(comment => isOpenRoot(comment, page)).length;

  const refresh = useCallback(async () => {
    try {
      setData(await fetchAgentSessions(page));
      setPanelError(null);
    } catch (cause) {
      setPanelError(describeError(cause));
    }
  }, [page]);

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

  // The session a page's threads go to is this browser's choice (localStorage), read again whenever it changes.
  const [chosenVersion, setChosenVersion] = useState(0);
  const chosenTarget = useMemo(() => (page ? readPageTarget(page) : undefined), [page, chosenVersion]);
  const selectedTarget = projectScope ? projectSession.target : chosenTarget;
  const pageTarget = selectedTarget?.kind === "playground" ? undefined : selectedTarget;
  const autoRun = page ? data?.pages[page]?.autoRun ?? false : false;
  // New and replacement sessions start with the configured runtime, so only a
  // playground without one needs the runtime dialog.
  const hasRuntime = data?.settings.runtime !== undefined;

  const choosePageTarget = useCallback(
    (chosenPage: string, next: AgentTarget) => {
      rememberPageTarget(chosenPage, next);
      setChosenVersion((version) => version + 1);
      if (projectScope) projectSession.remember({ target: next });
      rememberAgentTarget(next);
    },
    [projectScope, projectSession],
  );

  const changePageTarget = useCallback(
    async (next: AgentTarget) => {
      if (!page) throw new Error("AgentRunsProvider has no page to set a target for");
      choosePageTarget(page, next);
    },
    [page, choosePageTarget],
  );

  const pageOf = useCallback(async (comment: Comment) => {
    const commentPage = "page" in comment && typeof comment.page === "string" ? comment.page : page ?? (await fetchComments()).find(entry => entry.id === comment.id)?.page;
    if (!commentPage) throw new Error(`Cannot find the page for comment ${comment.id}`);
    return commentPage;
  }, [page]);

  /** The hand-off each of `ids` has now, so a run sent next is told from the ones before it. */
  const snapshotHandOffs = useCallback(
    (ids: string[]): Record<string, string | undefined> =>
      Object.fromEntries(ids.map(id => [id, threadsRef.current.find(comment => comment.id === id)?.agentRun?.requestedAt])),
    [],
  );

  /** `target` is the session just chosen for the thread; without one, the browser's choice for the comment's page applies. */
  const send = useCallback(
    async (comment: Comment, options: { runtime?: AgentSessionRuntime; target?: AgentTarget; fresh?: boolean } = {}) => {
      const { runtime, target: explicit, fresh = false } = options;
      const commentPage = await pageOf(comment);
      const chosen = explicit ?? (projectScope ? projectSession.target : readPageTarget(commentPage));
      const session = chosen?.kind === "playground" ? undefined : chosen;
      if (projectScope && !explicit && (!projectSession.ready || !session)) throw new Error("Choose an available project session before sending feedback");
      const before = snapshotHandOffs([comment.id]);
      await runAgent(comment.id, runtime, { ...(fresh ? { fresh: true } : {}), ...(session ? { target: session } : {}) });
      if (!session && !projectScope) setAdoption({ page: commentPage, before });
      if (projectScope && runtime) projectSession.remember({ runtime });
      await refresh();
    },
    [refresh, runAgent, projectScope, projectSession, pageOf, snapshotHandOffs],
  );

  const pointAt = useCallback(async (comment: Comment, next: AgentTarget) => {
    choosePageTarget(await pageOf(comment), next);
  }, [choosePageTarget, pageOf]);

  const retry = useCallback(async (comment: Comment, next?: AgentTarget) => {
    if (next) await pointAt(comment, next);
    await send(comment, next ? { target: next } : {});
  }, [pointAt, send]);

  /** A new playground-managed session for the thread; the page's auto-run and chosen session stay as they are. */
  const retryFresh = useCallback((comment: Comment) => send(comment, { fresh: true }), [send]);
  // A page that sends to a live session, or a project session, has no playground-managed run to restart.
  const canRetryFresh = !projectScope && !pageTarget;

  const openDialog = useCallback((next: DialogTarget) => {
    setDialogError(null);
    setTarget(next);
  }, []);

  // Gavel records a run's session on the thread after the delivery returns, so the page adopts it once a newer hand-off names one.
  const runtimeModel = data?.settings.runtime?.spec.model;
  useEffect(() => {
    if (!adoption || adoption.page !== page) return;
    const newer = Object.entries(adoption.before).flatMap(([id, requestedAt]) => {
      const run = threads.find(comment => comment.id === id)?.agentRun;
      return run && run.requestedAt !== requestedAt ? [run] : [];
    });
    const started = newer.find(run => run.sessionId && run.state !== "error");
    if (started?.sessionId) {
      try {
        choosePageTarget(adoption.page, { kind: "managed", sessionId: started.sessionId, label: runtimeModel ? `${adoption.page} · ${runtimeModel}` : started.sessionId });
      } catch (cause) {
        setPanelError(describeError(cause));
      }
      setAdoption(null);
    } else if (newer.length === Object.keys(adoption.before).length && newer.every(run => run.state === "error")) {
      setAdoption(null);
    }
  }, [adoption, threads, page, choosePageTarget, runtimeModel]);

  /** A new playground-managed session for every open thread of the page, which the page adopts once gavel starts it. */
  const sendAllToNewSession = useCallback(
    async (runtime?: AgentSessionRuntime) => {
      if (!page || !runBatch) throw new Error("AgentRunsProvider has no page or batch sender to assign threads with");
      const before = snapshotHandOffs(threadsRef.current.filter(comment => isOpenRoot(comment, page)).map(comment => comment.id));
      await runBatch(page, runtime, { fresh: true });
      setAdoption({ page, before });
      await refresh();
    },
    [page, runBatch, snapshotHandOffs, refresh],
  );

  const assignAll = useCallback(
    async (choice: AssignAllChoice) => {
      if (!page || !runBatch) throw new Error("AgentRunsProvider has no page or batch sender to assign threads with");
      if (choice.kind === "session") {
        choosePageTarget(page, choice.target);
        await runBatch(page, undefined, { target: choice.target });
        await refresh();
        return;
      }
      if (!hasRuntime) {
        openDialog({ mode: "assign-all" });
        return;
      }
      try {
        await sendAllToNewSession();
      } catch (cause) {
        // The runtime was cleared since the last poll; ask for one instead.
        if (!NO_LIVE_SESSION.test(describeError(cause))) throw cause;
        openDialog({ mode: "assign-all" });
      }
    },
    [page, runBatch, choosePageTarget, refresh, hasRuntime, openDialog, sendAllToNewSession],
  );

  const start = useCallback(
    async (comment: Comment, next?: AgentTarget) => {
      if (next) await pointAt(comment, next);
      // A session target is delivered into as it is, with no runtime to choose.
      if (!hasRuntime && !(next ? next.kind !== "playground" : pageTarget)) {
        openDialog({ mode: "run", comment });
        return;
      }
      try {
        await send(comment, next ? { target: next } : {});
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
    (patch: Partial<AgentSessionSettings>) => act(() => updateAgentSessionSettings(patch)),
    [act],
  );

  const setAutoRun = useCallback(
    (enabled: boolean) => {
      if (!page) throw new Error("AgentRunsProvider has no page to set auto-run for");
      // Auto-run starts the playground agent's sessions on its own, so it needs a runtime first.
      if (enabled && !hasRuntime) {
        openDialog({ mode: "configure", enableAutoRun: true });
        return;
      }
      act(() => setPageAutoRun(page, enabled));
    },
    [act, hasRuntime, openDialog, page],
  );

  const openPanel = useCallback(
    (sessionId?: string) => setPanel({ focusSessionId: sessionId ?? null }),
    [],
  );

  const value = useMemo<AgentRunsContext>(
    () => ({
      ready: projectSession.ready,
      ...(projectScope ? { project: projectSession.project, selectProject: (project: string) => { try { projectSession.remember({ project }); } catch (cause) { setPanelError(describeError(cause)); } }, ...(projectSession.runtime ? { savedRuntime: projectSession.runtime } : {}) } : {}),
      data,
      error: projectSession.error ?? panelError,
      busy,
      changeSettings,
      configureRuntime: () => openDialog({ mode: "configure", enableAutoRun: false }),
      createSession: async (project, runtime) => {
        if (!page) throw new Error("Select a page before creating a session");
        const result = await createAgentSession({ page, project, runtime });
        const target = { kind: "managed" as const, sessionId: result.session.sessionId, label: result.session.label ?? result.session.sessionId };
        // The new session must be in `data` before a project session validates it as the page's target.
        await refresh();
        rememberPageTarget(page, target);
        setChosenVersion((version) => version + 1);
        if (projectScope) projectSession.remember({ project, runtime, target });
        rememberAgentTarget(target);
      },
      start,
      openPanel,
      target: pageTarget,
      autoRun,
      ...(page ? { setAutoRun } : {}),
      setTarget: changePageTarget,
      openThreads,
      ...(page && runBatch && !projectScope ? { assignAll } : {}),
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
              ...(listedSessions ?? [])
                .filter(session => session.id !== pageTarget?.sessionId)
                .map(session => {
                  const sessionTarget = sessionAgentTarget(session);
                  return {
                    label: `Send to ${sessionTarget.label}${session.resumable ? " · resumes" : ""}`,
                    title: session.resumable ? `Resume ${session.title} and deliver this thread into it` : (session.cwd ?? session.id),
                    disabled: !isUnresolved(PLAYGROUND_COMMENT_CONFIG, comment.status),
                    onSelect: () => void start(comment, sessionTarget),
                  } satisfies DropdownMenuItem;
                }),
            ],
      renderRunDetails: (comment) =>
        comment.agentRun?.state === "error" ? (
          <div className="px-1">
            <AgentRunChip comment={comment} managedSessions={data?.sessions ?? []} onOpen={openPanel} onRetry={next => retry(comment, next)} {...(canRetryFresh ? { onRetryFresh: () => retryFresh(comment) } : {})} />
          </div>
        ) : null,
    }),
    [busy, changeSettings, openDialog, changePageTarget, data, panelError, hasRuntime, openPanel, pageTarget, autoRun, setAutoRun, retry, retryFresh, canRetryFresh, start, page, refresh, projectScope, projectSession, openThreads, runBatch, assignAll, listedSessions],
  );

  const submitRuntime = (runtime: AgentSessionRuntime) => {
    if (!target) return;
    setStarting(true);
    setDialogError(null);
    const work =
      target.mode === "run"
        ? send(target.comment, { runtime })
        : target.mode === "assign-all"
          ? sendAllToNewSession(runtime)
          : updateAgentSessionSettings({ runtime })
              .then(() => (target.enableAutoRun && page ? setPageAutoRun(page, true) : undefined))
              .then(refresh);
    work.then(
      () => {
        if (projectScope) projectSession.remember({ runtime });
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
    const metadata: AgentIdentityMetadata = { sessionName: session.label ?? session.sessionId, model, ...(typeof provider === "string" ? { provider } : {}), ...(typeof effort === "string" ? { effort } : {}) };
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
          {...(canRetryFresh ? { onRetryFresh: () => retryFresh(failedSend.comment) } : {})}
          onClose={() => setFailedSend(null)}
          onOpen={openPanel}
        />
      )}
      <RunAgentDialog
        open={target !== null}
        mode={target?.mode ?? "run"}
        grouping={data?.settings.grouping ?? "shared"}
        current={projectSession.runtime ?? data?.settings.runtime}
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
