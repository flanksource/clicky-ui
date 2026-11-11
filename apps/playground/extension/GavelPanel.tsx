import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Button,
  CommentProvider,
  CommentSidePanel,
  DensityProvider,
  ThemeProvider,
  isUnresolved,
  useCommentContext,
  useCommentRailWidth,
  type Comment,
  type CommentScrollOptions,
  type DropdownMenuItem,
} from "@flanksource/clicky-ui";
import type { CommentAgentRun } from "@flanksource/clicky-ui/comments";
import { UiRobotAi } from "@flanksource/clicky-ui/icons";
import type { AgentPin } from "@flanksource/page-runtime/schema";
import { AgentPicker, type AgentPickerProps } from "../src/agent-runs/AgentPicker";
import { commentPins } from "../src/browser-mode/comment-pins";
import { AgentRunActions } from "./AgentRunActions";
import { freshTarget, retryTarget } from "./agent-retry";
import { FloatingDraft } from "../src/bookmarklet/FloatingDraft";
import { externalUrl, type AnchorState, type HostState, type Presentation } from "../src/bookmarklet/model";
import { sendToHost, useHostBridge } from "../src/bookmarklet/useHostBridge";
import { GavelClient, type DeliverTarget } from "./gavel-client";
import { pickerSessions } from "./picker-sessions";
import type { PanelTarget } from "./settings";
import { useAgentSessions, useAutoRoute, useRuntimeCatalog } from "./useGavelAgents";
import { GAVEL_COMMENT_CONFIG, useGavelComments, type GavelComments } from "./useGavelComments";

let detailOpen = false;

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
  const send = (comment: Comment) => deliverTo(comment, currentDelivery);
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
  const sessionName = agentSession ? (sessions?.find(session => session.id === agentSession)?.title ?? agentSession) : undefined;
  const error = comments.error ?? bridge.error;

  return (
    <ThemeProvider>
      <DensityProvider>
        <main className="flex h-dvh min-h-0 flex-col bg-background text-foreground">
          <header className={bridge.floating ? "hidden" : "flex items-center gap-2 border-b border-border p-3"}>
            <h1 className="min-w-0 flex-1 truncate text-sm font-semibold" title={bridge.state?.url}>
              Gavel comments · {target.project}
            </h1>
            <Button size="sm" variant="ghost" onClick={() => sendToHost({ type: "minimize" })}>Minimize</Button>
            <Button size="sm" variant="ghost" onClick={() => sendToHost({ type: "close" })}>Close</Button>
          </header>
          {(error || deliveryError || sessionsError || catalogError || autoRoute.error) && (
            <div role="alert" className="space-y-1 p-3 text-sm text-destructive">
              {[error, deliveryError, sessionsError, catalogError, autoRoute.error].filter(Boolean).map(message => <p key={message}>{message}</p>)}
            </div>
          )}
          {!bridge.state && !bridge.error && <p role="status" className="p-3 text-sm">Connecting to this page…</p>}
          {bridge.state && (
            <div className={bridge.floating ? "min-h-0 flex-1 overflow-y-auto p-2" : "min-h-0 flex-1 overflow-y-auto p-3"}>
              <GavelRail
                state={bridge.state}
                comments={comments}
                floating={bridge.floating}
                presentation={bridge.presentation}
                anchors={bridge.anchors}
                {...(bridge.focus ? { focus: bridge.focus } : {})}
                picker={picker}
                renderRunDetails={renderRunDetails}
                extraAssignItems={comment => comment.parentId ? [] : [{
                  label: sessionName ? `Send to ${sessionName}` : "Run agent",
                  icon: UiRobotAi,
                  title: sessionName ? `Deliver this thread into the live session ${sessionName}` : "Start an agent session for this page and send this thread to it",
                  disabled: !isUnresolved(GAVEL_COMMENT_CONFIG, comment.status),
                  onSelect: () => void send(comment),
                } satisfies DropdownMenuItem]}
              />
            </div>
          )}
        </main>
      </DensityProvider>
    </ThemeProvider>
  );
}

type RailProps = {
  state: HostState;
  comments: GavelComments;
  floating: boolean;
  presentation: Presentation;
  anchors: AnchorState[];
  focus?: string;
  renderRunDetails: (comment: Comment) => ReactNode;
  picker: AgentPickerProps;
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

function RailContents({ state, comments, floating, presentation, anchors, focus, renderRunDetails, picker, extraAssignItems }: RailProps) {
  const ctx = useCommentContext();
  useEffect(() => {
    const open = () => !!document.querySelector('[aria-modal="true"], [role="listbox"], [role="menu"]');
    let previous = false;
    const update = () => {
      const now = open();
      if (now !== previous) { previous = now; sendToHost({ type: "dialog", open: now }); }
    };
    const observer = new MutationObserver(update);
    observer.observe(document.body, { subtree: true, childList: true });
    update();
    return () => { observer.disconnect(); if (previous) sendToHost({ type: "dialog", open: false }); };
  }, []);
  const labels = Object.fromEntries(anchors.map(value => [value.anchor, value.label]));
  if (state.selection) labels[state.selection.anchor] = state.selection.label;
  const pins = JSON.stringify(commentPins(comments.comments.filter(comment => ctx.comments.some(visible => visible.id === comment.id))));
  useEffect(() => {
    sendToHost({ type: "pins", anchors: JSON.parse(pins) as AgentPin[] });
  }, [pins, state]);
  useEffect(() => {
    if (!state.selection) return;
    ctx.focusAnchor(state.selection.anchor);
    sendToHost({ type: "draft", active: true, anchor: state.selection.anchor });
  }, [state.selection, ctx.focusAnchor]);
  useEffect(() => {
    if (focus) ctx.focusAnchor(focus);
  }, [focus, ctx.focusAnchor]);
  useEffect(() => {
    sendToHost({ type: "highlight", anchor: ctx.highlightAnchor });
  }, [ctx.highlightAnchor]);
  if (floating && state.selection) return <FloatingDraft selection={state.selection} />;
  return (
    <>
      <p className="mb-3 break-all text-xs text-muted-foreground">{state.url}</p>
      <div className="mb-3 max-h-[60dvh] overflow-y-auto rounded border border-border">
        <AgentPicker {...picker} />
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => sendToHost({ type: "pick" })}>Select element</Button>
        <Button size="sm" variant="outline" onClick={() => sendToHost({ type: "pick", screenshot: true })}>Select with screenshot</Button>
        <Button size="sm" variant="outline" onClick={() => sendToHost({ type: "page" })}>Comment on page</Button>
        {presentation === "compact" && <Button size="sm" variant="outline" onClick={() => sendToHost({ type: "open-rail" })}>Open sidebar</Button>}
      </div>
      {presentation === "compact" ? null : (
        <CommentSidePanel
          previewLines={3}
          onMaximizedChange={maximizeHost}
          compact
          focusedAlignment="flow"
          className="!w-full"
          anchorLabels={labels}
          formatAnchorLabel={anchor => anchor}
          createActions={[{ id: "plain", label: state.selection?.element.screenshot ? "Post with screenshot" : "Post comment" }]}
          extraAssignItems={extraAssignItems}
          renderRootDetails={renderRunDetails}
        />
      )}
      {anchors.some(anchor => !anchor.available) && (
        <p role="status" className="mt-3 text-xs text-muted-foreground">Some anchors are unavailable. Their comments are retained.</p>
      )}
    </>
  );
}
