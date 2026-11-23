import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CommentInbox, type CommentInboxProps } from "./CommentInbox";
import * as clipboard from "./clipboard";
import { EMPTY_INBOX_FILTERS, type InboxItem, type InboxListing, type InboxThread } from "./inbox-model";

// jsdom has no layout for selection ranges used by the focused Lexical editor.
Object.defineProperty(Range.prototype, "getBoundingClientRect", { configurable: true, value: () => new DOMRect() });
Object.defineProperty(Range.prototype, "getClientRects", { configurable: true, value: () => [] });

const SCOPE = "gavel://project/demo";
const OTHER_SCOPE = "gavel://project/docs";
const ada = { kind: "user", id: "user:ada", label: "Ada" };
const claude = { kind: "agent", id: "agent:claude", label: "Claude" };

function thread(id: string, overrides: Partial<InboxThread> & { uri: string; selector?: unknown; scopeUri?: string }): InboxThread {
  const { uri, selector, scopeUri = SCOPE, ...rest } = overrides;
  return {
    id,
    bodyMarkdown: `comment ${id}`,
    author: ada,
    status: "open",
    phase: "active",
    version: 2,
    createdAt: "2026-11-01T10:00:00Z",
    updatedAt: "2026-11-01T10:00:00Z",
    readVersion: 2,
    unread: false,
    target: { uri, scopeUri, kind: "file", ...(selector === undefined ? {} : { selector }) },
    ...rest,
  };
}

const listings: InboxListing[] = [
  {
    scope: SCOPE,
    project: "demo",
    threads: [
      thread("file-open", { uri: `${SCOPE}/files/guide/intro.md`, selector: { kind: "code-range", view: "source", patch: { startLine: 7 } }, anchor: { state: "matched", startLine: 12, endLine: 12 }, unread: true, updatedAt: "2026-11-04T10:00:00Z", messages: [{ id: "m1", bodyMarkdown: "on it", author: claude, createdAt: "2026-11-04T10:00:00Z" }] }),
      thread("file-stale", { uri: `${SCOPE}/files/guide/intro.md`, selector: { kind: "code-range", view: "source", patch: { startLine: 30 } }, anchor: { state: "outdated" }, updatedAt: "2026-11-03T10:00:00Z" }),
      thread("page-open", { uri: `${SCOPE}/pages/${encodeURIComponent("https://example.com/pricing")}`, selector: { kind: "dom", anchor: "e:[]" }, updatedAt: "2026-11-02T10:00:00Z" }),
      thread("image-done", { uri: `${SCOPE}/files/assets/logo.png`, selector: { kind: "region", region: { x: 0.1, y: 0.1, w: 0.2, h: 0.2 } }, status: "resolved", phase: "awaiting_outcome", author: claude }),
    ],
  },
  { scope: OTHER_SCOPE, project: "docs", threads: [thread("docs-done", { uri: `${OTHER_SCOPE}/files/README.md`, scopeUri: OTHER_SCOPE, status: "resolved", phase: "awaiting_outcome", author: claude })] },
];

function renderInbox(overrides: Partial<CommentInboxProps> = {}) {
  const props: CommentInboxProps = {
    listings,
    filters: EMPTY_INBOX_FILTERS,
    onFiltersChange: vi.fn(),
    onOpen: vi.fn(),
    baseUrl: "http://127.0.0.1:9092",
    ...overrides,
  };
  return { props, ...render(<CommentInbox {...props} />) };
}

beforeEach(() => vi.restoreAllMocks());

describe("CommentInbox", () => {
  it("renders the selected thread through the host renderer and reports selection changes", () => {
    const changed = vi.fn();
    renderInbox({
      expandedThreadId: "file-open",
      onExpandedThreadChange: changed,
      renderThread: (item) => <div>Details for {item.thread.id}</div>,
      canOpen: (item) => item.kind !== "file",
    });
    expect(screen.getByText("Details for file-open")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Open guide/intro.md:12" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("comment page-open"));
    expect(changed).toHaveBeenCalledWith("page-open");
  });

  it("groups mixed file, page and image targets, newest first, with their kind and project", () => {
    renderInbox();
    const headers = screen.getAllByRole("button", { expanded: true }).map((button) => button.closest("tr")?.textContent);
    expect(headers).toEqual([
      "guide/intro.md2filedemoUnread",
      "https://example.com/pricing1pagedemo",
      "assets/logo.png1imagedemo",
      "README.md1filedocs",
    ]);
  });

  it("keeps every filter control visible when no thread matches, and says so", () => {
    renderInbox({ filters: { ...EMPTY_INBOX_FILTERS, status: "closed" } });
    expect(screen.getByText("No threads match these filters")).toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
    for (const name of ["Status", "Phase", "Author", "Project", "Target", "Unread only"]) expect(screen.getByLabelText(name)).toBeInTheDocument();
  });

  it("keeps the filter controls while loading and when a scope has no threads at all", () => {
    const { rerender, props } = renderInbox({ listings: undefined });
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
    rerender(<CommentInbox {...props} listings={[{ scope: SCOPE, project: "demo", threads: [] }]} />);
    expect(screen.getByText("No comment threads yet")).toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
  });

  it("shows only the threads the controlled filters select", () => {
    renderInbox({ filters: { ...EMPTY_INBOX_FILTERS, status: "resolved", project: "docs" } });
    expect(screen.getByText("comment docs-done")).toBeInTheDocument();
    expect(screen.queryByText("comment image-done")).not.toBeInTheDocument();
    expect(screen.queryByText("comment file-open")).not.toBeInTheDocument();
  });

  it("reports a filter change through the controlled props, merged onto the current filters", () => {
    const { props } = renderInbox({ filters: { ...EMPTY_INBOX_FILTERS, project: "demo" } });
    fireEvent.click(screen.getByLabelText("Unread only"));
    expect(props.onFiltersChange).toHaveBeenCalledWith({ ...EMPTY_INBOX_FILTERS, project: "demo", unread: true });
  });

  it("opens a thread with its resolved anchor, so the host can deep-link to the resolved line", () => {
    const { props } = renderInbox();
    fireEvent.click(screen.getByRole("button", { name: "Open guide/intro.md:12" }));
    const opened = vi.mocked(props.onOpen).mock.calls[0]?.[0] as InboxItem;
    expect({ id: opened.thread.id, scope: opened.scope, kind: opened.kind, view: opened.view, line: opened.line, anchor: opened.anchor }).toEqual({
      id: "file-open",
      scope: SCOPE,
      kind: "file",
      view: "source",
      line: 12,
      anchor: { state: "matched", startLine: 12, endLine: 12 },
    });
  });

  it.each([
    { state: "outdated" as const, badge: "Outdated" },
    { state: "ambiguous" as const, badge: "Ambiguous" },
  ])("flags a thread whose anchor is $state with the shared drift badge", ({ state, badge }) => {
    const drifting = listings.map((listing) => ({ ...listing, threads: listing.threads.map((entry) => (entry.id === "file-stale" ? { ...entry, anchor: { state } } : entry)) }));
    renderInbox({ listings: drifting });
    const row = screen.getByText("comment file-stale").closest("tr") as HTMLElement;
    expect(row.querySelector("[data-drift-badge]")?.getAttribute("data-drift-badge")).toBe(state);
    expect(within(row).getByText(badge)).toBeInTheDocument();
  });

  it("flags a thread whose anchor no longer resolves and opens it without a line", () => {
    const { props } = renderInbox();
    const row = screen.getByText("comment file-stale").closest("tr") as HTMLElement;
    expect(within(row).getByText("Outdated")).toBeInTheDocument();
    fireEvent.click(within(row).getByRole("button", { name: "Open guide/intro.md" }));
    const opened = vi.mocked(props.onOpen).mock.calls[0]?.[0] as InboxItem;
    expect({ id: opened.thread.id, line: opened.line, anchor: opened.anchor }).toEqual({ id: "file-stale", line: undefined, anchor: { state: "outdated" } });
  });

  it("expands a row into its thread with the replies, which a host without actions can only read", () => {
    renderInbox();
    expect(screen.getByText("1 reply")).toBeInTheDocument();
    expect(screen.queryByText("on it")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("comment file-open"));
    expect(screen.getByText("on it")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reply" })).not.toBeInTheDocument();
  });

  it("marks a target read from its group header", () => {
    const onMarkRead = vi.fn();
    renderInbox({ actions: { onMarkRead } });
    fireEvent.click(screen.getByRole("button", { name: "Mark guide/intro.md read" }));
    expect(onMarkRead).toHaveBeenCalledWith({ scope: SCOPE, uri: `${SCOPE}/files/guide/intro.md` });
    expect(screen.queryByRole("button", { name: /^Mark (?!guide).* read$/ })).not.toBeInTheDocument();
  });

  it("copies agent instructions for the filtered selection, for an LLM, Claude or Codex", async () => {
    const writes: string[] = [];
    vi.spyOn(clipboard, "writeClipboard").mockImplementation(async (text) => void writes.push(await text));
    renderInbox({ filters: { ...EMPTY_INBOX_FILTERS, status: "resolved" } });
    fireEvent.click(screen.getByRole("button", { name: "Copy for LLM" }));
    await waitFor(() => expect(writes).toHaveLength(1));
    expect(writes[0]).toContain("# Comment inbox for a coding agent");
    expect(writes[0]).toContain("Matching threads: 2");
    expect(writes[0]).toContain("Filters: status resolved");
    expect(writes[0]).toContain("### assets/logo.png (image, demo, region x 0.1 y 0.1 w 0.2 h 0.2)");
    expect(writes[0]).toContain(`GET http://127.0.0.1:9092/api/v1/comments?scope=${encodeURIComponent(OTHER_SCOPE)}&limit=200`);
  });

  it("surfaces a clipboard failure instead of reporting a copy", async () => {
    vi.spyOn(clipboard, "writeClipboard").mockRejectedValue(new Error("Clipboard API is unavailable"));
    renderInbox();
    fireEvent.click(screen.getByRole("button", { name: "Copy for LLM" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Clipboard API is unavailable");
  });

  it("shows a load failure beside the controls, and a refresh failure beside the last rows", () => {
    const { rerender, props } = renderInbox({ listings: undefined, error: "gavel is down" });
    expect(screen.getByRole("alert")).toHaveTextContent("gavel is down");
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
    rerender(<CommentInbox {...props} listings={listings} error="refresh failed" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Refreshing comments failed: refresh failed");
    expect(screen.getByText("comment file-open")).toBeInTheDocument();
  });

});

describe("CommentInbox needs-review filter", () => {
  const threadTexts = () => screen.queryAllByText(/^comment /).map((cell) => cell.textContent);

  it("is a filter control counting the resolved threads, not a separate review screen", () => {
    renderInbox();
    expect(screen.getByLabelText("Needs review (2)")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Review resolved/ })).not.toBeInTheDocument();
  });

  it("reports turning it on through the controlled filters", () => {
    const { props } = renderInbox();
    fireEvent.click(screen.getByLabelText("Needs review (2)"));
    expect(props.onFiltersChange).toHaveBeenCalledWith({ ...EMPTY_INBOX_FILTERS, review: true });
  });

  it("keeps only the resolved threads the host can review, and counts them", () => {
    renderInbox({ filters: { ...EMPTY_INBOX_FILTERS, review: true }, canReview: (item) => item.project === "docs" });
    expect(threadTexts()).toEqual(["comment docs-done"]);
    expect(screen.getByLabelText("Needs review (1)")).toBeInTheDocument();
  });

  it("counts within the other active filters", () => {
    renderInbox({ filters: { ...EMPTY_INBOX_FILTERS, project: "demo" } });
    expect(screen.getByLabelText("Needs review (1)")).toBeInTheDocument();
  });
});
