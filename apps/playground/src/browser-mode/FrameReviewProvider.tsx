import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode, type RefObject } from "react";
import { ActionError, Button, DropdownMenu, InputField, Modal, useCommentContext, type DropdownMenuItem } from "@flanksource/clicky-ui";
import { UiCheck, UiClose, UiDownload, UiEdit, UiTrash } from "@flanksource/clicky-ui/icons";
import { createRemoteReview, type ReviewActionRequest, type ReviewElement, type ReviewState } from "@flanksource/page-runtime/host";
import { request } from "../comments/useComments";
import { writeClipboard } from "../comments/clipboard";
import type { ExportFormat } from "../review/export";
import type { BrowserSession } from "./session";
import { FrameReviewControls } from "./FrameReviewControls";
import { publishReviewBlob, reviewBlob } from "./review-export";
import { reviewSourcePosition } from "./review-source";

type Pending = { element: ReviewElement } & ({ action: "rejected" | "revision_requested" } | { action: "delete"; containedAnchors: string[] });
type Props = { session: BrowserSession; page: string; active: boolean; sourceDirty: boolean; contentRef: RefObject<HTMLElement | null>; scrollRef: RefObject<HTMLElement | null>; children: ReactNode };

export function FrameReviewProvider({ session, page, active, sourceDirty, contentRef, scrollRef, children }: Props) {
  const context = useCommentContext();
  const snapshot = useSyncExternalStore(session.subscribe, session.getSnapshot);
  const [state, setState] = useState<ReviewState | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const adapter = useRef<ReturnType<typeof createRemoteReview> | null>(null);
  const handle = useRef<(action: ReviewActionRequest) => Promise<void>>(async () => {});
  const assertWritable = () => { if (sourceDirty) throw new Error("Save or revert the source before reviewing an element"); if (!context.callbacks.onCreate) throw new Error("Comment creation is not configured"); };
  const createDecision = async (element: ReviewElement, decision: "approved" | "rejected" | "revision_requested", body: string) => {
    assertWritable(); session.accept(element.selection);
    await context.callbacks.onCreate!({ anchor: element.selection.anchor, body, reviewDecision: decision });
  };
  const mutate = async (method: "POST" | "DELETE", body: Record<string, unknown>) => {
    assertWritable();
    const source = await request<{ source: string }>(`/__playground/sources?slug=${encodeURIComponent(page)}`);
    if (typeof source.source !== "string") throw new Error("Could not read page source");
    await request("/__playground/sources/reviewables", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug: page, expectedSource: source.source, ...body }) });
    await session.reload({ reason: "review", page });
  };
  handle.current = async action => {
    if (action.action === "export") return;
    if (action.action === "approved") { await createDecision(action.element, "approved", ""); return; }
    if (action.action === "mark") {
      const marker = reviewSourcePosition(action.element.selection.element.source);
      await mutate("POST", { ...(action.element.domId ? { domId: action.element.domId } : {}), sourcePath: marker.file, line: marker.line, column: marker.column });
      return;
    }
    setPending(action.action === "delete" ? { element: action.element, action: "delete", containedAnchors: action.containedAnchors } : { element: action.element, action: action.action }); setDraft("");
  };
  useEffect(() => {
    if (!snapshot.bridge) return;
    const remote = createRemoteReview({ send: message => snapshot.bridge!.send(message), onState: setState, onAction: action => { void handle.current(action).catch(setError); } });
    adapter.current = remote;
    const receive = session.onMessage(message => {
      if (message.type.startsWith("review-")) remote.receive(message);
    });
    return () => { receive(); remote.dispose(); adapter.current = null; setState(null); };
  }, [snapshot.bridge, session, page]);
  useEffect(() => {
    const sync = () => { if (session.getSnapshot().ready) void adapter.current?.setVisibility({ visible: active, showRejected: contentRef.current?.dataset.showRejected === "true" }).catch(setError); };
    sync();
    const node = contentRef.current;
    if (!node) return;
    const observer = new MutationObserver(sync); observer.observe(node, { attributes: true, attributeFilter: ["data-show-rejected"] });
    return () => observer.disconnect();
  }, [active, contentRef, snapshot.ready]);
  const submit = async () => {
    if (!pending) throw new Error("No review decision is pending");
    setBusy(true); setError(null);
    try {
      if (pending.action === "delete") {
        const anchors = new Set(pending.containedAnchors);
        await mutate("DELETE", { reviewId: pending.element.id, associatedCommentIds: context.comments.filter(comment => !comment.parentId && comment.anchor && anchors.has(comment.anchor)).map(comment => comment.id) });
      }
      else await createDecision(pending.element, pending.action, draft.trim());
      setPending(null); setDraft("");
    } catch (cause) { setError(cause); } finally { setBusy(false); }
  };
  const exportsFor = (id: string): DropdownMenuItem[] => (["Copy", "Copy link", "Download"] as const).flatMap(action => (["svg", "png", "html"] as ExportFormat[]).map(format => ({ group: action, label: format.toUpperCase(), onSelect: () => {
    const title = `${page}-${id}`.replace(/[^A-Za-z0-9_-]/g, "-");
    const blob = (async () => {
      if (!adapter.current || !snapshot.bridge) throw new Error("Review frame is unavailable");
      const response = await adapter.current.action({ id, action: "export" });
      if (response.type !== "review-action-request") throw new Error("Frame did not return review content");
      return reviewBlob({ bridge: snapshot.bridge, request: response, format, title });
    })();
    const run = async () => {
      if (action === "Copy link") return writeClipboard(blob.then(value => publishReviewBlob({ blob: value, format, title })));
      if (action === "Copy") {
        const text = blob.then(async value => new Blob([await value.text()], { type: "text/plain" }));
        return navigator.clipboard.write([new ClipboardItem(format === "png" ? { "image/png": blob } : format === "html" ? { "text/html": blob, "text/plain": text } : { "text/plain": text })]);
      }
      const url = URL.createObjectURL(await blob); const link = document.createElement("a"); link.href = url; link.download = `${title}.${format}`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
    void run().catch(setError);
  } })));
  return <>{children}{active && state && snapshot.frame && <div aria-label="Review controls" className="pointer-events-none absolute inset-0 z-20">{state.elements.map(element => {
    const decision = context.comments.filter(comment => !comment.parentId && comment.anchor === element.selection.anchor && comment.reviewDecision).at(-1)?.reviewDecision;
    return <FrameReviewControls key={element.id} element={element} frame={snapshot.frame!} scrollRef={scrollRef} decision={decision}>
      <span>{decision === "approved" ? "Approved" : decision === "rejected" ? "Rejected" : decision === "revision_requested" ? "Revision requested" : "Review"}</span>
      <Button size="xs" variant="ghost" className="size-6 p-0" aria-label={`Approve ${element.id}`} disabled={sourceDirty || busy} onClick={() => { void adapter.current!.action({ id: element.id, action: "approved" }).catch(setError); }}><UiCheck /></Button>
      <Button size="xs" variant="ghost" className="size-6 p-0" aria-label={`Reject ${element.id}`} disabled={sourceDirty || busy} onClick={() => setPending({ element, action: "rejected" })}><UiClose /></Button>
      <Button size="xs" variant="ghost" className="size-6 p-0" aria-label={`Request revision ${element.id}`} disabled={sourceDirty || busy} onClick={() => setPending({ element, action: "revision_requested" })}><UiEdit /></Button>
      <DropdownMenu menuLabel={`Export ${element.id}`} items={exportsFor(element.id)} trigger={<Button size="xs" variant="ghost" className="size-6 p-0" aria-label={`Export ${element.id}`}><UiDownload /></Button>} />
      <Button size="xs" variant="ghost" className="size-6 p-0" aria-label={`Delete ${element.id}`} disabled={sourceDirty || busy} onClick={() => { void adapter.current!.action({ id: element.id, action: "delete" }).catch(setError); }}><UiTrash /></Button>
    </FrameReviewControls>;
  })}</div>}{error !== null && <ActionError error={error} context={[["Artifact", page]]} className="absolute bottom-2 left-2 max-w-lg bg-background" />}
    <Modal open={pending !== null} onClose={() => { if (!busy) setPending(null); }} title={pending?.action === "delete" ? "Delete reviewable element" : pending?.action === "rejected" ? "Reject with comment" : "Request revision"} size="sm" expandable={false} footer={<div className="flex justify-end gap-2"><Button variant="ghost" disabled={busy} onClick={() => setPending(null)}>Cancel</Button><Button loading={busy} disabled={pending?.action !== "delete" && !draft.trim()} onClick={() => { void submit(); }}>{pending?.action === "delete" ? "Delete source and feedback" : "Save decision"}</Button></div>}>
      {pending?.action === "delete" ? <p>Remove {pending.element.id} from {page} source and delete its associated feedback?</p> : <label className="block text-sm">Comment<InputField as="textarea" rows={4} value={draft} onChange={setDraft} /></label>}
    </Modal>
  </>;
}
