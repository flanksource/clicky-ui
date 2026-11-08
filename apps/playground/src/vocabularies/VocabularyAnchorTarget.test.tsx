import { createRef } from "react";
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { CommentProvider, useCommentContext } from "@flanksource/clicky-ui";
import type { PageBridge } from "@flanksource/page-runtime/host";
import { BrowserSessionContext, createBrowserSession } from "../browser-mode/session";
import { PLAYGROUND_COMMENT_CONFIG } from "../comments/useComments";
import { VocabularyAnchorTarget } from "./VocabularyAnchorTarget";

const page = "vocabularies/shapes";
const anchor = "vocabulary:shape/decision";
afterEach(() => { cleanup(); history.replaceState(null, "", "/"); vi.restoreAllMocks(); });

it("sends the requested vocabulary anchor through the visible frame once ready", () => {
  history.replaceState(null, "", `/?page=${encodeURIComponent(page)}&anchor=${encodeURIComponent(anchor)}`);
  const session = createBrowserSession();
  const send = vi.fn();
  session.attach({ bridge: { send } as unknown as PageBridge, frame: null, reload: null });
  render(<CommentProvider comments={[]} config={PLAYGROUND_COMMENT_CONFIG}><BrowserSessionContext.Provider value={session}><VocabularyAnchorTarget page={page} contentRef={createRef()} /></BrowserSessionContext.Provider></CommentProvider>);
  expect(send).not.toHaveBeenCalled();
  act(() => { session.receive({ type: "status", state: "ready" }); });
  expect(send).toHaveBeenCalledWith({ type: "scroll", anchor, behavior: "smooth", block: "center" });
});

it("registers and scrolls a dev marker using the existing comment scroll mechanism", () => {
  history.replaceState(null, "", `/?page=${encodeURIComponent(page)}&anchor=${encodeURIComponent(anchor)}`);
  const scroll = vi.fn();
  Object.defineProperty(HTMLElement.prototype, "scrollTo", { configurable: true, value: scroll });
  function Content() {
    const context = useCommentContext();
    const contentRef = createRef<HTMLDivElement>();
    return <div ref={context.contentRef as React.RefObject<HTMLDivElement>}><div ref={contentRef}><div data-comment-anchor={anchor}>Decision</div></div><VocabularyAnchorTarget page={page} contentRef={contentRef} /></div>;
  }
  render(<CommentProvider comments={[]} config={PLAYGROUND_COMMENT_CONFIG}><Content /></CommentProvider>);
  expect(scroll).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
});
