import { useRef } from "react";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { CommentProvider, DEFAULT_COMMENT_STATUSES } from "@flanksource/clicky-ui";
import type { PageBridge } from "@flanksource/page-runtime/host";
import type { HostMessage } from "@flanksource/page-runtime/schema";
import { ReviewProvider } from "../review/ReviewProvider";
import { BrowserSessionContext, createBrowserSession } from "./session";

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it("reviews frame elements through the validated adapter and persists decisions with frame source", async () => {
  const session = createBrowserSession();
  const onCreate = vi.fn(async () => {});
  const frame = document.createElement("iframe"); document.body.append(frame);
  const element = { id: "shape", selection: { anchor: '[data-review-id="shape"]', label: "Shape", rect: { left: 10, top: 20, width: 120, height: 80 }, element: { source: "diagram.tsx:1:27#0@012345abcdef", componentName: "rect", html: '<rect data-review-id="shape"/>', locators: [] } } };
  const send = vi.fn((message: HostMessage) => {
    queueMicrotask(() => {
      if (message.type === "review-visibility") session.receive({ type: "review-state", requestId: message.requestId, elements: message.visible ? [element] : [], selected: null, visible: message.visible, showRejected: message.showRejected });
      if (message.type === "review-action") {
        if (message.action === "delete") session.receive({ type: "review-action-request", requestId: message.requestId, action: "delete", element, containedAnchors: [] });
        else session.receive({ type: "review-action-request", requestId: message.requestId, action: message.action, element });
      }
    });
  });
  session.attach({ bridge: { send } as unknown as PageBridge, frame, reload: vi.fn() });
  function Harness() {
    const ref = useRef<HTMLDivElement>(null);
    return <BrowserSessionContext.Provider value={session}><CommentProvider comments={[]} config={{ statuses: DEFAULT_COMMENT_STATUSES }} onCreate={onCreate}><div ref={ref}><ReviewProvider page="diagram" active sourceDirty={false} contentRef={ref} scrollRef={ref}><article data-review-id="shell-only">Shell content</article></ReviewProvider></div></CommentProvider></BrowserSessionContext.Provider>;
  }
  try {
    render(<Harness />);
    act(() => session.receive({ type: "status", state: "ready" }));
    fireEvent.click(await screen.findByRole("button", { name: "Approve shape" }));
    await vi.waitFor(() => expect(onCreate).toHaveBeenCalledWith({ anchor: element.selection.anchor, body: "", reviewDecision: "approved" }));
    expect(screen.queryByRole("button", { name: "Approve shell-only" })).toBeNull();
    expect(await session.capture(element.selection.anchor, "plain")).toEqual(element.selection.element);
    fireEvent.click(screen.getByRole("button", { name: "Reject shape" }));
    const dialog = within(screen.getByRole("dialog"));
    fireEvent.change(dialog.getByRole("textbox", { name: "Comment" }), { target: { value: "Increase contrast" } });
    fireEvent.click(dialog.getByRole("button", { name: "Save decision" }));
    await vi.waitFor(() => expect(onCreate).toHaveBeenLastCalledWith({ anchor: element.selection.anchor, body: "Increase contrast", reviewDecision: "rejected" }));
  } finally { frame.remove(); }
});

it.each(["control", "picker"])("maps the frame's contained anchors to root Gavel comment IDs for %s deletion", async (trigger) => {
  const session = createBrowserSession();
  const frame = document.createElement("iframe"); document.body.append(frame);
  const element = { id: "summary", selection: { anchor: '[data-review-id="summary"]', label: "Summary", rect: { left: 10, top: 20, width: 120, height: 80 }, element: { source: "diagram.tsx:1:1", componentName: "article", html: "<article/>", locators: [] } } };
  const containedAnchors = [element.selection.anchor, "#nested", "#moved"];
  const send = vi.fn((message: HostMessage) => queueMicrotask(() => {
    if (message.type === "review-visibility") session.receive({ type: "review-state", requestId: message.requestId, elements: [element], selected: null, visible: true, showRejected: false });
    if (message.type === "review-action") session.receive({ type: "review-action-request", requestId: message.requestId, action: "delete", element, containedAnchors });
  }));
  const reload = vi.fn();
  session.attach({ bridge: { send } as unknown as PageBridge, frame, reload });
  const fetcher = vi.fn<typeof fetch>(async () => Response.json({ source: "export default () => null;" }));
  vi.stubGlobal("fetch", fetcher);
  const comments = [
    { id: "root-review", anchor: element.selection.anchor },
    { id: "nested-feedback", anchor: "#nested" },
    { id: "nested-second-thread", anchor: "#nested" },
    { id: "recovered-feedback", anchor: "#moved" },
    { id: "reply", anchor: "#nested", parentId: "nested-feedback" },
    { id: "outside", anchor: "#outside" },
    { id: "page-feedback", anchor: "__document__" },
  ].map(comment => ({ ...comment, body: "Feedback", createdAt: "2026-01-01T00:00:00Z", author: null }));
  function Harness() {
    const ref = useRef<HTMLDivElement>(null);
    return <BrowserSessionContext.Provider value={session}><CommentProvider comments={comments} config={{ statuses: DEFAULT_COMMENT_STATUSES }} onCreate={async () => {}}><div ref={ref}><ReviewProvider page="diagram" active sourceDirty={false} contentRef={ref} scrollRef={ref}><article>Shell content</article></ReviewProvider></div></CommentProvider></BrowserSessionContext.Provider>;
  }
  try {
    render(<Harness />);
    act(() => session.receive({ type: "status", state: "ready" }));
    const button = await screen.findByRole("button", { name: "Delete summary" });
    if (trigger === "control") fireEvent.click(button);
    else act(() => session.receive({ type: "review-action-request", requestId: "picker-delete", action: "delete", element, containedAnchors }));
    const dialog = within(await screen.findByRole("dialog"));
    expect(fetcher).not.toHaveBeenCalled();
    fireEvent.click(dialog.getByRole("button", { name: "Delete source and feedback" }));
    await vi.waitFor(() => expect(reload).toHaveBeenCalledWith({ reason: "review", page: "diagram" }));
    const deletion = fetcher.mock.calls.find(call => call[0] === "/__playground/sources/reviewables");
    expect(deletion?.[1]?.method).toBe("DELETE");
    expect(JSON.parse(String(deletion?.[1]?.body))).toEqual({ slug: "diagram", expectedSource: "export default () => null;", reviewId: "summary", associatedCommentIds: ["root-review", "nested-feedback", "nested-second-thread", "recovered-feedback"] });
    if (trigger === "control") expect(send).toHaveBeenCalledWith(expect.objectContaining({ type: "review-action", id: "summary", action: "delete" }));
  } finally { frame.remove(); }
});
