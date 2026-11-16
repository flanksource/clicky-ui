import { describe, expect, it } from "vitest";
import { capturePatch, patchAnchor } from "../anchoring/patch-anchor";
import { bodyFor, contentFor, project, projectNative, proposalFor, type Content, type NativeComment } from "./gavel-projection";

const attachmentUrl = (commentId: string, attachmentId: string) => `https://gavel.example/api/v1/comments/${commentId}/attachments/${attachmentId}`;
const native: NativeComment & { content: Content } = {
  id: "c-1",
  bodyMarkdown: "Make this bigger",
  author: { kind: "user", id: "u-1", label: "Ada" },
  target: { uri: "gavel://project/site/pages/https%3A%2F%2Fexample.com%2F", scopeUri: "gavel://project/site", kind: "web-page" },
  status: "open",
  phase: "active",
  version: 3,
  createdAt: "2026-11-01T10:00:00Z",
  updatedAt: "2026-11-01T10:05:00Z",
  content: { playground: { page: "https://example.com/", anchor: "#hero", element: { source: "https://example.com/", html: "<h1>Hi</h1>" } } },
  attachments: [{ id: "a-1", name: "screenshot.png" }],
  messages: [{ id: "m-1", bodyMarkdown: "Done", author: { kind: "agent", id: "claude", label: "Claude" }, createdAt: "2026-11-01T10:06:00Z", content: { playground: { page: "https://example.com/" } } }],
};

it("projects a native comment into its root and replies, pointing screenshots at the host's attachment route", () => {
  const [root, reply] = project(native, { attachmentUrl });
  expect(root).toMatchObject({
    id: "c-1",
    version: 3,
    body: "Make this bigger",
    anchor: "#hero",
    status: "open",
    author: { id: "u-1", name: "Ada", kind: "user" },
    createdAt: "2026-11-01T10:00:00.000Z",
    updatedAt: "2026-11-01T10:05:00.000Z",
    element: { html: "<h1>Hi</h1>", screenshot: { status: "captured", filename: "screenshot.png", url: attachmentUrl("c-1", "a-1") } },
  });
  expect(reply).toMatchObject({ id: "m-1", rootId: "c-1", parentId: "c-1", body: "Done", anchor: "#hero", author: { id: "claude", name: "Claude", kind: "agent" } });
});

it("rejects a native comment that carries no page metadata", () => {
  expect(() => project({ ...native, content: {} }, { attachmentUrl })).toThrow(/missing playground metadata/);
});

it("projects the agent hand-off gavel records beside the playground fields", () => {
  const [root] = project({ ...native, content: { ...native.content, agentRun: { sessionId: "s-9", requestedAt: "2026-11-01T11:00:00Z", state: "sent", target: { label: "claude: site", channel: "cmux" } } } }, { attachmentUrl });
  expect(root?.agentRun).toEqual({ sessionId: "s-9", requestedAt: "2026-11-01T11:00:00Z", state: "sent", target: { label: "claude: site", channel: "cmux" } });
  expect(() => project({ ...native, content: { ...native.content, agentRun: { sessionId: "s-9", requestedAt: "2026-11-01T11:00:00Z", state: "bogus", target: { label: "x" } } } }, { attachmentUrl })).toThrow(/agent run state/);
});

it.each(["direct", "propose"] as const)("round-trips a hand-off's %s edits policy onto the projected agent run", (edits) => {
  const [root] = project({ ...native, content: { ...native.content, agentRun: { sessionId: "s-9", requestedAt: "2026-11-01T11:00:00Z", state: "sent", edits } } }, { attachmentUrl });
  expect(root?.agentRun).toEqual({ sessionId: "s-9", requestedAt: "2026-11-01T11:00:00Z", state: "sent", edits });
});

it("projects a hand-off recorded before edits existed without inventing an edits policy", () => {
  const [root] = project({ ...native, content: { ...native.content, agentRun: { sessionId: "s-9", requestedAt: "2026-11-01T11:00:00Z", state: "done" } } }, { attachmentUrl });
  expect(root?.agentRun).not.toHaveProperty("edits");
});

it("turns a proposal's decider into an author and leaves an undecided proposal untouched", () => {
  const open = { ref: "refs/gavel/proposals/c-1/m-2", base: "abc", commit: "def", files: [{ path: "a.ts", additions: 1, deletions: 0 }], state: "proposed" as const };
  expect(proposalFor(open)).toEqual(open);
  expect(proposalFor({ ...open, state: "applied", decidedBy: { kind: "agent", id: "claude" } }).decidedBy).toEqual({ id: "claude", name: "claude", kind: "agent" });
});

it.each([
  { name: "an agent reply after the hand-off", messages: [{ kind: "agent", at: "2026-11-01T11:05:00Z" }], repliedAt: "2026-11-01T11:05:00.000Z" },
  { name: "the first of several agent replies", messages: [{ kind: "user", at: "2026-11-01T11:02:00Z" }, { kind: "agent", at: "2026-11-01T11:03:00Z" }, { kind: "agent", at: "2026-11-01T11:09:00Z" }], repliedAt: "2026-11-01T11:03:00.000Z" },
  { name: "only human replies", messages: [{ kind: "user", at: "2026-11-01T11:05:00Z" }], repliedAt: undefined },
  { name: "an agent reply written before the hand-off", messages: [{ kind: "agent", at: "2026-11-01T10:59:00Z" }], repliedAt: undefined },
])("dates the agent's first reply on the hand-off from $name", ({ messages, repliedAt }) => {
  const [root] = project({
    ...native,
    content: { ...native.content, agentRun: { sessionId: "s-9", requestedAt: "2026-11-01T11:00:00Z", state: "sent" } },
    messages: messages.map(({ kind, at }, index) => ({ id: `m-${index}`, bodyMarkdown: "reply", author: { kind, id: `${kind}:${index}` }, createdAt: at })),
  }, { attachmentUrl });
  expect(root?.agentRun?.repliedAt).toBe(repliedAt);
});

it.each([
  { name: "the agent a delivery assigned", assignee: { kind: "agent", id: "claude:s-1", label: "claude-opus-5-5" }, expected: { id: "claude:s-1", name: "claude-opus-5-5", kind: "agent" } },
  { name: "a person", assignee: { kind: "user", id: "ada" }, expected: { id: "ada", name: "ada", kind: "user" } },
  { name: "nobody, even when the playground copy still names an old assignee", assignee: null, expected: undefined },
])("takes the thread's assignee from gavel: $name", ({ assignee, expected }) => {
  const stale = { id: "codex", name: "Codex", kind: "agent" as const };
  const [root] = project({ ...native, assignee, content: { ...native.content, playground: { ...native.content.playground!, assignee: stale } } }, { attachmentUrl });
  expect(root?.assignee).toEqual(expected);
});

it("carries a reply's proposed patch, converting who decided it into an author", () => {
  const proposal = { ref: "refs/gavel/proposals/c-1/m-2", base: "abc123", commit: "def456", files: [{ path: "src/app.ts", additions: 3, deletions: 1 }], state: "proposed" as const };
  const decided = { ...proposal, state: "rejected" as const, decidedBy: { kind: "user", id: "u-1", label: "Ada" }, decidedAt: "2026-11-01T10:09:00Z", feedback: "Too broad" };
  const [, plain, open, rejected] = project({
    ...native,
    messages: [
      { id: "m-1", bodyMarkdown: "No patch", author: { kind: "agent", id: "claude" }, createdAt: "2026-11-01T10:06:00Z", content: { playground: { page: "https://example.com/" } } },
      { id: "m-2", bodyMarkdown: "Proposed", author: { kind: "agent", id: "claude", label: "Claude" }, createdAt: "2026-11-01T10:07:00Z", content: { proposal } },
      { id: "m-3", bodyMarkdown: "Proposed again", author: { kind: "agent", id: "claude", label: "Claude" }, createdAt: "2026-11-01T10:08:00Z", content: { proposal: decided } },
    ],
  }, { attachmentUrl });
  expect(plain?.proposal).toBeUndefined();
  expect(open).toMatchObject({ id: "m-2", author: { id: "claude", name: "Claude", kind: "agent" }, proposal });
  expect(rejected?.proposal).toEqual({ ...proposal, state: "rejected", decidedBy: { id: "u-1", name: "Ada", kind: "user" }, decidedAt: "2026-11-01T10:09:00Z", feedback: "Too broad" });
});

it("keeps an empty body empty and names rating-only comments", () => {
  expect(bodyFor({ id: "x", body: "", createdAt: "", author: null, rating: "positive" })).toBe("Positive feedback");
  expect(bodyFor({ id: "x", body: "", createdAt: "", author: null })).toBe("Negative feedback");
  expect(bodyFor({ id: "x", body: "", createdAt: "", author: null, reviewDecision: "approved" })).toBe("Approved");
});

it("stores a comment's own fields under playground, leaving lifecycle fields to gavel", () => {
  expect(contentFor("https://example.com/", { id: "c-1", version: 2, body: "Hi", createdAt: "t", status: "open", author: { name: "You", kind: "user" }, anchor: "#a" })).toEqual({
    playground: { body: "Hi", author: { name: "You", kind: "user" }, anchor: "#a", page: "https://example.com/" },
  });
});

describe("projectNative: comments with no playground metadata", () => {
  const SOURCE = ["# Title", "", "Tag the commit with the next version and push the tag.", "", "Done."].join("\n");
  const editor: NativeComment = {
    id: "e-1",
    bodyMarkdown: "Which version?",
    author: { kind: "user", id: "u-1", label: "Ada" },
    target: { uri: "gavel://project/site/files/docs/README.md", scopeUri: "gavel://project/site", kind: "document" },
    status: "open",
    phase: "active",
    version: 2,
    createdAt: "2026-11-01T10:00:00Z",
    updatedAt: "2026-11-01T10:05:00Z",
    messages: [{ id: "m-1", bodyMarkdown: "The next semver.", author: { kind: "agent", id: "claude", label: "Claude" }, createdAt: "2026-11-01T10:06:00Z" }],
  };
  const withSelector = (selector: unknown): NativeComment => ({ ...editor, target: { ...editor.target, selector } });

  it("projects an editor thread with no content into its root and replies", () => {
    expect(projectNative(editor)).toEqual([
      { id: "e-1", version: 2, body: "Which version?", author: { id: "u-1", name: "Ada", kind: "user" }, status: "open", createdAt: "2026-11-01T10:00:00.000Z", updatedAt: "2026-11-01T10:05:00.000Z" },
      { id: "m-1", rootId: "e-1", parentId: "e-1", version: 2, body: "The next semver.", author: { id: "claude", name: "Claude", kind: "agent" }, createdAt: "2026-11-01T10:06:00.000Z", anchor: null },
    ]);
  });

  it("carries the assignee, the outcome, the hand-off and a reply's proposal that gavel records without playground metadata", () => {
    const proposal = { ref: "refs/gavel/proposals/e-1/m-2", base: "abc", commit: "def", files: [{ path: "a.md", additions: 1, deletions: 0 }], state: "proposed" as const };
    const [root, reply] = projectNative({
      ...editor,
      assignee: { kind: "agent", id: "claude", label: "Claude" },
      outcome: { at: "2026-11-02T10:00:00Z", actor: { kind: "user", id: "u-1", label: "Ada" } },
      content: { agentRun: { sessionId: "s-1", requestedAt: "2026-11-01T10:01:00Z", state: "sent" } },
      messages: [{ id: "m-2", bodyMarkdown: "Proposed", author: { kind: "agent", id: "claude" }, createdAt: "2026-11-01T10:07:00Z", content: { proposal } }],
    });
    expect(root).toMatchObject({
      assignee: { id: "claude", name: "Claude", kind: "agent" },
      closedAt: "2026-11-02T10:00:00.000Z",
      closedBy: { id: "u-1", name: "Ada", kind: "user" },
      agentRun: { sessionId: "s-1", requestedAt: "2026-11-01T10:01:00Z", state: "sent", repliedAt: "2026-11-01T10:07:00.000Z" },
    });
    expect(reply?.proposal).toEqual(proposal);
  });

  it("places a code-range thread on its patch, and keeps the selected words beside it as the thread's quote", () => {
    const patch = capturePatch(SOURCE, 3, 3);
    const quote = { prefix: "with the", exact: "next version", suffix: "and push" };
    const [root, reply] = projectNative(withSelector({ kind: "code-range", version: 1, view: "source", patch, quote }));
    expect([root?.anchor, root?.quote, reply?.anchor]).toEqual([patchAnchor(patch), quote, patchAnchor(patch)]);
  });

  it("places an image thread on its region and an element thread on the anchor it was written with", () => {
    const region = { x: 0.1, y: 0.2, w: 0.3, h: 0.4 };
    expect(projectNative(withSelector({ kind: "region", version: 1, view: "preview", region }))[0]?.anchor).toBe(`region:${JSON.stringify(region)}`);
    expect(projectNative(withSelector({ kind: "dom", version: 1, view: "preview", anchor: "e:[]" }))[0]?.anchor).toBe("e:[]");
  });

  it("leaves a document-level thread unanchored", () => {
    expect(projectNative(withSelector({ kind: "document", version: 1, view: "preview" }))[0]).not.toHaveProperty("anchor");
  });

  it.each([
    { name: "an unknown selector kind", selector: { kind: "blob" }, error: /blob/ },
    { name: "a selector that is not an object", selector: "r:1-2", error: /selector/ },
    { name: "a code-range selector with no patch", selector: { kind: "code-range" }, error: /code-range.*patch/ },
    { name: "a dom selector with no anchor", selector: { kind: "dom" }, error: /dom.*anchor/ },
  ])("fails loudly on $name instead of guessing an anchor", ({ selector, error }) => {
    expect(() => projectNative(withSelector(selector))).toThrow(error);
  });

  it("is what a playground comment projects to as well, minus the playground-only fields", () => {
    const [root] = projectNative(native);
    expect(root).toMatchObject({ id: "c-1", body: "Make this bigger", status: "open" });
    expect(root).not.toHaveProperty("element");
  });
});
