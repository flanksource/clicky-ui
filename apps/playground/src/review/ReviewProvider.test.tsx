import { useRef } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CommentProvider, DEFAULT_COMMENT_STATUSES } from "@flanksource/clicky-ui";
import { ReviewProvider } from "./ReviewProvider";
import { PageReloadProvider } from "../page-reload";

const REVIEW_ID = "facet-reference-security-layers";
const failure = new Error(`review id "${REVIEW_ID}" was not found uniquely`);

function ReviewHarness() {
  const ref = useRef<HTMLDivElement>(null);
  return <CommentProvider comments={[]} config={{ statuses: DEFAULT_COMMENT_STATUSES }} onCreate={async () => { throw failure; }}>
    <div ref={ref}>
      <ReviewProvider page="flanksource/facet-diagrams" active sourceDirty={false} contentRef={ref} scrollRef={ref}>
        <article data-review-id={REVIEW_ID}>Diagram</article>
      </ReviewProvider>
    </div>
  </CommentProvider>;
}

describe("review submission failures", () => {
  afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
  it("reloads the frame after deleting reviewable source", async () => {
    vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
    vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue(Object.assign([new DOMRect(0, 0, 100, 100)], { item: () => null }));
    const fetcher = vi.fn(async () => Response.json({ source: "export default () => null;" }));
    vi.stubGlobal("fetch", fetcher);
    const reload = vi.fn();
    render(<PageReloadProvider value={reload}><ReviewHarness /></PageReloadProvider>);
    fireEvent.click(await screen.findByRole("button", { name: `Delete ${REVIEW_ID}` }));
    const dialog = within(screen.getByRole("dialog"));
    fireEvent.click(dialog.getByRole("button", { name: "Delete source and feedback" }));
    await vi.waitFor(() => expect(reload).toHaveBeenCalledExactlyOnceWith({ reason: "review", page: "flanksource/facet-diagrams" }));
    expect(fetcher).toHaveBeenCalledWith("/__playground/sources/reviewables", expect.objectContaining({ method: "DELETE" }));
  });
  it("keeps copyable failure details and the draft inside the review dialog", async () => {
    vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
    vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue(Object.assign([new DOMRect(0, 0, 100, 100)], { item: () => null }));
    render(<ReviewHarness />);
    fireEvent.click(await screen.findByRole("button", { name: `Reject ${REVIEW_ID}` }));
    const dialog = within(screen.getByRole("dialog"));
    fireEvent.change(dialog.getByRole("textbox", { name: "Comment" }), { target: { value: "Please revise this diagram" } });
    fireEvent.click(dialog.getByRole("button", { name: "Save decision" }));
    expect((await dialog.findByRole("alert")).textContent).toContain(failure.message);
    expect(dialog.getByRole("button", { name: "Copy error details" })).toBeTruthy();
    expect((dialog.getByRole("textbox") as HTMLTextAreaElement).value).toBe("Please revise this diagram");
  });
});
