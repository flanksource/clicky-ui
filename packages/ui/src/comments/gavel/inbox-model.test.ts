import { describe, expect, it } from "vitest";
import {
  inboxAuthorOptions,
  EMPTY_INBOX_FILTERS,
  filterInbox,
  groupInbox,
  inboxItems,
  inboxProjectOptions,
  type InboxFilters,
  type InboxListing,
  type InboxThread,
} from "./inbox-model";

const SCOPE = "gavel://project/demo";
const OTHER_SCOPE = "gavel://project/docs";
const FILE_URI = `${SCOPE}/files/guide/intro.md`;
const IMAGE_URI = `${SCOPE}/files/assets/logo.png`;
const PAGE_URI = `${SCOPE}/pages/${encodeURIComponent("http://127.0.0.1:4000/pricing")}`;

const ada = { kind: "user", id: "user:ada", label: "Ada" };
const claude = { kind: "agent", id: "agent:claude", label: "Claude" };

function thread(id: string, overrides: Partial<InboxThread> & { uri: string; selector?: unknown; scopeUri?: string }): InboxThread {
  const { uri, selector, scopeUri = SCOPE, ...rest } = overrides;
  return {
    id,
    bodyMarkdown: `body of ${id}`,
    author: ada,
    status: "open",
    phase: "active",
    version: 3,
    createdAt: "2026-11-01T10:00:00Z",
    updatedAt: "2026-11-01T10:00:00Z",
    readVersion: 3,
    unread: false,
    target: { uri, scopeUri, kind: "file", ...(selector === undefined ? {} : { selector }) },
    ...rest,
  };
}

const codeRange = (startLine: number) => ({ kind: "code-range", version: 1, view: "source", patch: { startLine, endLine: startLine + 1 } });

const demo: InboxListing = {
  scope: SCOPE,
  project: "demo",
  threads: [
    thread("file-1", { uri: FILE_URI, selector: codeRange(7), updatedAt: "2026-11-02T10:00:00Z", unread: true, anchor: { state: "matched", startLine: 12, endLine: 13 } }),
    thread("file-2", { uri: FILE_URI, selector: { kind: "document", version: 1, view: "preview" }, author: claude, status: "resolved", phase: "final" }),
    thread("page-1", { uri: PAGE_URI, selector: { kind: "dom", version: 1 }, updatedAt: "2026-11-03T10:00:00Z" }),
    thread("image-1", { uri: IMAGE_URI, selector: { kind: "region", version: 1, region: { x: 0.1, y: 0.2, w: 0.3, h: 0.4 } }, status: "in_progress", phase: "awaiting_outcome" }),
  ],
};

const docs: InboxListing = {
  scope: OTHER_SCOPE,
  project: "docs",
  threads: [thread("docs-1", { uri: `${OTHER_SCOPE}/files/README.md`, scopeUri: OTHER_SCOPE, author: { kind: "user", id: "user:bo" } })],
};

const items = inboxItems([demo, docs]);
const byId = (id: string) => {
  const item = items.find((entry) => entry.thread.id === id);
  if (!item) throw new Error(`no item ${id}`);
  return item;
};

describe("inboxItems", () => {
  it("places mixed file, page and image targets by their kind and readable label", () => {
    expect(
      ["file-1", "file-2", "page-1", "image-1", "docs-1"].map((id) => {
        const { kind, label, project } = byId(id);
        return { id, kind, label, project };
      }),
    ).toEqual([
      { id: "file-1", kind: "file", label: "guide/intro.md", project: "demo" },
      { id: "file-2", kind: "file", label: "guide/intro.md", project: "demo" },
      { id: "page-1", kind: "page", label: "http://127.0.0.1:4000/pricing", project: "demo" },
      { id: "image-1", kind: "image", label: "assets/logo.png", project: "demo" },
      { id: "docs-1", kind: "file", label: "README.md", project: "docs" },
    ]);
  });

  it("deep-links to the line the server resolved for the thread, not the line the selector was stored at", () => {
    const { line, endLine, anchor, view } = byId("file-1");
    expect({ line, endLine, anchor, view }).toEqual({ line: 12, endLine: 13, anchor: { state: "matched", startLine: 12, endLine: 13 }, view: "source" });
  });

  it("gives no line to a thread whose resolved anchor has no location", () => {
    const outdated = inboxItems([{ ...demo, threads: [thread("file-1", { uri: FILE_URI, selector: codeRange(7), anchor: { state: "outdated" } })] }]).find((entry) => entry.thread.id === "file-1");
    expect({ line: outdated?.line, state: outdated?.anchor?.state }).toEqual({ line: undefined, state: "outdated" });
  });

  it("carries no anchor for a thread the server resolved none for", () => {
    expect({ line: byId("file-2").line, anchor: byId("file-2").anchor }).toEqual({ line: undefined, anchor: undefined });
  });

  it("carries an image thread's region", () => {
    expect(byId("image-1").region).toEqual({ x: 0.1, y: 0.2, w: 0.3, h: 0.4 });
  });

  it("dates a thread by its newest reply, update or creation", () => {
    const replied = inboxItems([
      { scope: SCOPE, project: "demo", threads: [thread("t", { uri: FILE_URI, messages: [{ id: "m", bodyMarkdown: "late", author: claude, createdAt: "2026-12-01T00:00:00Z" }] })] },
    ]);
    expect(replied[0]?.activity).toBe("2026-12-01T00:00:00Z");
  });

  it("fails loudly on a selector that is not an object with a kind", () => {
    expect(() => inboxItems([{ scope: SCOPE, project: "demo", threads: [thread("bad", { uri: FILE_URI, selector: "code-range" })] }])).toThrow(/bad.*selector/);
  });
});

const only = (filters: Partial<InboxFilters>) => filterInbox(items, { ...EMPTY_INBOX_FILTERS, ...filters }).map((entry) => entry.thread.id);

describe("filterInbox", () => {
  it.each<[string, Partial<InboxFilters>, string[]]>([
    ["no filters", {}, ["file-1", "file-2", "page-1", "image-1", "docs-1"]],
    ["status", { status: "resolved" }, ["file-2"]],
    ["phase", { phase: "awaiting_outcome" }, ["image-1"]],
    ["author", { author: "agent:claude" }, ["file-2"]],
    ["project", { project: "docs" }, ["docs-1"]],
    ["unread", { unread: true }, ["file-1"]],
    ["needs review", { review: true }, ["file-2"]],
    ["needs review within a project with none", { review: true, project: "docs" }, []],
    ["target kind", { kind: "image" }, ["image-1"]],
    ["search of a thread body", { q: "BODY OF page" }, ["page-1"]],
    ["search of a target label", { q: "pricing" }, ["page-1"]],
    ["search of an author", { q: "ada" }, ["file-1", "page-1", "image-1"]],
    ["status and project together", { status: "open", project: "demo" }, ["file-1", "page-1"]],
    ["a combination that matches nothing", { status: "closed", unread: true }, []],
  ])("filters by %s", (_name, filters, expected) => {
    expect(only(filters)).toEqual(expected);
  });
});

describe("groupInbox", () => {
  it("groups threads by target, each group's threads and the groups newest activity first", () => {
    expect(groupInbox(items).map((group) => ({ label: group.label, kind: group.kind, threads: group.items.map((entry) => entry.thread.id) }))).toEqual([
      { label: "http://127.0.0.1:4000/pricing", kind: "page", threads: ["page-1"] },
      { label: "guide/intro.md", kind: "file", threads: ["file-1", "file-2"] },
      { label: "assets/logo.png", kind: "image", threads: ["image-1"] },
      { label: "README.md", kind: "file", threads: ["docs-1"] },
    ]);
  });

  it("keeps the same path in two projects as two groups", () => {
    const twin = inboxItems([
      { scope: SCOPE, project: "demo", threads: [thread("a", { uri: FILE_URI })] },
      { scope: OTHER_SCOPE, project: "docs", threads: [thread("b", { uri: FILE_URI.replace(SCOPE, OTHER_SCOPE), scopeUri: OTHER_SCOPE })] },
    ]);
    expect(groupInbox(twin).map((group) => group.project)).toEqual(["demo", "docs"]);
  });

  it("flags a group holding an unread thread", () => {
    expect(groupInbox(items).map((group) => group.unread)).toEqual([false, true, false, false]);
  });
});

describe("filter options", () => {
  it("lists the authors present by label", () => {
    expect(inboxAuthorOptions(items)).toEqual([
      { value: "user:ada", label: "Ada" },
      { value: "agent:claude", label: "Claude" },
      { value: "user:bo", label: "user:bo" },
    ]);
  });

  it("lists every project, even one with no threads", () => {
    expect(inboxProjectOptions([demo, docs, { scope: "gavel://project/empty", project: "empty", threads: [] }])).toEqual([
      { value: "demo", label: "demo" },
      { value: "docs", label: "docs" },
      { value: "empty", label: "empty" },
    ]);
  });
});
