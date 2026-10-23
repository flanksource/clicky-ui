// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import {
  createServer as createHttpServer,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from "node:http";
import type { AddressInfo } from "node:net";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createServer, type ViteDevServer } from "vite";

import { createAgentRuns, playgroundAgentRuns } from "./agent-runs-server";
import {
  readAgentSessions,
  type AgentSession,
  type AgentSessionsFile,
} from "./agent-session-store";
import { playgroundComments } from "./comments-server";
import { readAll, writeAll, type StoredComment } from "./comments-store";

const SKILL_PATH = fileURLToPath(
  new URL(
    "../../../.agents/skills/clicky-ui-playground/SKILL.md",
    import.meta.url,
  ),
);
const REPO_ROOT = fileURLToPath(new URL("../../..", import.meta.url));
const MODEL = "test-model-1";
const RUNTIME = { spec: { model: MODEL, mode: "agent" } };
const human = { name: "Reviewer", kind: "user" } as const;

const first: StoredComment = {
  id: "first",
  body: "Make the heading bolder {{not-a-template}}",
  createdAt: "2026-10-18T09:00:00.000Z",
  author: human,
  status: "open",
  anchor: null,
};
const second: StoredComment = {
  ...first,
  id: "second",
  body: "Tighten the footer spacing",
};

type Call = { method: string; url: string; body: unknown };

/** A captain that records every request and answers the run, message and stop endpoints. */
class StubCaptain {
  calls: Call[] = [];
  runs = new Map<string, { done: boolean; sessionId: string }>();
  messageStatus = "started";
  server!: Server;
  private nextRun = 1;
  private streams = new Set<ServerResponse>();

  async listen(): Promise<string> {
    this.server = createHttpServer((req, res) => void this.handle(req, res));
    await new Promise<void>((resolve) =>
      this.server.listen(0, "127.0.0.1", resolve),
    );
    return `http://127.0.0.1:${(this.server.address() as AddressInfo).port}`;
  }

  async close(): Promise<void> {
    for (const stream of this.streams) stream.end();
    this.server.closeAllConnections();
    await new Promise<void>((resolve) => this.server.close(() => resolve()));
  }

  callsTo(method: string, pattern: RegExp): Call[] {
    return this.calls.filter(
      (call) => call.method === method && pattern.test(call.url),
    );
  }

  private async handle(req: IncomingMessage, res: ServerResponse) {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    const raw = Buffer.concat(chunks).toString("utf8");
    const url = req.url ?? "";
    const method = req.method ?? "";
    this.calls.push({ method, url, body: raw ? JSON.parse(raw) : undefined });
    const json = (status: number, body: unknown) => {
      res.writeHead(status, { "Content-Type": "application/json" });
      res.end(JSON.stringify(body));
    };

    if (method === "POST" && url.startsWith("/api/v1/prompt/run")) {
      const runId = `run-${this.nextRun++}`;
      this.runs.set(runId, { done: false, sessionId: `session-of-${runId}` });
      return json(200, { runId, status: "running", chat: true });
    }
    const run = /^\/api\/captain\/prompt\/runs\/([^/]+)(\/.*)?$/.exec(
      url.split("?")[0] ?? "",
    );
    if (run) {
      const state = this.runs.get(run[1] ?? "");
      if (!state) return json(404, { error: "unknown run" });
      if (method === "GET" && run[2] === "/stream") {
        res.writeHead(200, { "Content-Type": "text/event-stream" });
        this.streams.add(res);
        res.write(
          `event: run\ndata: ${JSON.stringify({ runId: run[1], status: "running" })}\n\n`,
        );
        res.write(
          `event: state\ndata: ${JSON.stringify({ runId: run[1], sessionId: state.sessionId })}\n\n`,
        );
        return;
      }
      if (method === "GET" && !run[2]) {
        return json(200, {
          run: { runId: run[1], sessionId: state.sessionId },
          entries: [],
          done: state.done,
        });
      }
      if (method === "POST" && run[2] === "/message") {
        return json(202, { runId: run[1], status: this.messageStatus });
      }
      if (method === "POST" && run[2] === "/stop") {
        state.done = true;
        return json(202, { status: "stopping" });
      }
    }
    if (method === "GET" && url.startsWith("/api/captain/sessions/")) {
      res.writeHead(200, { "Content-Type": "text/event-stream" });
      this.streams.add(res);
      res.write(`event: entry\ndata: {"id":"m1"}\n\n`);
      return;
    }
    json(404, { error: `stub has no ${method} ${url}` });
  }
}

describe("playground shared agent session", () => {
  let dir: string;
  let vite: ViteDevServer;
  let baseUrl: string;
  let captain: StubCaptain;
  let captainURL: string;

  async function startPlayground(url: string) {
    // The agent-run routes must sit ahead of the comments middleware, which
    // answers every other /__playground/comments/* path with 405.
    const runs = createAgentRuns({
      dir,
      captainURL: url,
      cwd: REPO_ROOT,
      skillPath: SKILL_PATH,
      sessionTimeoutMs: 2000,
    });
    vite = await createServer({
      configFile: false,
      plugins: [
        playgroundAgentRuns(runs),
        playgroundComments({ dir, onCreated: runs.autoRunComment }),
      ],
      server: { host: "127.0.0.1", port: 0 },
    });
    await vite.listen();
    const address = vite.httpServer?.address();
    if (!address || typeof address === "string") {
      throw new Error("playground test server has no TCP address");
    }
    baseUrl = `http://127.0.0.1:${address.port}`;
  }

  beforeEach(async () => {
    mkdirSync(join(process.cwd(), ".tmp"), { recursive: true });
    dir = mkdtempSync(join(process.cwd(), ".tmp", "agent-runs-"));
    writeAll(dir, { welcome: [first, second] });
    captain = new StubCaptain();
    captainURL = await captain.listen();
    await startPlayground(captainURL);
  });

  afterEach(async () => {
    await vite?.close();
    await captain.close().catch(() => undefined);
    rmSync(dir, { recursive: true, force: true });
  });

  function run(id: string, body: Record<string, unknown>) {
    return fetch(`${baseUrl}/__playground/comments/${id}/agent-run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author: human, ...body }),
    });
  }

  function stored(id: string): StoredComment {
    const found = Object.values(readAll(dir))
      .flat()
      .find((entry) => entry.id === id);
    if (!found) throw new Error(`comment ${id} missing`);
    return found;
  }

  /** The single stored session; fails when there is not exactly one. */
  function onlySession(): AgentSession {
    const { sessions } = readAgentSessions(dir);
    expect(sessions).toHaveLength(1);
    return sessions[0] as AgentSession;
  }

  function putSettings(body: Record<string, unknown>) {
    return fetch(`${baseUrl}/__playground/agent-sessions/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  async function createRoot(page: string, body: Record<string, unknown>) {
    const response = await fetch(`${baseUrl}/__playground/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page,
        body: "Align the toolbar",
        author: human,
        element: { source: `src/pages/${page}.tsx:1`, html: "<div>toolbar</div>" },
        ...body,
      }),
    });
    expect(response.status).toBe(201);
    return (await response.json()) as StoredComment;
  }

  /** Auto-run happens after the 201, so poll until the comment records its hand-off. */
  async function settledRun(id: string) {
    await vi.waitFor(() => expect(stored(id).agentRun?.state).toMatch(/sent|queued|error/), {
      timeout: 3000,
    });
    return stored(id).agentRun;
  }

  it("starts the shared session on the first run and acknowledges as the agent", async () => {
    const response = await run("first", { runtime: RUNTIME });
    expect(response.status).toBe(202);

    // A self-contained draft: no saved prompt is named.
    const starts = captain.callsTo("POST", /^\/api\/v1\/prompt\/run$/);
    expect(starts).toHaveLength(1);
    const start = starts[0]?.body as {
      content: string;
      variables: { instructions: string; message: string };
      spec: { model: string };
      chat: boolean;
    };
    expect(start).toMatchObject({ chat: true, spec: RUNTIME.spec });
    expect(start.content).toMatch(/^---\nsetup:\n {2}cwd: /);
    expect(start.content).toContain(JSON.stringify(REPO_ROOT));
    // The thread travels as a variable so braces in a comment are not template syntax.
    expect(start.variables.message).toContain(
      "Make the heading bolder {{not-a-template}}",
    );
    expect(start.variables.message).toContain("/__playground/comments/first/replies");
    expect(start.variables.instructions).toContain("clicky-ui-playground");
    expect(start.variables.instructions).toContain(`"name":"${MODEL}"`);

    expect(readAgentSessions(dir)).toMatchObject({
      settings: { autoRun: false, grouping: "shared", runtime: RUNTIME },
      sessions: [
        {
          runId: "run-1",
          sessionId: "session-of-run-1",
          page: null,
          runtime: RUNTIME,
          state: "running",
        },
      ],
    });

    const root = stored("first");
    const agent = {
      name: MODEL,
      kind: "agent",
      via: "playground",
      sessionId: "session-of-run-1",
    };
    expect(root).toMatchObject({
      status: "in_progress",
      assignee: agent,
      acknowledgedBy: agent,
      agentRun: { sessionId: "session-of-run-1", state: "sent" },
    });
    expect(root.agentRun?.requestedAt).toEqual(expect.any(String));
  });

  it("sends a later comment into the same session instead of starting another", async () => {
    await run("first", { runtime: RUNTIME });
    captain.messageStatus = "queued";

    // No runtime is needed while the session is live.
    const response = await run("second", {});
    expect(response.status).toBe(202);

    expect(captain.callsTo("POST", /\/api\/v1\/prompt\/run/)).toHaveLength(1);
    const messages = captain.callsTo("POST", /\/runs\/run-1\/message$/);
    expect(messages).toHaveLength(1);
    expect(JSON.stringify(messages[0]?.body)).toContain(
      "Tighten the footer spacing",
    );
    expect(stored("second")).toMatchObject({
      status: "in_progress",
      assignee: { name: MODEL, kind: "agent", sessionId: "session-of-run-1" },
      agentRun: { sessionId: "session-of-run-1", state: "queued" },
    });
    expect(stored("first").agentRun?.sessionId).toBe(
      stored("second").agentRun?.sessionId,
    );
  });

  it.each([
    [
      "finished",
      (stub: StubCaptain) => {
        (stub.runs.get("run-1") as { done: boolean }).done = true;
      },
    ],
    ["unknown to captain", (stub: StubCaptain) => stub.runs.clear()],
  ])("replaces a session that is %s", async (_label, kill) => {
    await run("first", { runtime: RUNTIME });
    kill(captain);

    // The replacement reuses the runtime of the session it replaces.
    const response = await run("second", {});
    expect(response.status).toBe(202);
    expect(captain.callsTo("POST", /\/api\/v1\/prompt\/run/)).toHaveLength(2);
    expect(onlySession()).toMatchObject({
      runId: "run-2",
      sessionId: "session-of-run-2",
      runtime: RUNTIME,
      state: "running",
    });
    expect(stored("second").agentRun?.sessionId).toBe("session-of-run-2");
  });

  it("asks for a runtime when no session has ever run", async () => {
    const response = await run("first", {});
    expect(response.status).toBe(409);
    expect(((await response.json()) as { error: string }).error).toMatch(
      /runtime/,
    );
    expect(captain.calls).toHaveLength(0);
    expect(stored("first").agentRun).toBeUndefined();
  });

  it("stops and forgets one session on DELETE; the next run starts a fresh one", async () => {
    await run("first", { runtime: RUNTIME });
    const reset = await fetch(
      `${baseUrl}/__playground/agent-sessions/sessions/run-1`,
      { method: "DELETE" },
    );
    expect(reset.status).toBe(200);
    expect(captain.callsTo("POST", /\/runs\/run-1\/stop$/)).toHaveLength(1);
    expect(readAgentSessions(dir).sessions).toEqual([]);

    const next = await run("second", {});
    expect(next.status).toBe(202);
    expect(onlySession()).toMatchObject({ runId: "run-2", runtime: RUNTIME });

    const unknown = await fetch(
      `${baseUrl}/__playground/agent-sessions/sessions/run-1`,
      { method: "DELETE" },
    );
    expect(unknown.status).toBe(404);
  });

  it("returns 502 naming the captain URL when captain is down, leaving the comment untouched", async () => {
    await captain.close();
    const response = await run("first", { runtime: RUNTIME });
    expect(response.status).toBe(502);
    expect(((await response.json()) as { error: string }).error).toContain(
      captainURL,
    );
    expect(stored("first")).toEqual(first);
    expect(readAgentSessions(dir).sessions).toEqual([]);

    const proxied = await fetch(`${baseUrl}/__playground/agent-runs/runs/run-1`);
    expect(proxied.status).toBe(502);
    expect(((await proxied.json()) as { error: string }).error).toContain(
      captainURL,
    );
  });

  it("rejects an agent actor and a resolved thread", async () => {
    const agent = await run("first", {
      author: { name: "Coding agent", kind: "agent" },
      runtime: RUNTIME,
    });
    expect(agent.status).toBe(403);

    writeAll(dir, { welcome: [{ ...first, status: "resolved" }] });
    const resolved = await run("first", { runtime: RUNTIME });
    expect(resolved.status).toBe(409);
    expect(captain.calls).toHaveLength(0);
  });

  it("marks the thread done when the agent resolves it", async () => {
    await run("first", { runtime: RUNTIME });
    const resolve = await fetch(`${baseUrl}/__playground/comments/first/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    expect(resolve.status).toBe(200);
    expect(stored("first")).toMatchObject({
      status: "resolved",
      agentRun: { sessionId: "session-of-run-1", state: "done" },
    });
  });

  it("proxies stop to captain and records the session as stopped", async () => {
    await run("first", { runtime: RUNTIME });
    const stop = await fetch(`${baseUrl}/__playground/agent-runs/runs/run-1/stop`, {
      method: "POST",
    });
    expect(stop.status).toBe(202);
    expect(captain.callsTo("POST", /\/runs\/run-1\/stop$/)).toHaveLength(1);
    expect(onlySession()).toMatchObject({
      state: "stopped",
      endedAt: expect.any(String),
    });
  });

  it("reports the live session and notices when captain has ended it", async () => {
    await run("first", { runtime: RUNTIME });
    const live = await fetch(`${baseUrl}/__playground/agent-sessions`);
    expect(((await live.json()) as AgentSessionsFile).sessions[0]?.state).toBe(
      "running",
    );

    (captain.runs.get("run-1") as { done: boolean }).done = true;
    const ended = await fetch(`${baseUrl}/__playground/agent-sessions`);
    expect(((await ended.json()) as AgentSessionsFile).sessions[0]).toMatchObject({
      state: "ended",
      endedAt: expect.any(String),
    });
  });

  it("streams a captain session through the proxy without buffering it", async () => {
    await run("first", { runtime: RUNTIME });
    const response = await fetch(
      `${baseUrl}/__playground/agent-runs/sessions/session-of-run-1?follow=1&after=m0`,
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/event-stream");
    const reader = (response.body as ReadableStream<Uint8Array>).getReader();
    // The stub keeps the stream open, so a buffering proxy would hang here.
    const { value } = await reader.read();
    expect(new TextDecoder().decode(value)).toContain('event: entry');
    expect(
      captain.callsTo("GET", /^\/api\/captain\/sessions\/session-of-run-1\?follow=1&after=m0$/),
    ).toHaveLength(1);
    await reader.cancel();
  });

  it("refuses proxy paths and methods outside the session and run endpoints", async () => {
    const traversal = await fetch(
      `${baseUrl}/__playground/agent-runs/runs/..%2F..%2Fv1%2Fprompt`,
    );
    expect(traversal.status).toBe(400);
    const message = await fetch(
      `${baseUrl}/__playground/agent-runs/runs/run-1/message`,
      { method: "POST", body: "{}" },
    );
    expect(message.status).toBe(405);
    expect(captain.calls).toHaveLength(0);
  });

  describe("per-page grouping", () => {
    const pricingFirst: StoredComment = { ...first, id: "pricing-first" };
    const pricingSecond: StoredComment = { ...second, id: "pricing-second" };

    beforeEach(() => {
      writeAll(dir, { welcome: [first, second], pricing: [pricingFirst, pricingSecond] });
    });

    it("shares one session across pages in shared grouping", async () => {
      await run("first", { runtime: RUNTIME });
      await run("pricing-first", {});
      expect(captain.callsTo("POST", /\/api\/v1\/prompt\/run/)).toHaveLength(1);
      expect(onlySession().page).toBeNull();
    });

    it("starts one session per page and sends later threads into their page's session", async () => {
      expect((await putSettings({ grouping: "page" })).status).toBe(200);

      await run("first", { runtime: RUNTIME });
      await run("pricing-first", {});
      await run("pricing-second", {});

      const starts = captain.callsTo("POST", /\/api\/v1\/prompt\/run/);
      expect(starts).toHaveLength(2);
      const pricingStart = starts[1]?.body as
        | { variables: { instructions: string } }
        | undefined;
      expect(pricingStart?.variables.instructions).toContain(
        'agent session for playground page "pricing"',
      );
      expect(
        readAgentSessions(dir).sessions.map(({ page, runId }) => ({ page, runId })),
      ).toEqual([
        { page: "welcome", runId: "run-1" },
        { page: "pricing", runId: "run-2" },
      ]);
      expect(captain.callsTo("POST", /\/runs\/run-2\/message$/)).toHaveLength(1);
      expect(captain.callsTo("POST", /\/runs\/run-1\/message$/)).toHaveLength(0);
      expect(stored("pricing-second").agentRun?.sessionId).toBe("session-of-run-2");
    });
  });

  describe("settings", () => {
    it.each([
      ["an unknown field", { model: MODEL }, 400],
      ["a bad grouping", { grouping: "team" }, 400],
      ["a non-boolean autoRun", { autoRun: "yes" }, 400],
      ["autoRun without a runtime", { autoRun: true }, 409],
    ])("rejects %s", async (_label, body, status) => {
      expect((await putSettings(body)).status).toBe(status);
      expect(readAgentSessions(dir).settings).toEqual({
        autoRun: false,
        grouping: "shared",
      });
    });

    it("stores autoRun, grouping and runtime", async () => {
      const response = await putSettings({
        autoRun: true,
        grouping: "page",
        runtime: RUNTIME,
      });
      expect(response.status).toBe(200);
      const expected = { autoRun: true, grouping: "page", runtime: RUNTIME };
      expect(await response.json()).toEqual({ settings: expected });
      expect(readAgentSessions(dir).settings).toEqual(expected);
    });
  });

  describe("auto-run", () => {
    it("sends a new human root to its session when auto-run is on", async () => {
      await putSettings({ autoRun: true, runtime: RUNTIME });
      const created = await createRoot("welcome", {});

      expect(await settledRun(created.id)).toMatchObject({
        sessionId: "session-of-run-1",
        state: "sent",
      });
      expect(stored(created.id)).toMatchObject({
        status: "in_progress",
        assignee: { name: MODEL, kind: "agent" },
      });
      expect(onlySession()).toMatchObject({ runId: "run-1", page: null });
    });

    it.each([
      ["auto-run is off", {}, {}],
      [
        "the author is an agent",
        { autoRun: true, runtime: RUNTIME },
        { author: { name: "Coding agent", kind: "agent" } },
      ],
      [
        "the comment is a review decision",
        { autoRun: true, runtime: RUNTIME },
        { reviewDecision: "approved", anchor: '[data-review-id="toolbar"]' },
      ],
    ])("does nothing when %s", async (_label, settings, body) => {
      await putSettings(settings);
      await createRoot("welcome", body);
      // Give a would-be fire-and-forget hand-off time to reach captain.
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(captain.calls).toHaveLength(0);
    });

    it("records a failed hand-off on the comment when captain is down", async () => {
      await putSettings({ autoRun: true, runtime: RUNTIME });
      await captain.close();
      const created = await createRoot("welcome", {});

      const run = await settledRun(created.id);
      expect(run).toMatchObject({ state: "error" });
      expect(run?.error).toContain(captainURL);
      expect(run).not.toHaveProperty("sessionId");
    });
  });
});
