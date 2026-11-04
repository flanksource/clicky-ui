// @vitest-environment node
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createServer, type ViteDevServer } from "vite";

import { createAgentRuns, playgroundAgentRuns, SESSION_TOOLS } from "./agent-runs-server";
import {
  readAgentSessions,
  type AgentSession,
  type AgentSessionsFile,
} from "./agent-session-store";
import { playgroundComments } from "./comments-server";
import { readAll, writeAll, type StoredComment } from "./comments-store";
import { createSource } from "./pages-store";
import { StubCaptain } from "./testing/stub-captain";

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
const WELCOME_SOURCE =
  'export default () => <div data-review-id="toolbar">toolbar</div>;';

/**
 * Runs bash without blocking the event loop: the scripts curl the vite server
 * that lives in this same worker, so a spawnSync would deadlock against it.
 */
function runBash(args: string[], input = "") {
  return new Promise<{ status: number | null; stdout: string; stderr: string }>(
    (resolve, reject) => {
      const child = spawn("bash", args);
      let stdout = "";
      let stderr = "";
      child.stdout.on("data", (chunk) => (stdout += chunk));
      child.stderr.on("data", (chunk) => (stderr += chunk));
      child.on("error", reject);
      child.on("close", (status) => resolve({ status, stdout, stderr }));
      child.stdin.end(input);
    },
  );
}

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
        playgroundComments({
          dir,
          pagesDir: join(dir, "pages"),
          onCreated: runs.autoRunComment,
        }),
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
    mkdirSync(join(dir, "pages"));
    createSource(join(dir, "pages"), "welcome", WELCOME_SOURCE, ".tsx");
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

  it("creates explicit targets without replacing automatic sessions and sends follow-up messages to their run", async () => {
    expect((await run(first.id, { runtime: RUNTIME })).ok).toBe(true);
    const automatic = onlySession();
    const created = await fetch(
      `${baseUrl}/__playground/agent-sessions/sessions`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: "welcome",
          project: REPO_ROOT,
          runtime: RUNTIME,
        }),
      },
    );
    expect(created.status).toBe(201);
    const { session } = (await created.json()) as { session: AgentSession };
    expect(readAgentSessions(dir).sessions).toEqual([automatic, session]);
    expect(readAgentSessions(dir).settings.targets?.["welcome"]).toEqual({
      kind: "managed",
      sessionId: session.sessionId,
      label: `welcome · ${MODEL}`,
    });
    expect(stored(second.id).agentRun).toBeUndefined();
    expect((await run(second.id, {})).ok).toBe(true);
    expect(stored(second.id).agentRun?.sessionId).toBe(session.sessionId);
    expect(
      captain.callsTo("POST", new RegExp(`/runs/${session.runId}/message$`)),
    ).toHaveLength(1);
    expect(captain.callsTo("POST", /\/deliver$/)).toHaveLength(0);
    captain.runs.get(session.runId)!.done = true;
    expect((await run(second.id, {})).status).toBe(409);
    expect(captain.callsTo("POST", /\/api\/v1\/prompt\/run$/)).toHaveLength(2);
  });

  it("preserves the selected target and comments when managed startup fails", async () => {
    captain.nextRunFailure = {
      status: 422,
      body: { error: "runtime unavailable" },
    };
    const before = readAll(dir);
    const created = await fetch(
      `${baseUrl}/__playground/agent-sessions/sessions`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: "welcome",
          project: REPO_ROOT,
          runtime: RUNTIME,
        }),
      },
    );
    expect(created.status).toBe(502);
    expect(readAgentSessions(dir).sessions).toEqual([]);
    expect(readAgentSessions(dir).settings.targets).toBeUndefined();
    expect(readAll(dir)).toEqual(before);
  });

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

  describe("session tools", () => {
    /** Runs a tool's script as captain does: variables shell-quoted by shq, input on stdin. */
    function callTool(name: keyof typeof SESSION_TOOLS, input: Record<string, unknown>) {
      const script = SESSION_TOOLS[name].exec
        .replaceAll("{{shq origin}}", `'${baseUrl}'`)
        .replaceAll("{{shq author}}", `'${MODEL}'`);
      return runBash(["-c", script], JSON.stringify(input));
    }

    it("lists one page's unresolved threads", async () => {
      const listed = await callTool("list_feedback", { page: "welcome" });

      expect(listed.status).toBe(0);
      const ids = (JSON.parse(listed.stdout) as { comments: StoredComment[] }).comments.map(
        (comment) => comment.id,
      );
      expect(ids).toEqual(["first", "second"]);
    });

    it("replies and resolves as the session's agent", async () => {
      await fetch(`${baseUrl}/__playground/comments/first/acknowledge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: { name: MODEL, kind: "agent" } }),
      });

      const replied = await callTool("reply_to_thread", { id: "first", body: "Bolded the heading; checked desktop and compact." });
      const resolved = await callTool("resolve_thread", { id: "first" });

      expect([replied.status, resolved.status]).toEqual([0, 0]);
      const reply = Object.values(readAll(dir))
        .flat()
        .find((entry) => entry.parentId === "first");
      expect(reply).toMatchObject({
        body: "Bolded the heading; checked desktop and compact.",
        author: { name: MODEL, kind: "agent" },
      });
      expect(stored("first").status).toBe("resolved");
    });

    it("fails with the API's reason when the thread cannot be resolved", async () => {
      const resolved = await callTool("resolve_thread", { id: "missing" });

      expect(resolved.status).not.toBe(0);
      expect(resolved.stderr).toContain('comment \\"missing\\" not found');
    });
  });

  it("starts the shared session on the first run and acknowledges as the agent", async () => {
    const response = await run("first", { runtime: RUNTIME });
    expect(response.status).toBe(202);

    // A self-contained draft: no saved prompt is named.
    const starts = captain.callsTo("POST", /^\/api\/v1\/prompt\/run$/);
    expect(starts).toHaveLength(1);
    const start = starts[0]?.body as {
      content: string;
      variables: {
        instructions: string;
        message: string;
        origin: string;
        author: string;
      };
      spec: { model: string };
      chat: boolean;
    };
    expect(start).toMatchObject({ chat: true, spec: RUNTIME.spec });
    expect(start.content).toMatch(/^---\nsetup:\n {2}cwd: /);
    expect(start.content).toContain(JSON.stringify(REPO_ROOT));
    // The session handles threads through inline tools that post as its author.
    expect(start.content).toContain(`tools: ${JSON.stringify(SESSION_TOOLS)}`);
    expect(start.variables).toMatchObject({ origin: baseUrl, author: MODEL });
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
    expect(new TextDecoder().decode(value)).toContain("event: entry");
    expect(
      captain.callsTo(
        "GET",
        /^\/api\/captain\/sessions\/session-of-run-1\?follow=1&after=m0$/,
      ),
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
        {
          reviewDecision: "approved",
          anchor: '[data-review-id="toolbar"]',
          expectedSource: WELCOME_SOURCE,
        },
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

  describe("captain session target", () => {
    const LIVE_ID = "captain-live-1";
    const LIVE_MODEL = "claude-opus-5-5";
    const target = { kind: "captain", sessionId: LIVE_ID, label: "Fix toolbar · claude" };
    const liveRow = {
      id: LIVE_ID,
      source: "claude",
      title: "Fix toolbar",
      model: LIVE_MODEL,
      cwd: "/work/acme",
      live: {
        pid: 4242,
        active: true,
        environment: { CLAUDE_CODE_SESSION_ID: "provider-1", CMUX_SURFACE_ID: "surface-1" },
        surface: { surfaceId: "surface-1" },
      },
    };

    /** The text of the one delivery captain received. */
    function deliveredText(): string {
      const delivered = captain.callsTo("POST", /^\/api\/captain\/sessions\/captain-live-1\/deliver$/);
      expect(delivered).toHaveLength(1);
      const body = delivered[0]?.body as { text?: unknown } | undefined;
      if (typeof body?.text !== "string") throw new Error(`delivery without text: ${JSON.stringify(body)}`);
      return body.text;
    }

    function putTarget(page: string, body: unknown) {
      return fetch(`${baseUrl}/__playground/agent-sessions/targets`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page, target: body }),
      });
    }

    beforeEach(() => {
      captain.liveSessions = [liveRow];
    });

    it("lists live captain sessions without their process environment", async () => {
      const response = await fetch(`${baseUrl}/__playground/agent-sessions/captain`);

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        sessions: [
          {
            id: LIVE_ID,
            source: "claude",
            title: "Fix toolbar",
            cwd: "/work/acme",
            model: LIVE_MODEL,
            inCmux: true,
          },
        ],
      });
      expect(captain.callsTo("GET", /^\/api\/captain\/sessions\/live\?all=true/)).toHaveLength(1);
    });

    it("stores a page's captain target and clears it back to the playground session", async () => {
      expect((await putTarget("welcome", target)).status).toBe(200);
      expect(readAgentSessions(dir).settings.targets).toEqual({ welcome: target });

      expect((await putTarget("welcome", { kind: "playground" })).status).toBe(200);
      expect(readAgentSessions(dir).settings.targets).toEqual({});
    });

    it.each([
      ["a captain target without a session", { kind: "captain", label: "x" }],
      ["an unknown kind", { kind: "terminal" }],
      ["extra fields", { ...target, environment: {} }],
    ])("rejects %s", async (_label, body) => {
      const response = await putTarget("welcome", body);
      expect(response.status).toBe(400);
      expect(readAgentSessions(dir).settings.targets).toBeUndefined();
    });

    it("delivers the thread into the page's live captain session as that session's agent", async () => {
      await putTarget("welcome", target);
      captain.deliverResult = { channel: "cmux", status: "sent" };

      const response = await run("first", {});

      expect(response.status).toBe(202);
      expect(captain.callsTo("POST", /\/api\/v1\/prompt\/run/)).toHaveLength(0);
      const text = deliveredText();
      expect(text).toContain("Make the heading bolder {{not-a-template}}");
      expect(text).toContain(`${baseUrl}/__playground/comments/first/replies`);
      expect(text).toContain(`${baseUrl}/__playground/comments/first/resolve`);
      expect(text).toContain(`{"name":"${LIVE_MODEL}","kind":"agent"}`);

      const agent = { name: LIVE_MODEL, kind: "agent", via: "captain", sessionId: LIVE_ID };
      expect(stored("first")).toMatchObject({
        status: "in_progress",
        assignee: agent,
        acknowledgedBy: agent,
        agentRun: {
          sessionId: LIVE_ID,
          state: "sent",
          target: { label: target.label, channel: "cmux" },
        },
      });
    });

    it("lets the delivered agent reply and resolve with the curl commands it was sent", async () => {
      await putTarget("welcome", target);
      await run("first", {});
      const text = deliveredText();
      const commands = /```sh\n([\s\S]*?)\n```/.exec(text)?.[1];
      if (!commands) throw new Error(`no sh block in:\n${text}`);

      const result = await runBash(["-euo", "pipefail", "-c", commands]);

      expect(result.status, result.stderr).toBe(0);
      expect(stored("first").status).toBe("resolved");
      const reply = Object.values(readAll(dir)).flat().find((entry) => entry.parentId === "first");
      expect(reply?.author).toMatchObject({ name: LIVE_MODEL, kind: "agent" });
    });

    it("refuses a target that is no longer live and leaves the thread unclaimed", async () => {
      await putTarget("welcome", target);
      captain.liveSessions = [];

      const response = await run("first", {});

      expect(response.status).toBe(409);
      expect(((await response.json()) as { error: string }).error).toContain("no longer live");
      expect(stored("first")).toMatchObject({ status: "open" });
      expect(stored("first")).not.toHaveProperty("assignee");
      expect(stored("first")).not.toHaveProperty("agentRun");
    });

    it("refuses a runtime for a page that sends to captain", async () => {
      await putTarget("welcome", target);
      const response = await run("first", { runtime: RUNTIME });
      expect(response.status).toBe(409);
      expect(captain.callsTo("POST", /\/deliver$/)).toHaveLength(0);
    });

    it("auto-runs a new comment into the page's captain target", async () => {
      await putTarget("welcome", target);
      await putSettings({ autoRun: true, runtime: RUNTIME });

      const created = await createRoot("welcome", {});

      expect(await settledRun(created.id)).toMatchObject({ sessionId: LIVE_ID, state: "sent" });
      expect(captain.callsTo("POST", /\/api\/v1\/prompt\/run/)).toHaveLength(0);
    });

    it("keeps other pages on the playground session", async () => {
      await putTarget("elsewhere", target);

      const response = await run("first", { runtime: RUNTIME });

      expect(response.status).toBe(202);
      expect(captain.callsTo("POST", /\/deliver$/)).toHaveLength(0);
      expect(stored("first").agentRun).toMatchObject({ sessionId: "session-of-run-1" });
    });
  });
});
