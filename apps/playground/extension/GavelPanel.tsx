import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Button,
  CommentProvider,
  CommentSidePanel,
  DensityProvider,
  DOCUMENT_ANCHOR,
  Tabs,
  ThemeProvider,
  isUnresolved,
  useCommentContext,
  useCommentRailWidth,
  type Comment,
  type CommentCreateInput,
  type CommentScrollOptions,
  type DropdownMenuItem,
} from "@flanksource/clicky-ui";
import type { CommentAgentRun } from "@flanksource/clicky-ui/comments";
import { UiLayoutWindow, UiMinus, UiSidebar } from "@flanksource/clicky-ui/icons";
import type { AgentPin } from "@flanksource/page-runtime/schema";
import type { AgentPickerProps } from "../src/agent-runs/AgentPicker";
import { commentPins } from "../src/browser-mode/comment-pins";
import { AgentRunActions } from "./AgentRunActions";
import { freshTarget, retryTarget } from "./agent-retry";
import { FloatingDraft } from "../src/bookmarklet/FloatingDraft";
import { externalUrl, type AnchorState, type HostState, type Presentation } from "../src/bookmarklet/model";
import { requestPanelMode, sendToHost, useHostBridge } from "../src/bookmarklet/useHostBridge";
import { useHostDialog } from "../src/bookmarklet/useHostDialog";
import { RunAgentDialog } from "../src/agent-runs/RunAgentDialog";
import { agentAssignItems } from "./assign-items";
import { GavelClient, fetchRuntimeCatalog, type AgentSession, type DeliverTarget } from "./gavel-client";
import { EventSourceProvider } from "@flanksource/clicky-ui/hooks";
import { gavelEventHub } from "./gavel-streams";
import { pageSnapshot } from "./page-snapshot";
import { PanelComposer } from "./PanelComposer";
import { pickerSessions } from "./picker-sessions";
import { SessionTab, SessionTabLabel } from "./SessionTab";
import type { PanelTarget } from "./settings";
import { useAgentSessions, useAutoRoute, useRuntimeCatalog } from "./useGavelAgents";
import { GAVEL_COMMENT_CONFIG, useGavelComments, type GavelComments } from "./useGavelComments";

let detailOpen = false;

const TAB_KEY = "gavel.panel.tab";
const PAGE_SNAPSHOT_TIMEOUT_MS = 10_000;
type PanelTab = "comments" | "session";

function maximizeHost(open: boolean) {
  detailOpen = open;
  const stored = localStorage.getItem("playground.bookmarklet.width");
  sendToHost({ type: "sidebar-layout", width: stored === null ? 400 : Number(stored), maximized: open });
}

function describe(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}

/** The hand-off gavel recorded for a thread, as a one-line status. */
function agentRunNote(run: CommentAgentRun): string {
  const where = run.target?.label ?? run.sessionId ?? "an agent session";
  if (run.state === "error") return `Agent hand-off failed: ${run.error ?? "no reason recorded"}`;
  if (run.state === "done") return `Handled by ${where}`;
  return run.state === "queued" ? `Queued for ${where}` : `Sent to ${where}`;
}

export function GavelPanel({ target }: { target: PanelTarget }) {
  const client = useMemo(() => new GavelClient({ server: target.server, project: target.project }), [target.server, target.project]);
  // Every SSE stream the panel's components open (the session transcript's live follow) shares one hub connection to gavel.
  const streams = useMemo(() => gavelEventHub(target.server), [target.server]);
  const bridge = useHostBridge();
  const [sidebarWidth] = useCommentRailWidth(400, "playground.bookmarklet.width");
  useEffect(() => {
    sendToHost({ type: "sidebar-layout", width: sidebarWidth, maximized: detailOpen });
  }, [sidebarWidth]);
  const page = bridge.state ? { url: bridge.state.url, title: bridge.state.title } : undefined;
  const comments = useGavelComments({ client, page });
  const [agentSession, setAgentSession] = useState(target.agentSession);
  const [deliveryError, setDeliveryError] = useState("");
  const { sessions, error: sessionsError } = useAgentSessions(client);
  // The runtime for new sessions starts as the one the grabber was opened with; changing it here applies to this panel until it is closed.
  const [runtime, setRuntime] = useState(target.runtime);
  const { catalog, error: catalogError } = useRuntimeCatalog(target.server);
  const runDelivery = page ? client.runTarget({ page, grouping: target.grouping, ...(runtime ? { runtime } : {}) }) : undefined;
  const delivery: DeliverTarget | undefined = !page ? undefined : agentSession ? { kind: "session", sessionId: agentSession } : runDelivery;
  const [handingOff, setHandingOff] = useState(false);
  const autoRoute = useAutoRoute({ client, page, target: delivery });

  const chooseSession = (session: string | undefined) => {
    setAgentSession(session);
    try {
      sendToHost({ type: "settings", session: session ?? null });
    } catch (cause) {
      setDeliveryError(describe(cause));
    }
  };

  /** Delivers `comment` to the target `choose` returns; a failure is also recorded on the thread by gavel and so stays visible there. */
  async function deliverTo(comment: Comment, choose: () => DeliverTarget) {
    setDeliveryError("");
    setHandingOff(true);
    try {
      const next = choose();
      const result = await comments.deliver(comment.id, next);
      // A run starts a session; keep following it, here and in the page's settings.
      if (next.kind === "run" && result.agentRun?.sessionId) chooseSession(result.agentRun.sessionId);
    } catch (cause) {
      setDeliveryError(describe(cause));
    } finally {
      setHandingOff(false);
    }
  }
  const pageNotReported = () => new Error("The grabber has not reported the page yet");
  const currentDelivery = () => {
    if (!delivery) throw pageNotReported();
    return delivery;
  };
  const sendFresh = (comment: Comment) => deliverTo(comment, () => {
    if (!runDelivery) throw pageNotReported();
    return freshTarget(runDelivery);
  });
  const retry = (comment: Comment, run: CommentAgentRun) => deliverTo(comment, () => retryTarget({ run, delivery: currentDelivery() }));
  const renderRunDetails = (comment: Comment) => {
    const run = comment.agentRun;
    if (!run) return null;
    return (
      <>
        <p role="status" className="px-1 text-xs text-muted-foreground">{agentRunNote(run)}</p>
        <AgentRunActions
          state={run.state}
          {...(comment.status !== undefined ? { status: comment.status } : {})}
          busy={handingOff}
          onRetry={() => void retry(comment, run)}
          onRetryFresh={() => void sendFresh(comment)}
          onSendFresh={() => void sendFresh(comment)}
        />
      </>
    );
  };

  const picker: AgentPickerProps = {
    heading: "Agent",
    runtime: { value: runtime, catalog, onChange: setRuntime, emptyLabel: "Gavel's default" },
    autoRun: { checked: autoRoute.enabled, disabled: !autoRoute.ready, onChange: enabled => void autoRoute.set(enabled) },
    sessions: {
      items: pickerSessions({ sessions, selectedId: agentSession }),
      state: sessions ? "ready" : sessionsError ? "error" : "loading",
      selectedId: agentSession,
      onSelect: session => chooseSession(session.id),
      onNew: () => chooseSession(undefined),
      selectLabel: session => `Use session ${session.title}`,
    },
  };
  const selectedSession = agentSession ? sessions?.find(session => session.id === agentSession) : undefined;
  // The thread whose Advanced… assignment is being chosen.
  const [advanced, setAdvanced] = useState<Comment>();
  const loadCatalog = useCallback(() => fetchRuntimeCatalog({ server: target.server }), [target.server]);
  const error = comments.error ?? bridge.error;
  const alerts = [error, deliveryError, sessionsError, catalogError, autoRoute.error].filter((message): message is string => !!message);

  return (
    <ThemeProvider>
      <EventSourceProvider value={streams}>
      <DensityProvider>
        <main className="flex h-dvh min-h-0 flex-col bg-background text-foreground">
          {!bridge.state && (
            <>
              <Alerts messages={alerts} />
              {!bridge.error && <p role="status" className="p-3 text-sm">Connecting to this page…</p>}
            </>
          )}
          {bridge.state && (
            <GavelRail
              state={bridge.state}
              comments={comments}
              floating={bridge.floating}
              presentation={bridge.presentation}
              anchors={bridge.anchors}
              {...(bridge.focus ? { focus: bridge.focus } : {})}
              alerts={<Alerts messages={alerts} />}
              renderRunDetails={renderRunDetails}
              session={{ server: target.server, sessionId: agentSession, session: selectedSession, liveCount: sessions?.length, picker }}
              extraAssignItems={comment => comment.parentId ? [] : agentAssignItems({
                session: selectedSession,
                runtime,
                disabled: !isUnresolved(GAVEL_COMMENT_CONFIG, comment.status),
                onSession: () => void deliverTo(comment, () => {
                  if (!agentSession) throw new Error("No agent session is chosen for this page");
                  return { kind: "session", sessionId: agentSession };
                }),
                onNew: () => void sendFresh(comment),
                onAdvanced: () => setAdvanced(comment),
              })}
            />
          )}
        </main>
        <RunAgentDialog
          open={advanced !== undefined}
          mode="assign"
          grouping={target.grouping}
          current={runtime}
          error={deliveryError || null}
          busy={handingOff}
          loadCatalog={loadCatalog}
          onClose={() => setAdvanced(undefined)}
          onRun={chosen => {
            if (!advanced) return;
            void deliverTo(advanced, () => {
              if (!page) throw pageNotReported();
              return freshTarget(client.runTarget({ page, grouping: target.grouping, runtime: chosen }));
            }).then(() => setAdvanced(undefined));
          }}
        />
      </DensityProvider>
      </EventSourceProvider>
    </ThemeProvider>
  );
}

function Alerts({ messages }: { messages: string[] }) {
  if (messages.length === 0) return null;
  return (
    <div role="alert" className="shrink-0 space-y-1 border-b border-border p-3 text-sm text-destructive">
      {messages.map(message => <p key={message}>{message}</p>)}
    </div>
  );
}

type RailProps = {
  state: HostState;
  comments: GavelComments;
  floating: boolean;
  presentation: Presentation;
  anchors: AnchorState[];
  focus?: string;
  alerts: ReactNode;
  renderRunDetails: (comment: Comment) => ReactNode;
  session: { server: string; sessionId: string | undefined; session: AgentSession | undefined; liveCount: number | undefined; picker: AgentPickerProps };
  extraAssignItems: (comment: Comment) => DropdownMenuItem[];
};

function GavelRail(props: RailProps) {
  const { state, comments, anchors } = props;
  const navigate = (anchor: string, options: CommentScrollOptions) => {
    if (!anchors.some(value => value.anchor === anchor && value.available)) return false;
    sendToHost({ type: "scroll", anchor, ...options });
    return true;
  };
  return (
    <CommentProvider
      persistenceKey={`gavel:${externalUrl(state.url).base}`}
      comments={comments.comments}
      config={GAVEL_COMMENT_CONFIG}
      initialRailMode="all"
      onCreate={async input => {
        const selection = state.selection;
        if (!selection || input.anchor !== selection.anchor || externalUrl(selection.element.pageUrl ?? "").url !== externalUrl(state.url).url)
          throw new Error("Select an element or Comment on page on the current URL before posting this draft");
        await comments.create(input, selection);
      }}
      onReply={comments.reply}
      onUpdateStatus={comments.updateStatus}
      onClose={comments.close}
      onAcknowledge={comments.acknowledge}
      onAssign={comments.assign}
      onDelete={comments.remove}
      onScrollToAnchor={navigate}
      getAnchorTop={anchor => anchors.find(value => value.anchor === anchor && value.available)?.top ?? null}
    >
      <RailContents {...props} />
    </CommentProvider>
  );
}

function readTab(): PanelTab {
  return localStorage.getItem(TAB_KEY) === "session" ? "session" : "comments";
}

function RailContents({ state, comments, floating, presentation, anchors, focus, alerts, renderRunDetails, session, extraAssignItems }: RailProps) {
  const ctx = useCommentContext();
  const [tab, setTab] = useState<PanelTab>(readTab);
  const [snapshot] = useState(() => pageSnapshot({ requestPage: () => sendToHost({ type: "page" }), timeoutMs: PAGE_SNAPSHOT_TIMEOUT_MS }));
  const chooseTab = (next: string) => {
    const value: PanelTab = next === "session" ? "session" : "comments";
    setTab(value);
    localStorage.setItem(TAB_KEY, value);
  };
  useHostDialog();
  const labels = Object.fromEntries(anchors.map(value => [value.anchor, value.label]));
  if (state.selection) labels[state.selection.anchor] = state.selection.label;
  const pins = JSON.stringify(commentPins(comments.comments.filter(comment => ctx.comments.some(visible => visible.id === comment.id))));
  useEffect(() => {
    sendToHost({ type: "pins", anchors: JSON.parse(pins) as AgentPin[] });
  }, [pins, state]);
  useEffect(() => {
    if (!state.selection) return;
    // A snapshot the footer composer asked for posts from there instead of opening a floating draft.
    if (snapshot.claim(state.selection)) return;
    ctx.focusAnchor(state.selection.anchor);
    sendToHost({ type: "draft", active: true, anchor: state.selection.anchor });
  }, [state.selection, ctx.focusAnchor]);
  useEffect(() => {
    if (focus) { ctx.focusAnchor(focus); chooseTab("comments"); }
  }, [focus, ctx.focusAnchor]);
  useEffect(() => {
    sendToHost({ type: "highlight", anchor: ctx.highlightAnchor });
  }, [ctx.highlightAnchor]);
  if (floating && state.selection) return <FloatingDraft selection={state.selection} />;

  const openThreads = comments.comments.filter(comment => !comment.parentId && isUnresolved(GAVEL_COMMENT_CONFIG, comment.status)).length;
  const postPageComment = async (input: CommentCreateInput) => {
    const selection = await snapshot.request();
    await comments.create({ ...input, anchor: DOCUMENT_ANCHOR }, selection);
  };
  const rail = presentation === "rail";
  return (
    <>
      <header className="flex shrink-0 items-center gap-1 border-b border-border pr-1" title={state.url}>
        <Tabs
          className="min-w-0 flex-1 border-b-0"
          value={tab}
          onChange={chooseTab}
          tabs={[
            { id: "comments", label: "Comments", count: openThreads },
            { id: "session", label: <SessionTabLabel sessionId={session.sessionId} session={session.session} /> },
          ]}
        />
        <Button
          size="icon"
          variant="ghost"
          className="size-7 shrink-0"
          aria-label={rail ? "Show as hover panel" : "Dock as side rail"}
          title={rail ? "Show as hover panel" : "Dock as side rail"}
          onClick={() => requestPanelMode(rail ? "compact" : "rail")}
        >
          {rail ? <UiLayoutWindow className="size-4" aria-hidden /> : <UiSidebar className="size-4" aria-hidden />}
        </Button>
        <Button size="icon" variant="ghost" className="size-7 shrink-0" aria-label="Minimize" title="Minimize" onClick={() => sendToHost({ type: "minimize" })}>
          <UiMinus className="size-4" aria-hidden />
        </Button>
      </header>
      {alerts}
      {tab === "session" ? (
        // The inspector scrolls its own transcript under a fixed toolbar, so this body does not scroll.
        <div className="flex min-h-0 flex-1 flex-col">
          <SessionTab server={session.server} sessionId={session.sessionId} liveCount={session.liveCount} picker={session.picker} />
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            <CommentSidePanel
              previewLines={3}
              onMaximizedChange={maximizeHost}
              compact
              hideComposer
              focusedAlignment="flow"
              className="!w-full"
              anchorLabels={labels}
              formatAnchorLabel={anchor => anchor}
              extraAssignItems={extraAssignItems}
              renderRootDetails={renderRunDetails}
            />
            {anchors.some(anchor => !anchor.available) && (
              <p role="status" className="mt-3 text-xs text-muted-foreground">Some anchors are unavailable. Their comments are retained.</p>
            )}
          </div>
          <PanelComposer
            config={GAVEL_COMMENT_CONFIG}
            onPost={postPageComment}
            onPick={({ screenshot }) => sendToHost({ type: "pick", ...(screenshot ? { screenshot } : {}) })}
          />
        </>
      )}
    </>
  );
}
