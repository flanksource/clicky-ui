import { describe, expect, it } from "vitest";
import { GavelError, createGavelCommentsClient, parseSse, projectScope, type GavelCommentsClient } from "./client";
import type { NativeComment } from "./gavel-projection";

const baseUrl = "http://localhost:9092";
const scope = projectScope("my site");
const targetUri = `${scope}/files/${encodeURIComponent("docs/README.md")}`;
const target = { uri: targetUri, scopeUri: scope, kind: "document" };

type Call = { url: URL; method: string; headers: Record<string, string>; body: unknown };

/** A fake gavel: answers each request with the next queued response and records what was asked. */
function fakeGavel(...responses: (Response | ((call: Call) => Response))[]) {
  const calls: Call[] = [];
  const fetcher: typeof fetch = async (input, init) => {
    const headers = Object.fromEntries(new Headers(init?.headers).entries());
    const body = init?.body instanceof Uint8Array || init?.body instanceof Blob ? init.body : typeof init?.body === "string" ? JSON.parse(init.body) : undefined;
    const call = { url: new URL(String(input), baseUrl), method: init?.method ?? "GET", headers, body };
    calls.push(call);
    const next = responses.shift();
    if (!next) throw new Error(`Unexpected request ${call.method} ${call.url.href}`);
    return typeof next === "function" ? next(call) : next;
  };
  const client: GavelCommentsClient = createGavelCommentsClient({ baseUrl, scope, fetch: fetcher });
  return { calls, client };
}
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json" } });

const native = (overrides: Partial<NativeComment> = {}): NativeComment => ({
  id: "c-1",
  bodyMarkdown: "Too small",
  author: { kind: "user", id: "u-1", label: "Ada" },
  target,
  status: "open",
  version: 1,
  createdAt: "2026-11-01T10:00:00Z",
  updatedAt: "2026-11-01T10:00:00Z",
  phase: "active",
  content: { playground: { page: "docs/README.md" } },
  ...overrides,
});
const row = (id: string) => ({ ...native({ id }), readVersion: 0, unread: true });

describe("projectScope", () => {
  it("names the project scope the way gavel's path escaping does", () => {
    expect(projectScope("my site")).toBe("gavel://project/my%20site");
    expect(projectScope("a/b;c,d?e")).toBe("gavel://project/a%2Fb%3Bc%2Cd%3Fe");
    expect(projectScope("it's (x)*!")).toBe("gavel://project/it%27s%20%28x%29%2A%21");
    expect(projectScope("a+b=c:d@e&f$g")).toBe("gavel://project/a+b=c:d@e&f$g");
    expect(projectScope("héllo")).toBe("gavel://project/h%C3%A9llo");
  });
});

describe("list and get", () => {
  it("lists every page of a target's comments under the client's scope, with unread flags", async () => {
    const first = Array.from({ length: 200 }, (_, index) => row(`c-${index}`));
    const { calls, client } = fakeGavel(json({ data: first, page: { total: 201, limit: 200, offset: 0 } }), json({ data: [row("c-200")], page: { total: 201, limit: 200, offset: 200 } }));
    const comments = await client.list({ target: targetUri });
    expect(comments).toHaveLength(201);
    expect(comments[0]).toMatchObject({ id: "c-0", unread: true, readVersion: 0 });
    expect(calls.map((call) => Object.fromEntries(call.url.searchParams))).toEqual([
      { scope, target: targetUri, limit: "200", offset: "0" },
      { scope, target: targetUri, limit: "200", offset: "200" },
    ]);
    expect(calls[0]?.url.pathname).toBe("/api/v1/comments");
    expect(calls[0]?.method).toBe("GET");
  });

  it.each([
    { name: "the whole scope", filter: {}, query: { scope, limit: "200", offset: "0" } },
    { name: "a phase", filter: { phase: "active" }, query: { scope, phase: "active", limit: "200", offset: "0" } },
    { name: "unread threads", filter: { unread: true }, query: { scope, unread: "true", limit: "200", offset: "0" } },
    { name: "a file or directory path", filter: { path: "docs" }, query: { scope, path: "docs", limit: "200", offset: "0" } },
  ])("narrows a listing to $name", async ({ filter, query }) => {
    const { calls, client } = fakeGavel(json({ data: [], page: { total: 0, limit: 200, offset: 0 } }));
    expect(await client.list(filter)).toEqual([]);
    expect(Object.fromEntries(calls[0]?.url.searchParams ?? [])).toEqual(query);
  });

  it("carries the anchor the server resolved for a patch-anchored thread, and none for a thread without one", async () => {
    const anchored = { ...row("c-1"), anchor: { state: "matched", startLine: 12, endLine: 13 } };
    const { client } = fakeGavel(json({ data: [anchored, row("c-2")], page: { total: 2, limit: 200, offset: 0 } }));
    const [first, second] = await client.list({});
    expect([first?.anchor, second?.anchor]).toEqual([{ state: "matched", startLine: 12, endLine: 13 }, undefined]);
  });

  it("refuses a listing whose anchor is not a resolution state instead of passing it on", async () => {
    const { client } = fakeGavel(json({ data: [{ ...row("c-1"), anchor: { state: "moved" } }], page: { total: 1, limit: 200, offset: 0 } }));
    await expect(client.list({})).rejects.toThrow(/c-1.*anchor.*moved/);
  });

  it("refuses a listing that is not a paged response instead of showing no comments", async () => {
    const { client } = fakeGavel(json({ comments: [] }));
    await expect(client.list({})).rejects.toThrow(/invalid paged comments response/);
  });

  it("gets one thread by id", async () => {
    const { calls, client } = fakeGavel(json(native({ id: "c 1" })));
    expect((await client.get("c 1")).id).toBe("c 1");
    expect(calls[0]?.url.pathname).toBe("/api/v1/comments/c%201");
  });

  it("serves a relative base URL and a base URL with a path prefix", async () => {
    const seen: string[] = [];
    const fetcher: typeof fetch = async (input) => {
      seen.push(String(input));
      return json(native());
    };
    await createGavelCommentsClient({ baseUrl: "", scope, fetch: fetcher }).get("c-1");
    await createGavelCommentsClient({ baseUrl: "https://host.example/gavel/", scope, fetch: fetcher }).get("c-1");
    expect(seen).toEqual(["/api/v1/comments/c-1", "https://host.example/gavel/api/v1/comments/c-1"]);
  });
});

describe("create", () => {
  const request = { target, bodyMarkdown: "Too small", requestId: "req-1", content: { playground: { page: "docs/README.md" } } };

  it("creates a human-review thread with gavel's own create body, handing it to a delivery target when given", async () => {
    const { calls, client } = fakeGavel(json(native()), json(native()));
    await client.create({ request });
    await client.create({ request: { ...request, deliver: { kind: "run", prompt: "editor-comments", edits: "propose" } } });
    expect(calls[0]).toMatchObject({ method: "POST", body: { target, bodyMarkdown: "Too small", workflowId: "human-review", requestId: "req-1", content: request.content } });
    expect(calls[0]?.url.pathname).toBe("/api/v1/comments");
    expect(calls[0]?.body).not.toHaveProperty("deliver");
    expect(calls[1]?.body).toMatchObject({ deliver: { kind: "run", prompt: "editor-comments", edits: "propose" } });
  });

  it("sends a screenshot with the create request as a base64 attachment, in one request, so it reaches the agent with the thread", async () => {
    const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47]);
    const { calls, client } = fakeGavel(json(native({ attachments: [{ id: "a-9", name: "screenshot.png" }] })));
    const created = await client.create({ request, screenshot: png });
    expect(created.attachments).toEqual([{ id: "a-9", name: "screenshot.png" }]);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.url.pathname).toBe("/api/v1/comments");
    expect(calls[0]?.body).toMatchObject({ attachments: [{ filename: "screenshot.png", contentType: "image/png", data: "iVBORw==" }] });
  });

  it("encodes a screenshot Blob the same way, and a large one without overflowing the call stack", async () => {
    const bytes = new Uint8Array(300_000).fill(65);
    const { calls, client } = fakeGavel(json(native()));
    await client.create({ request, screenshot: new Blob([bytes], { type: "image/png" }) });
    const { attachments } = calls[0]!.body as { attachments: { data: string }[] };
    expect(attachments[0]!.data).toBe(Buffer.from(bytes).toString("base64"));
  });

  it("sends no attachments without a screenshot", async () => {
    const { calls, client } = fakeGavel(json(native()));
    await client.create({ request });
    expect(calls[0]?.body).not.toHaveProperty("attachments");
  });

  it("reports gavel's refusal of the create, attachments included, without a second request", async () => {
    const { calls, client } = fakeGavel(json({ error: "attachment too large" }, 413));
    await expect(client.create({ request, screenshot: Uint8Array.from([1]) })).rejects.toThrow(/attachment too large/);
    expect(calls).toHaveLength(1);
  });
});

describe("thread actions", () => {
  const post = async (run: (client: GavelCommentsClient) => Promise<unknown>) => {
    const { calls, client } = fakeGavel(json(native({ version: 3 })));
    await run(client);
    return { method: calls[0]?.method, path: calls[0]?.url.pathname, body: calls[0]?.body };
  };

  it.each([
    { name: "edits the root body", run: (c: GavelCommentsClient) => c.update({ id: "c-1", version: 2, body: "Bigger" }), path: "edit", body: { expectedVersion: 2, bodyMarkdown: "Bigger" } },
    { name: "replies on the thread", run: (c: GavelCommentsClient) => c.reply({ id: "c-1", version: 2, body: "Fixed", content: { playground: { page: "p" } } }), path: "reply", body: { expectedVersion: 2, bodyMarkdown: "Fixed", content: { playground: { page: "p" } } } },
    { name: "edits a reply", run: (c: GavelCommentsClient) => c.editReply({ id: "c-1", version: 2, messageId: "m-1", body: "Fixed!" }), path: "edit-reply", body: { expectedVersion: 2, messageId: "m-1", bodyMarkdown: "Fixed!" } },
    { name: "deletes a reply", run: (c: GavelCommentsClient) => c.deleteReply({ id: "c-1", version: 2, messageId: "m-1" }), path: "delete-reply", body: { expectedVersion: 2, messageId: "m-1" } },
    { name: "resolves with a summary", run: (c: GavelCommentsClient) => c.status({ id: "c-1", version: 2, action: "resolve", summary: "Done" }), path: "resolve", body: { expectedVersion: 2, summary: "Done" } },
    { name: "reopens", run: (c: GavelCommentsClient) => c.status({ id: "c-1", version: 2, action: "reopen" }), path: "reopen", body: { expectedVersion: 2 } },
    { name: "closes", run: (c: GavelCommentsClient) => c.status({ id: "c-1", version: 2, action: "close" }), path: "close", body: { expectedVersion: 2 } },
    { name: "acknowledges", run: (c: GavelCommentsClient) => c.status({ id: "c-1", version: 2, action: "acknowledge" }), path: "acknowledge", body: { expectedVersion: 2 } },
    { name: "assigns an actor", run: (c: GavelCommentsClient) => c.assign({ id: "c-1", version: 2, assignee: { kind: "agent", id: "claude", label: "Claude" } }), path: "assign", body: { expectedVersion: 2, assignee: { kind: "agent", id: "claude", label: "Claude" } } },
    { name: "clears the assignee with null", run: (c: GavelCommentsClient) => c.assign({ id: "c-1", version: 2, assignee: null }), path: "assign", body: { expectedVersion: 2, assignee: null } },
    { name: "retargets within the scope", run: (c: GavelCommentsClient) => c.retarget({ id: "c-1", version: 2, target }), path: "retarget", body: { expectedVersion: 2, target } },
    { name: "deletes the thread", run: (c: GavelCommentsClient) => c.remove({ id: "c-1", version: 2 }), path: "delete", body: { expectedVersion: 2 } },
    { name: "applies a proposal", run: (c: GavelCommentsClient) => c.applyProposal({ id: "c-1", version: 2, messageId: "m-2", mode: "apply" }), path: "accept-proposal", body: { expectedVersion: 2, messageId: "m-2", mode: "apply" } },
    { name: "stages a proposal", run: (c: GavelCommentsClient) => c.applyProposal({ id: "c-1", version: 2, messageId: "m-2", mode: "stage" }), path: "accept-proposal", body: { expectedVersion: 2, messageId: "m-2", mode: "stage" } },
    { name: "rejects a proposal with a reason", run: (c: GavelCommentsClient) => c.rejectProposal({ id: "c-1", version: 2, messageId: "m-2", reason: "Too broad" }), path: "reject-proposal", body: { expectedVersion: 2, messageId: "m-2", bodyMarkdown: "Too broad" } },
    { name: "rejects a proposal without a reason", run: (c: GavelCommentsClient) => c.rejectProposal({ id: "c-1", version: 2, messageId: "m-2" }), path: "reject-proposal", body: { expectedVersion: 2, messageId: "m-2" } },
    { name: "requests a revision", run: (c: GavelCommentsClient) => c.requestRevision({ id: "c-1", version: 2, messageId: "m-2", feedback: "Keep the API" }), path: "request-revision", body: { expectedVersion: 2, messageId: "m-2", bodyMarkdown: "Keep the API" } },
  ])("$name by posting to /{id}/$path with the version last seen", async ({ run, path, body }) => {
    expect(await post(run)).toEqual({ method: "POST", path: `/api/v1/comments/c-1/${path}`, body });
  });

  it("applies several versioned actions atomically through /batch", async () => {
    const { calls, client } = fakeGavel(json([native(), native({ id: "c-2" })]));
    const actions = [{ id: "c-1", expectedVersion: 1, action: "resolve" }, { id: "c-2", expectedVersion: 4, action: "delete-reply", messageId: "m-1" }];
    expect((await client.batch(actions)).map((comment) => comment.id)).toEqual(["c-1", "c-2"]);
    expect(calls[0]).toMatchObject({ method: "POST", body: actions });
    expect(calls[0]?.url.pathname).toBe("/api/v1/comments/batch");
  });

  it("reports gavel's refusal with its status and the endpoint", async () => {
    const { client } = fakeGavel(json({ error: "comment version or request conflict" }, 409));
    const failure = await client.status({ id: "c-1", version: 2, action: "close" }).catch((cause: unknown) => cause);
    expect(failure).toBeInstanceOf(GavelError);
    expect(failure).toMatchObject({ status: 409, message: expect.stringContaining("version or request conflict") });
    expect((failure as GavelError).message).toContain("/api/v1/comments/c-1/close");
  });

  it("reports an unreachable gavel with the base URL and endpoint", async () => {
    const client = createGavelCommentsClient({ baseUrl, scope, fetch: async () => { throw new TypeError("fetch failed"); } });
    await expect(client.get("c-1")).rejects.toThrow(`Cannot reach gavel at ${baseUrl} (GET /api/v1/comments/c-1): TypeError: fetch failed`);
  });

  it("refuses a non-JSON body from gavel verbatim", async () => {
    const { client } = fakeGavel(new Response("<html>proxy</html>", { status: 200 }));
    await expect(client.get("c-1")).rejects.toThrow(/non-JSON.*<html>proxy<\/html>/);
  });
});

describe("proposals", () => {
  it("fetches a proposal's diff for a reply on a thread and reports gavel's refusal", async () => {
    const diff = { diff: "diff --git a/x b/x\n", commit: "def456" };
    const { calls, client } = fakeGavel(json(diff), json({ error: "proposal not found" }, 404));
    expect(await client.proposalDiff("c-1", "m 2")).toEqual(diff);
    expect(calls[0]?.url.pathname).toBe("/api/v1/comments/c-1/proposals/m%202/diff");
    await expect(client.proposalDiff("c-1", "m-9")).rejects.toMatchObject({ status: 404, message: expect.stringContaining("proposal not found") });
  });

  it("refuses a diff response that carries no diff text", async () => {
    const { client } = fakeGavel(json({ commit: "def456" }));
    await expect(client.proposalDiff("c-1", "m-2")).rejects.toThrow(/invalid proposal diff for reply m-2/);
  });
});

describe("delivery and agents", () => {
  it("delivers a thread to a session or a run, carrying the edits policy", async () => {
    const { calls, client } = fakeGavel(json(native()), json(native()));
    await client.deliver({ id: "c-1", version: 1, requestId: "r-1", target: { kind: "session", sessionId: "s-1", edits: "propose" } });
    await client.deliver({ id: "c-1", version: 1, requestId: "r-2", target: { kind: "run", prompt: "editor-comments", fresh: true, edits: "direct" } });
    expect(calls[0]?.url.pathname).toBe("/api/v1/comments/c-1/deliver");
    expect(calls[0]?.body).toEqual({ expectedVersion: 1, requestId: "r-1", target: { kind: "session", sessionId: "s-1", edits: "propose" } });
    expect(calls[1]?.body).toEqual({ expectedVersion: 1, requestId: "r-2", target: { kind: "run", prompt: "editor-comments", fresh: true, edits: "direct" } });
  });

  it("delivers several threads in one request and refuses a response that is not a list", async () => {
    const threads = [{ id: "c-1", expectedVersion: 1 }, { id: "c-2", expectedVersion: 3 }];
    const { calls, client } = fakeGavel(json([native(), native({ id: "c-2" })]), json({ ok: true }));
    const updated = await client.deliverBatch({ requestId: "r-9", target: { kind: "session", sessionId: "s-1" }, threads });
    expect(updated.map((comment) => comment.id)).toEqual(["c-1", "c-2"]);
    expect(calls[0]?.url.pathname).toBe("/api/v1/comments/deliver");
    expect(calls[0]?.body).toEqual({ requestId: "r-9", target: { kind: "session", sessionId: "s-1" }, threads });
    await expect(client.deliverBatch({ requestId: "r-9", target: { kind: "session", sessionId: "s-1" }, threads })).rejects.toThrow(/invalid batch delivery response/);
  });

  it("previews what a run target would start for a thread", async () => {
    const preview = { model: "claude-example", mode: "agent", resolution: {}, tools: [{ name: "reply_to_thread", description: "Reply", source: "caller" }] };
    const { calls, client } = fakeGavel(json(preview), json({ rendered: "..." }));
    expect(await client.previewDelivery({ id: "c-1", target: { kind: "run", prompt: "editor-comments" } })).toEqual(preview);
    await expect(client.previewDelivery({ id: "c-1", target: { kind: "run", prompt: "editor-comments" } })).rejects.toThrow(/invalid delivery preview/);
    expect(calls[0]).toMatchObject({ method: "POST", body: { target: { kind: "run", prompt: "editor-comments" } } });
    expect(calls[0]?.url.pathname).toBe("/api/v1/comments/c-1/deliver/preview");
  });

  it("lists the scope's agent sessions, and every session when asked", async () => {
    const sessions = [{ id: "s-1", source: "claude", title: "site work", inCmux: true }];
    const { calls, client } = fakeGavel(json(sessions), json(sessions), json({ not: "a list" }));
    expect(await client.agentSessions()).toEqual(sessions);
    await client.agentSessions({ all: true });
    expect(calls[0]?.url.pathname).toBe("/api/v1/comments/agent-sessions");
    expect(Object.fromEntries(calls[0]?.url.searchParams ?? [])).toEqual({ scope });
    expect(Object.fromEntries(calls[1]?.url.searchParams ?? [])).toEqual({ scope, all: "1" });
    await expect(client.agentSessions()).rejects.toThrow(/invalid agent session list/);
  });

  it("reads a target's comment agent and saves it at a layer, never naming a session", async () => {
    const resolved = { settings: { positions: [], layers: [], provenance: {} }, agent: { agent: { enabled: true, prompt: "editor-comments", edits: "propose" }, provenance: {}, found: true } };
    const { calls, client } = fakeGavel(json(resolved), json(resolved), json(resolved), json({ settings: {}, agent: {} }));
    expect(await client.commentAgent(targetUri)).toEqual(resolved);
    const agent = { enabled: false, edits: "propose" as const };
    expect(await client.saveCommentAgent({ uri: targetUri, layer: { kind: "project" }, agent })).toEqual(resolved);
    await client.saveCommentAgent({ uri: targetUri, layer: { kind: "user" }, page: false, agent: null });
    expect(Object.fromEntries(calls[0]?.url.searchParams ?? [])).toEqual({ scope, uri: targetUri });
    expect(calls[0]?.url.pathname).toBe("/api/v1/comments/agent");
    expect(calls[1]).toMatchObject({ method: "PUT", body: { target: { scopeUri: scope, uri: targetUri }, layer: { kind: "project" }, page: true, agent } });
    expect(calls[2]?.body).toEqual({ target: { scopeUri: scope, uri: targetUri }, layer: { kind: "user" }, page: false, agent: null });
    await expect(client.commentAgent(targetUri)).rejects.toThrow(/invalid comment agent response/);
  });

  it("sends the agent as a JSON merge patch: changed fields replace, null removes a field so it inherits, and only those fields travel", async () => {
    const resolved = { settings: { positions: [], layers: [], provenance: {} }, agent: { agent: {}, provenance: {}, found: false } };
    const { calls, client } = fakeGavel(json(resolved));
    await client.saveCommentAgent({ uri: targetUri, layer: { kind: "project", file: ".gavel.yaml" }, agent: { enabled: false, prompt: null } });
    expect(calls[0]?.body).toEqual({ target: { scopeUri: scope, uri: targetUri }, layer: { kind: "project", file: ".gavel.yaml" }, page: true, agent: { enabled: false, prompt: null } });
  });

  it("reads the live session new threads are routed to, which takes precedence over the rule", async () => {
    const resolved = { settings: { positions: [], layers: [], provenance: {} }, agent: { agent: { enabled: true }, provenance: {}, found: true }, session: "claude-site-1" };
    const { client } = fakeGavel(json(resolved));
    expect((await client.commentAgent(targetUri)).session).toBe("claude-site-1");
  });

  it("lists what a comment on a target can be addressed to with @, and refuses a malformed list", async () => {
    const mentionables = [{ id: "agent", name: "agent", kind: "agent" }, { id: "ada", name: "Ada", kind: "user" }];
    const { calls, client } = fakeGavel(json(mentionables), json([{ id: "agent" }]));
    expect(await client.mentionables(targetUri)).toEqual(mentionables);
    expect(calls[0]?.url.pathname).toBe("/api/v1/comments/mentionables");
    expect(Object.fromEntries(calls[0]?.url.searchParams ?? [])).toEqual({ scope, target: targetUri });
    await expect(client.mentionables(targetUri)).rejects.toThrow(/invalid mentionables response/);
  });

  it("refuses a mentionable of a kind gavel does not emit instead of treating it as an agent", async () => {
    const { client } = fakeGavel(json([{ id: "claude", name: "claude", kind: "run" }]));
    await expect(client.mentionables(targetUri)).rejects.toThrow(/mentionable claude.*kind "run"/);
  });

  it("marks every thread on a target read for the caller", async () => {
    const { calls, client } = fakeGavel(json({ marked: 2 }), json({ marked: "2" }));
    expect(await client.markRead(targetUri)).toEqual({ marked: 2 });
    expect(calls[0]).toMatchObject({ method: "POST", body: { target: { scopeUri: scope, uri: targetUri } } });
    expect(calls[0]?.url.pathname).toBe("/api/v1/comments/read");
    await expect(client.markRead(targetUri)).rejects.toThrow(/invalid read response/);
  });
});

describe("events", () => {
  it("parses server-sent events incrementally across chunk boundaries", () => {
    const events: { id: string; event: string; data: string }[] = [];
    const parse = parseSse((event) => events.push(event));
    parse('id: 1\nevent: comment\ndata: {"sequence"');
    expect(events).toEqual([]);
    parse(':1}\n\nid: 2\nevent: comment\r\ndata: a\ndata: b\r\n\r\n: keep-alive\n\n');
    expect(events).toEqual([
      { id: "1", event: "comment", data: '{"sequence":1}' },
      { id: "2", event: "comment", data: "a\nb" },
    ]);
  });

  it("streams the scope's events from a cursor and reports the stream open", async () => {
    const stream = new Response('id: 7\nevent: comment\ndata: {"sequence":7,"commentId":"c-1","kind":"create"}\n\nid: 8\nevent: comment\ndata: {"sequence":8,"commentId":"c-2","kind":"reply"}\n\n');
    const { calls, client } = fakeGavel(stream);
    const seen: number[] = [];
    let opened = 0;
    await client.streamEvents({ after: 6, onOpen: () => opened++, onEvent: (event) => seen.push(event.sequence) });
    expect(seen).toEqual([7, 8]);
    expect(opened).toBe(1);
    expect(Object.fromEntries(calls[0]?.url.searchParams ?? [])).toEqual({ scope, after: "6" });
    expect(calls[0]?.url.pathname).toBe("/api/v1/comments/events");
  });

  it("reads an event split across network chunks", async () => {
    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode('id: 3\nevent: comment\ndata: {"sequence":3,"comm'));
        controller.enqueue(encoder.encode('entId":"c-1","kind":"create"}\n\n'));
        controller.close();
      },
    });
    const { client } = fakeGavel(new Response(body));
    const seen: string[] = [];
    await client.streamEvents({ after: 0, onEvent: (event) => seen.push(event.commentId) });
    expect(seen).toEqual(["c-1"]);
  });

  it("refuses an event that is not a sequenced comment event", async () => {
    const { client } = fakeGavel(new Response('id: 1\nevent: comment\ndata: {"hello":true}\n\n'));
    await expect(client.streamEvents({ after: 0, onEvent: () => undefined })).rejects.toThrow(/invalid event/);
  });

  it("refuses a stream gavel refuses to open, with its status", async () => {
    const { client } = fakeGavel(json({ error: "invalid event cursor" }, 400));
    await expect(client.streamEvents({ after: 0, onEvent: () => undefined })).rejects.toMatchObject({ status: 400 });
  });
});
