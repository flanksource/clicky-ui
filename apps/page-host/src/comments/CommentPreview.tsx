import { useCallback, useEffect, useMemo, useRef, useState, type ComponentProps } from "react";
import { Button, Checkbox } from "@flanksource/clicky-ui";
import { CommentComposer, CommentProvider, CommentRail, CommentThreadList, DEFAULT_COMMENT_STATUSES, type CommentConfig, type CommentCreateInput } from "@flanksource/clicky-ui/comments";
import type { AgentAnchorState, AgentFrameMessage, AgentSelection, FrameMessage } from "@flanksource/page-runtime/schema";
import type { PageBridge } from "@flanksource/page-runtime/host";
import { Preview } from "../Preview";
import type { SourceProvider } from "../providers/types";
import { captureSelection } from "./screenshot";
import { commentStore, type StoredComment } from "./store";

const identity = { id: "local-reviewer", name: "Local reviewer", kind: "user" as const };
const config: CommentConfig = { statuses: DEFAULT_COMMENT_STATUSES, assignees: [identity] };

export function CommentPreview({ provider, ...preview }: ComponentProps<typeof Preview> & { provider: SourceProvider }) {
  const [bridge, setBridge] = useState<PageBridge | null>(null);
  const [rail, setRail] = useState(false);
  const [mode, setMode] = useState(false);
  const [selection, setSelection] = useState<AgentSelection | null>(null);
  const [comments, setComments] = useState<StoredComment[]>([]);
  const [anchors, setAnchors] = useState<AgentAnchorState[]>([]);
  const [focus, setFocus] = useState<string | null>(null);
  const [screenshot, setScreenshot] = useState<string | undefined>();
  const [captureOnPick, setCaptureOnPick] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const store = useRef<Awaited<ReturnType<typeof commentStore>> | null>(null);
  const current = useRef(comments); current.current = comments;
  const writes = useRef(Promise.resolve());
  const container = useRef<HTMLDivElement>(null);
  const geometry = useRef<Extract<AgentFrameMessage, { type: "geometry" }> | null>(null);
  const selectedGeometry = useRef<string | null>(null);
  const page = preview.project.entry;
  const fail = useCallback((cause: unknown) => setError(cause instanceof Error ? cause.message : String(cause)), []);

  useEffect(() => {
    let disposed = false;
    void (async () => {
      const persistence = await commentStore({ provider, project: preview.project.name });
      const saved = await persistence.load(page);
      if (!disposed) { store.current = persistence; setComments(saved); setLoaded(true); }
    })().catch(fail);
    return () => { disposed = true; };
  }, [provider, preview.project.name, page, fail]);

  const pins = useMemo(() => Object.values(comments.reduce<Record<string, { anchor: string; count: number; locators: AgentSelection["element"]["locators"] }>>((result, comment) => {
    if (!comment.parentId && comment.selection && comment.selection.anchor !== "__document__") {
      const anchor = comment.selection.anchor;
      const existing = result[anchor];
      if (existing) existing.count++; else result[anchor] = { anchor, count: 1, locators: comment.selection.element.locators };
    }
    return result;
  }, {})), [comments]);
  useEffect(() => {
    if (bridge && ready) bridge.send({ type: "pins", anchors: pins, focus });
  }, [bridge, ready, pins, focus]);
  useEffect(() => {
    if (rail && focus) container.current?.querySelector<HTMLElement>('[data-comment-id][aria-current="true"]')?.scrollIntoView({ block: "nearest" });
  }, [focus, rail]);

  function save(update: (previous: StoredComment[]) => StoredComment[]): Promise<void> {
    const pending = writes.current.then(async () => {
      if (!store.current || !loaded) throw new Error("Comment sidecar is not loaded");
      const next = update(current.current);
      await store.current.save({ page, comments: next });
      current.current = next; setComments(next);
    });
    writes.current = pending;
    return pending;
  }

  async function capture(picked: AgentSelection) {
    const frame = container.current?.querySelector<HTMLIFrameElement>('iframe[title="Page preview"]');
    if (!frame) throw new Error("Preview frame is unavailable");
    if (selectedGeometry.current !== JSON.stringify(geometry.current)) throw new Error("The page scrolled or resized after selection. Pick the element again before capturing.");
    setCapturing(true); setError("");
    try { setScreenshot(await captureSelection({ frame, rect: picked.rect })); }
    finally { setCapturing(false); }
  }

  function receive(message: FrameMessage) {
    if (message.type === "status") setReady(message.state === "ready");
    if (message.type === "error") setReady(false);
    if (message.type === "selection") {
      selectedGeometry.current = JSON.stringify(geometry.current);
      setRail(true); setSelection(message.selection); setFocus(message.selection.anchor); setScreenshot(undefined); setMode(false);
      if (captureOnPick) void capture(message.selection).catch(fail);
    }
    if (message.type === "anchors") setAnchors(message.anchors);
    if (message.type === "focus") { setRail(true); setFocus(message.anchor); }
    if (message.type === "keys") {
      if (message.key === "Escape") { setMode(false); bridge?.send({ type: "mode", mode: "off" }); }
      else { setRail(true); setMode(!mode); bridge?.send({ type: "mode", mode: mode ? "off" : "comment" }); }
    }
    if (message.type === "geometry") {
      geometry.current = message;
    }
  }

  async function create(input: CommentCreateInput) {
    if (!selection) throw new Error("Pick an element or choose Whole-page comment");
    const picked = selection;
    await save((previous) => [...previous, { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString(), author: identity, status: "open", selection: picked, ...(screenshot ? { screenshot } : {}) }]);
    setSelection(null); setScreenshot(undefined); bridge?.send({ type: "highlight", anchor: null });
  }

  function navigate(anchor: string) {
    setFocus(anchor); bridge?.send({ type: "highlight", anchor });
    if (anchors.find((state) => state.anchor === anchor)?.state !== "orphaned") bridge?.send({ type: "scroll", anchor, block: "center" });
  }

  const toolbar = <>
    <Button size="sm" variant="outline" disabled={!ready} aria-pressed={mode} onClick={() => {
      setRail(true); setMode(!mode); bridge?.send({ type: "mode", mode: mode ? "off" : "comment" });
    }}>Comment on element</Button>
    <Button size="sm" variant="ghost" onClick={() => setRail(!rail)} aria-expanded={rail}>Comments ({comments.length})</Button>
  </>;

  return <CommentProvider comments={comments} config={config} persistenceKey={`page-host:${provider.id}:${preview.project.name}:${page}`} initialRailMode="all"
    onCreate={create} onScrollToAnchor={(anchor) => { navigate(anchor); return true; }} getAnchorTop={(anchor) => anchors.find((item) => item.anchor === anchor)?.rect?.top ?? null}>
    <div ref={container} className="flex h-full min-h-0 overflow-hidden">
      <div className="min-w-0 flex-1"><Preview {...preview} toolbar={toolbar} onBridge={setBridge} onMessage={receive} /></div>
      {rail && <CommentRail width={340} stacked={false}>
        <section aria-label="Page comments" className="space-y-3 p-3 text-sm">
          <div className="flex items-center justify-between"><h2 className="font-semibold">Comments</h2><Button size="sm" variant="ghost" onClick={() => { setRail(false); setMode(false); bridge?.send({ type: "mode", mode: "off" }); }}>Close comments</Button></div>
          {error && <p role="alert" className="text-destructive">{error}</p>}
          {!loaded && <p role="status">Loading comment sidecar…</p>}
          <Button size="sm" variant="outline" disabled={!ready} onClick={() => bridge?.send({ type: "page" })}>Whole-page comment</Button>
          <Checkbox checked={captureOnPick} onChange={setCaptureOnPick} label="Capture screenshot on pick" />
          {selection && <div className="space-y-2" data-testid="comment-selection">
            <p className="font-medium">{selection.label}</p><p className="break-all text-xs">{selection.element.componentName} · {selection.element.source}</p>
            <details><summary>Element context</summary><pre className="overflow-auto whitespace-pre-wrap text-xs">{selection.element.html}</pre></details>
            <Button size="sm" variant="outline" disabled={capturing} onClick={() => { void capture(selection).catch(fail); }}>{capturing ? "Capturing…" : "Capture selection"}</Button>
            {screenshot && <img src={screenshot} alt="Selection screenshot" />}
            {loaded && <CommentComposer config={config} anchor={selection.anchor} collapsible={false} placeholder="Comment on selection" onCreate={create} onCancel={() => setSelection(null)} />}
          </div>}
          <CommentThreadList comments={comments} config={config} defaultExpanded
            getThreadProps={(comment) => ({ onMouseEnter: () => bridge?.send({ type: "highlight", anchor: comment.anchor ?? null }), onMouseLeave: () => bridge?.send({ type: "highlight", anchor: null }), "aria-current": comment.anchor === focus ? "true" : undefined })}
            renderRootMeta={(comment) => {
              if (comment.anchor === "__document__") return <Button size="sm" variant="ghost" onClick={() => navigate("__document__")}>Whole page</Button>;
              const state = anchors.find((item) => item.anchor === comment.anchor);
              return <Button size="sm" variant="ghost" onClick={() => { if (comment.anchor) navigate(comment.anchor); }}><span data-testid="comment-anchor-state">{state?.state ?? "Locating"}</span> · {comments.find((item) => item.id === comment.id)?.selection?.label}</Button>;
            }}
            renderRootDetails={(comment) => { const image = comments.find((item) => item.id === comment.id)?.screenshot; return image ? <img src={image} alt="Comment screenshot" /> : null; }}
            onReply={async (parent, body) => save((previous) => [...previous, { id: crypto.randomUUID(), body, parentId: parent.id, anchor: parent.anchor ?? null, author: identity, createdAt: new Date().toISOString() }])}
            onUpdateStatus={(id, status) => save((previous) => previous.map((comment) => comment.id === id ? { ...comment, status } : comment))}
            onAssign={(id, assignee) => save((previous) => previous.map((comment) => { if (comment.id !== id) return comment; const { assignee: _, ...rest } = comment; return assignee ? { ...rest, assignee } : rest; }))}
            onDelete={(id) => { void save((previous) => previous.filter((comment) => comment.id !== id && comment.parentId !== id)).catch(fail); }}
            threadToMarkdown={(thread) => thread.map((comment) => `${comment.author?.name ?? "Anonymous"}: ${comment.body}\n${comments.find((item) => item.id === comment.id)?.selection?.element.source ?? ""}`).join("\n\n")} />
        </section>
      </CommentRail>}
    </div>
  </CommentProvider>;
}
