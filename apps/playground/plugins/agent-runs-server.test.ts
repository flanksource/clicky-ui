// @vitest-environment node
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createServer, type ViteDevServer } from "vite";

import {
  createAgentRuns,
  playgroundAgentRuns,
  SESSION_TOOLS,
  type CaptainSessionOption,
} from "./agent-runs-server";
import {
  readAgentSessions,
  type AgentSession,
  type AgentSessionsView,
} from "./agent-session-store";
import { CommentsClient, commentsClient } from "./comments-client";
import type { CommentAgent, GavelAgentSession } from "../src/comments/gavel-delivery";
import { LaunchHttpError } from "./launch-client";
import { playgroundComments } from "./comments-server";
import {
  readAll,
  writeAll,
  type StoredComment,
} from "./testing/comments-store";
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
/** Gavel test host sessions are numbered across the whole run, so tests compare them with each other. */
const MANAGED = expect.stringMatching(/^managed-\d+$/);
/** The one session gavel's test host reports live (comments/testhost). */
const LIVE_ID = "fake-session";
const LIVE_TARGET = {
  kind: "captain",
  sessionId: LIVE_ID,
  label: "Fix toolbar · claude",
} as const;

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
  version: 1,
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

describe("playground agent delivery through gavel", () => {
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
        playgroundComments({ dir, pagesDir: join(dir, "pages") }),
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
    await writeAll(dir, { welcome: [first, second] });
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

  async function stored(id: string): Promise<StoredComment> {
    const found = Object.values(await readAll(dir))
      .flat()
      .find((entry) => entry.id === id);
    if (!found) throw new Error(`comment ${id} missing`);
    return found;
  }

  function putSettings(body: Record<string, unknown>) {
    return fetch(`${baseUrl}/__playground/agent-sessions/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  function putAutoRun(body: Record<string, unknown>) {
    return fetch(`${baseUrl}/__playground/agent-sessions/auto-run`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  function createManaged(page = "welcome") {
    return fetch(`${baseUrl}/__playground/agent-sessions/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page, project: REPO_ROOT, runtime: RUNTIME }),
    });
  }

  async function view(page?: string): Promise<AgentSessionsView> {
    return (await (
      await fetch(`${baseUrl}/__playground/agent-sessions${page ? `?page=${encodeURIComponent(page)}` : ""}`)
    ).json()) as AgentSessionsView;
  }

  /** A page's entry key in a settings layer: its comment target below the scope. */
  const entryKey = (page: string) => `page/${encodeURIComponent(page)}`;

  /** The comment-agent page entries of every project layer, by entry key. */
  async function projectPages(): Promise<Record<string, CommentAgent>> {
    const { settings } = await commentsClient(dir).agent("welcome");
    return Object.assign({}, ...settings.layers.filter((layer) => layer.kind === "project").map((layer) => layer.config.comments?.agents?.pages ?? {}));
  }

  /** The comment agent gavel resolves for a page, when it delivers new comments automatically. */
  async function enabledAgent(page: string): Promise<CommentAgent | undefined> {
    const { agent } = (await commentsClient(dir).agent(page)).agent;
    return agent.enabled ? agent : undefined;
  }

  async function createRoot(page: string, body: Record<string, unknown>) {
    const response = await fetch(`${baseUrl}/__playground/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page,
        body: "Align the toolbar",
        author: human,
        element: {
          source: `src/pages/${page}.tsx:1`,
          html: "<div>toolbar</div>",
        },
        ...body,
      }),
    });
    expect(response.status).toBe(201);
    return (await response.json()) as StoredComment;
  }

  /** Gavel delivers after the 201, so poll until the comment records its hand-off. */
  async function settledRun(id: string, expected: "sent" | "error") {
    await vi.waitFor(
      async () => expect((await stored(id)).agentRun?.state).toBe(expected),
      { timeout: 5000 },
    );
    return (await stored(id)).agentRun;
  }

  describe("explicit session targets", () => {
    it("creates a session and records it, leaving the page's delivery settings alone", async () => {
      const created = await createManaged();
      expect(created.status).toBe(201);
      const { session, ...rest } = (await created.json()) as {
        session: AgentSession;
      };

      expect(rest).toEqual({});
      expect(session).toMatchObject({ page: "welcome", purpose: "target", label: `welcome · ${MODEL}`, state: "running" });
      expect(readAgentSessions(dir).sessions).toEqual([session]);
      expect(await enabledAgent("welcome")).toBeFalsy();
      expect((await view("welcome")).pages).toEqual({ welcome: { autoRun: false } });
      expect((await stored(second.id)).agentRun).toBeUndefined();
    });

    it("lets gavel refuse a thread for a session that gavel does not see live, and records it on the thread", async () => {
      const { session } = (await (await createManaged()).json()) as { session: AgentSession };

      const response = await run(second.id, { target: { kind: "managed", sessionId: session.sessionId, label: session.label } });

      expect(response.status).toBe(502);
      expect(((await response.json()) as { error: string }).error).toContain("no longer live");
      expect((await stored(second.id)).agentRun).toMatchObject({
        state: "error",
        error: expect.stringContaining("no longer live"),
      });
    });

    it("keeps comments, sessions and settings as they were when startup fails", async () => {
      captain.nextRunFailure = { status: 422, body: { error: "runtime unavailable" } };
      const before = await readAll(dir);

      const created = await createManaged();

      expect(created.status).toBe(502);
      expect(readAgentSessions(dir).sessions).toEqual([]);
      expect(await enabledAgent("welcome")).toBeFalsy();
      expect(await readAll(dir)).toEqual(before);
    });
  });

  describe("session tools", () => {
    /** Runs a tool's script as captain does: variables shell-quoted by shq, input on stdin. */
    function callTool(
      name: keyof typeof SESSION_TOOLS,
      input: Record<string, unknown>,
    ) {
      const script = SESSION_TOOLS[name].exec
        .replaceAll("{{shq origin}}", `'${baseUrl}'`)
        .replaceAll("{{shq author}}", `'${MODEL}'`);
      return runBash(["-c", script], JSON.stringify(input));
    }

    it("lists one page's unresolved threads", async () => {
      const listed = await callTool("list_feedback", { page: "welcome" });

      expect(listed.status).toBe(0);
      const ids = (
        JSON.parse(listed.stdout) as { comments: StoredComment[] }
      ).comments.map((comment) => comment.id);
      expect(ids).toEqual(["first", "second"]);
    });

    it("replies and resolves as the session's agent", async () => {
      await fetch(`${baseUrl}/__playground/comments/first/acknowledge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: { name: MODEL, kind: "agent" } }),
      });

      const replied = await callTool("reply_to_thread", {
        id: "first",
        body: "Bolded the heading; checked desktop and compact.",
      });
      const resolved = await callTool("resolve_thread", { id: "first" });

      expect([replied.status, resolved.status]).toEqual([0, 0]);
      const reply = Object.values(await readAll(dir))
        .flat()
        .find((entry) => entry.parentId === "first");
      expect(reply).toMatchObject({
        body: "Bolded the heading; checked desktop and compact.",
        author: { name: MODEL, kind: "agent" },
      });
      expect((await stored("first")).status).toBe("resolved");
    });

    it("fails with the API's reason when the thread cannot be resolved", async () => {
      const resolved = await callTool("resolve_thread", { id: "missing" });

      expect(resolved.status).not.toBe(0);
      expect(resolved.stderr).toContain('comment \\"missing\\" not found');
    });
  });

  describe("run agent", () => {
    it("starts a gavel-managed session on the first run, with no call to captain", async () => {
      const response = await run("first", { runtime: RUNTIME });
      expect(response.status).toBe(202);

      expect(captain.calls).toHaveLength(0);
      const root = await stored("first");
      expect(root.agentRun).toMatchObject({
        sessionId: MANAGED,
        state: "sent",
        target: { label: "New editor-comments session" },
      });
      expect(root.agentRun?.requestedAt).toEqual(expect.any(String));
      expect(readAgentSessions(dir)).toEqual({
        settings: { grouping: "shared", runtime: RUNTIME },
        sessions: [],
      });
      expect(await enabledAgent("welcome")).toBeFalsy();
    });

    it("sends a later thread into the shared session instead of starting another", async () => {
      await run("first", { runtime: RUNTIME });

      // No runtime is needed while gavel holds the group's session.
      const response = await run("second", {});

      expect(response.status).toBe(202);
      expect((await stored("second")).agentRun).toMatchObject({
        sessionId: (await stored("first")).agentRun?.sessionId,
        state: "sent",
        target: { channel: "claude-socket" },
      });
    });

    it("asks for a runtime when none was ever saved", async () => {
      const response = await run("first", {});

      expect(response.status).toBe(409);
      expect(((await response.json()) as { error: string }).error).toMatch(
        /no live agent session; supply a runtime/,
      );
      expect((await stored("first")).agentRun).toBeUndefined();
    });

    it("rejects an agent actor and a resolved thread", async () => {
      const agent = await run("first", {
        author: { name: "Coding agent", kind: "agent" },
        runtime: RUNTIME,
      });
      expect(agent.status).toBe(403);

      await writeAll(dir, { welcome: [{ ...first, status: "resolved" }] });
      const resolved = await run("first", { runtime: RUNTIME });
      expect(resolved.status).toBe(409);
      expect((await stored("first")).agentRun).toBeUndefined();
    });

    it("refuses a repository document a managed run, which gavel could only start in its own workspace", async () => {
      await writeAll(dir, { "document:demo/readme.md": [first] });

      const response = await run("first", { runtime: RUNTIME });

      expect(response.status).toBe(409);
      expect(((await response.json()) as { error: string }).error).toContain(
        "gavel runs sessions in its workspace root",
      );
      expect((await stored("first")).agentRun).toBeUndefined();
    });

    describe("a session the browser chose", () => {
      beforeEach(() => {
        captain.liveSessions = [{ id: LIVE_ID, source: "claude", title: "Fix toolbar", model: "m" }];
      });

      it("delivers a thread into it through gavel, as that session's agent", async () => {
        const response = await run("first", { target: LIVE_TARGET });

        expect(response.status).toBe(202);
        expect(captain.calls.filter((call) => call.url.endsWith("/deliver"))).toHaveLength(0);
        expect((await stored("first")).agentRun).toMatchObject({
          sessionId: LIVE_ID,
          state: "sent",
          target: { channel: "claude-socket" },
        });
      });

      it("never stores the choice in gavel's settings or in a server file", async () => {
        await run("first", { target: LIVE_TARGET });

        expect({ agent: await enabledAgent("welcome"), file: readAgentSessions(dir), view: (await view("welcome")).pages }).toEqual({
          agent: undefined,
          file: { settings: { grouping: "shared" }, sessions: [] },
          view: { welcome: { autoRun: false } },
        });
      });

      it("answers gavel's 502 when captain lists the session but gavel does not see it live, and records it on the thread", async () => {
        captain.liveSessions = [{ id: "gone", source: "claude", title: "Gone", model: "m" }];

        const response = await run("first", { target: { kind: "captain", sessionId: "gone", label: "Gone" } });

        expect(response.status).toBe(502);
        expect(((await response.json()) as { error: string }).error).toContain("no longer live");
        expect(await stored("first")).toMatchObject({
          agentRun: { state: "error", error: expect.stringContaining("no longer live") },
        });
      });

      it("refuses a captain session that is no longer live, leaving the thread as it was", async () => {
        const response = await run("first", { target: { ...LIVE_TARGET, sessionId: "gone" } });

        expect(response.status).toBe(409);
        expect(((await response.json()) as { error: string }).error).toContain("no longer live");
        expect((await stored("first")).agentRun).toBeUndefined();
      });

      it("refuses a managed session that is not a running session", async () => {
        const response = await run("first", { target: { kind: "managed", sessionId: "nope", label: "Nope" } });

        expect(response.status).toBe(409);
        expect(((await response.json()) as { error: string }).error).toContain("Managed session is no longer available");
        expect((await stored("first")).agentRun).toBeUndefined();
      });

      it("refuses a runtime, which a session needs none of", async () => {
        const response = await run("first", { target: LIVE_TARGET, runtime: RUNTIME });

        expect(response.status).toBe(409);
        expect((await stored("first")).agentRun).toBeUndefined();
        expect(readAgentSessions(dir).settings).toEqual({ grouping: "shared" });
      });

      it.each([
        ["a captain target without a session", { kind: "captain", label: "x" }],
        ["an unknown kind", { kind: "terminal", sessionId: LIVE_ID, label: "x" }],
        ["the playground agent, which is no target", { kind: "playground" }],
        ["extra fields", { ...LIVE_TARGET, environment: {} }],
      ])("rejects %s", async (_label, target) => {
        const response = await run("first", { target });

        expect(response.status).toBe(400);
        expect((await stored("first")).agentRun).toBeUndefined();
      });
    });

    describe("fresh session", () => {
      // The sibling gavel's testhost may predate run targets' `fresh`, so these assert the request gavel receives, not the session it starts.
      function captureDeliveries() {
        return vi.spyOn(CommentsClient.prototype, "deliver").mockImplementation(async (options) => ({ ...first, id: options.id, version: options.version + 1 }));
      }

      afterEach(() => vi.restoreAllMocks());

      it("marks the run target fresh and keeps the page's group key", async () => {
        const deliveries = captureDeliveries();

        const response = await run("first", { runtime: RUNTIME, fresh: true });

        expect(response.status).toBe(202);
        expect(deliveries.mock.calls.map(([options]) => options.target)).toEqual([
          expect.objectContaining({ kind: "run", groupKey: "playground:shared", fresh: true }),
        ]);
      });

      it("leaves `fresh` off an ordinary run target", async () => {
        const deliveries = captureDeliveries();

        await run("first", { runtime: RUNTIME });
        await run("second", { runtime: RUNTIME, fresh: false });

        const targets = deliveries.mock.calls.map(([options]) => options.target);
        expect(targets).toHaveLength(2);
        for (const target of targets) expect(target).not.toHaveProperty("fresh");
      });

      it("refuses a fresh run for a thread sent to a session, which has no group to restart", async () => {
        const deliveries = captureDeliveries();

        const response = await run("first", { fresh: true, target: LIVE_TARGET });

        expect(response.status).toBe(400);
        expect(((await response.json()) as { error: string }).error).toMatch(/fresh.*playground-managed/);
        expect(deliveries).not.toHaveBeenCalled();
        expect((await stored("first")).agentRun).toBeUndefined();
      });

      it("refuses a `fresh` that is not a boolean", async () => {
        const deliveries = captureDeliveries();

        const response = await run("first", { runtime: RUNTIME, fresh: "yes" });

        expect(response.status).toBe(400);
        expect(((await response.json()) as { error: string }).error).toContain('"fresh" must be a boolean');
        expect(deliveries).not.toHaveBeenCalled();
      });

      it("does not change the page's auto-run", async () => {
        captureDeliveries();

        await run("first", { runtime: RUNTIME, fresh: true });

        expect(await enabledAgent("welcome")).toBeFalsy();
        expect((await view("welcome")).pages).toEqual({ welcome: { autoRun: false } });
      });
    });

    it("marks the thread done when the agent resolves it", async () => {
      await run("first", { runtime: RUNTIME });
      const resolve = await fetch(
        `${baseUrl}/__playground/comments/first/resolve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{}",
        },
      );
      expect(resolve.status).toBe(200);
      expect(await stored("first")).toMatchObject({
        status: "resolved",
        agentRun: { sessionId: MANAGED, state: "done" },
      });
    });

    describe("per-page grouping", () => {
      const pricingFirst: StoredComment = { ...first, id: "pricing-first" };
      const pricingSecond: StoredComment = { ...second, id: "pricing-second" };

      beforeEach(async () => {
        await writeAll(dir, {
          welcome: [first, second],
          pricing: [pricingFirst, pricingSecond],
        });
      });

      it("shares one session across pages in shared grouping", async () => {
        await run("first", { runtime: RUNTIME });
        await run("pricing-first", {});

        expect((await stored("pricing-first")).agentRun?.sessionId).toBe(
          (await stored("first")).agentRun?.sessionId,
        );
      });

      it("starts one session per page and sends later threads into their page's session", async () => {
        expect((await putSettings({ grouping: "page" })).status).toBe(200);

        await run("first", { runtime: RUNTIME });
        await run("pricing-first", {});
        await run("pricing-second", {});

        const [welcome, pricing, pricingAgain] = await Promise.all(
          ["first", "pricing-first", "pricing-second"].map(
            async (id) => (await stored(id)).agentRun?.sessionId,
          ),
        );
        expect([welcome, pricing]).toEqual([MANAGED, MANAGED]);
        expect(pricing).not.toBe(welcome);
        expect(pricingAgain).toBe(pricing);
      });
    });
  });

  describe("session endpoints", () => {
    it("stops and forgets one session on DELETE", async () => {
      const { session } = (await (await createManaged()).json()) as {
        session: AgentSession;
      };
      const reset = await fetch(
        `${baseUrl}/__playground/agent-sessions/sessions/${session.runId}`,
        { method: "DELETE" },
      );
      expect(reset.status).toBe(200);
      expect(
        captain.callsTo("POST", new RegExp(`/runs/${session.runId}/stop$`)),
      ).toHaveLength(1);
      expect(readAgentSessions(dir).sessions).toEqual([]);

      const unknown = await fetch(
        `${baseUrl}/__playground/agent-sessions/sessions/${session.runId}`,
        { method: "DELETE" },
      );
      expect(unknown.status).toBe(404);
    });

    it("proxies captain with a 502 naming its URL when captain is down", async () => {
      await captain.close();

      const proxied = await fetch(
        `${baseUrl}/__playground/agent-runs/runs/run-1`,
      );

      expect(proxied.status).toBe(502);
      expect(((await proxied.json()) as { error: string }).error).toContain(
        captainURL,
      );
    });

    it("proxies stop to captain and records the session as stopped", async () => {
      await createManaged();
      const stop = await fetch(
        `${baseUrl}/__playground/agent-runs/runs/run-1/stop`,
        { method: "POST" },
      );
      expect(stop.status).toBe(202);
      expect(captain.callsTo("POST", /\/runs\/run-1\/stop$/)).toHaveLength(1);
      expect(readAgentSessions(dir).sessions[0]).toMatchObject({
        state: "stopped",
        endedAt: expect.any(String),
      });
    });

    it("reports the live session and notices when captain has ended it", async () => {
      await createManaged();
      expect((await view()).sessions[0]?.state).toBe("running");

      (captain.runs.get("run-1") as { done: boolean }).done = true;

      expect((await view()).sessions[0]).toMatchObject({
        state: "ended",
        endedAt: expect.any(String),
      });
    });

    it("streams a captain session through the proxy without buffering it", async () => {
      await createManaged();
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
  });

  describe("settings", () => {
    it.each([
      ["an unknown field", { model: MODEL }, 400],
      ["a bad grouping", { grouping: "team" }, 400],
      ["auto-run, which is a per-page comment agent now", { autoRun: true }, 400],
    ])("rejects %s", async (_label, body, status) => {
      const response = await putSettings(body);

      expect(response.status).toBe(status);
      expect(readAgentSessions(dir).settings).toEqual({ grouping: "shared" });
    });

    it("stores grouping and runtime", async () => {
      const response = await putSettings({ grouping: "page", runtime: RUNTIME });

      expect(response.status).toBe(200);
      const expected = { grouping: "page", runtime: RUNTIME };
      expect(await response.json()).toEqual({ settings: expected });
      expect(readAgentSessions(dir).settings).toEqual(expected);
    });

    it("rewrites every enabled page entry when the runtime or grouping changes", async () => {
      await putSettings({ runtime: RUNTIME });
      await putAutoRun({ page: "welcome", autoRun: true });
      await putAutoRun({ page: "team/summary", autoRun: true });
      await putAutoRun({ page: "pricing", autoRun: false });
      const model = "test-model-2";

      await putSettings({ grouping: "page", runtime: { spec: { model, mode: "agent" } } });

      expect(await projectPages()).toEqual({
        [entryKey("welcome")]: expect.objectContaining({ enabled: true, group: "playground:page:welcome", spec: { model, mode: "agent" } }),
        [entryKey("team/summary")]: expect.objectContaining({ enabled: true, group: "playground:page:team/summary", spec: { model, mode: "agent" } }),
      });
    });
  });

  describe("page auto-run", () => {
    it("saves the playground agent as the page's comment-agent entry in the project layer", async () => {
      await putSettings({ runtime: RUNTIME });

      const response = await putAutoRun({ page: "welcome", autoRun: true });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ autoRun: true });
      const { agent } = await commentsClient(dir).agent("welcome");
      expect(agent.agent.instructions).toContain("clicky-ui-playground");
      expect(agent.agent).toEqual({
        enabled: true,
        prompt: "editor-comments",
        group: "playground:shared",
        spec: RUNTIME.spec,
        instructions: agent.agent.instructions,
      });
      expect(Object.keys(await projectPages())).toEqual([entryKey("welcome")]);
      expect((await view("welcome")).pages).toEqual({ welcome: { autoRun: true } });
      expect((await view("pricing")).pages).toEqual({ pricing: { autoRun: false } });
    });

    it("carries the runtime's presets and a per-page group", async () => {
      await putSettings({ grouping: "page", runtime: { ...RUNTIME, presets: ["review"] } });

      await putAutoRun({ page: "welcome", autoRun: true });

      expect((await commentsClient(dir).agent("welcome")).agent.agent).toMatchObject({
        group: "playground:page:welcome",
        presets: ["review"],
      });
    });

    it("needs a runtime to auto-run the playground agent, and leaves no entry behind", async () => {
      const response = await putAutoRun({ page: "welcome", autoRun: true });

      expect(response.status).toBe(409);
      expect(((await response.json()) as { error: string }).error).toContain("auto-run needs a runtime");
      expect(await projectPages()).toEqual({});
    });

    it("removes the page's entry when auto-run is switched off", async () => {
      await putSettings({ runtime: RUNTIME });
      await putAutoRun({ page: "welcome", autoRun: true });

      const response = await putAutoRun({ page: "welcome", autoRun: false });

      expect(await response.json()).toEqual({ autoRun: false });
      expect(await projectPages()).toEqual({});
      expect((await view("welcome")).pages).toEqual({ welcome: { autoRun: false } });
    });

    it("saves {enabled: false} over an agent the page inherits from a default", async () => {
      await commentsClient(dir).saveAgent({ page: "welcome", layer: { kind: "project" }, entry: false, agent: { enabled: true, prompt: "editor-comments" } });
      expect((await view("welcome")).pages).toEqual({ welcome: { autoRun: true } });

      const response = await putAutoRun({ page: "welcome", autoRun: false });

      expect(await response.json()).toEqual({ autoRun: false });
      expect(await projectPages()).toEqual({ [entryKey("welcome")]: { enabled: false } });
      expect((await view("pricing")).pages).toEqual({ pricing: { autoRun: true } });
    });

    it("keeps each page's entry apart, even when the page name needs escaping", async () => {
      await putSettings({ runtime: RUNTIME });

      await putAutoRun({ page: "team/summary", autoRun: true });

      expect(Object.keys(await projectPages())).toEqual(["page/team%2Fsummary"]);
      expect((await view("welcome")).pages).toEqual({ welcome: { autoRun: false } });
    });

    it("refuses a repository document, which gavel could only run in its own workspace", async () => {
      await putSettings({ runtime: RUNTIME });

      const response = await putAutoRun({ page: "document:demo/readme.md", autoRun: true });

      expect(response.status).toBe(409);
      expect(((await response.json()) as { error: string }).error).toContain("gavel runs sessions in its workspace root");
      expect(await projectPages()).toEqual({});
    });

    it.each([
      ["no page", { autoRun: true }],
      ["an empty page", { page: "", autoRun: true }],
      ["no autoRun", { page: "welcome" }],
      ["a non-boolean autoRun", { page: "welcome", autoRun: "yes" }],
      ["a session target, which is no longer stored", { page: "welcome", autoRun: true, target: LIVE_TARGET }],
    ])("rejects %s", async (_label, body) => {
      expect((await putAutoRun(body)).status).toBe(400);
      expect(await projectPages()).toEqual({});
    });

    it("answers no pages for a view without a page", async () => {
      expect((await view()).pages).toEqual({});
    });
  });

  describe("live captain sessions", () => {
    it("offers the session the browser chose for a page even when it works elsewhere", async () => {
      captain.liveSessions = [{ id: "elsewhere-1", source: "claude", title: "Other", cwd: "/work/acme" }];

      const response = await fetch(`${baseUrl}/__playground/agent-sessions/captain?page=welcome&linked=elsewhere-1`);

      expect(((await response.json()) as { sessions: { id: string }[] }).sessions.map((entry) => entry.id)).toEqual(["elsewhere-1"]);
    });

    it("leaves out a session that works elsewhere unless the browser chose it", async () => {
      captain.liveSessions = [{ id: "elsewhere-1", source: "claude", title: "Other", cwd: "/work/acme" }];

      const response = await fetch(`${baseUrl}/__playground/agent-sessions/captain?page=welcome`);

      expect(((await response.json()) as { sessions: { id: string }[] }).sessions).toEqual([]);
    });

    it("lists live captain sessions without their process environment", async () => {
      captain.liveSessions = [
        {
          id: "captain-live-1",
          source: "claude",
          title: "Fix toolbar",
          model: "claude-opus-5-5",
          cwd: "/work/acme",
          live: {
            pid: 4242,
            active: true,
            environment: { CLAUDE_CODE_SESSION_ID: "provider-1", CMUX_SURFACE_ID: "surface-1" },
            surface: { surfaceId: "surface-1" },
          },
        },
      ];

      const response = await fetch(`${baseUrl}/__playground/agent-sessions/captain`);

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        sessions: [
          {
            id: "captain-live-1",
            source: "claude",
            title: "Fix toolbar",
            cwd: "/work/acme",
            model: "claude-opus-5-5",
            inCmux: true,
          },
        ],
      });
      expect(captain.callsTo("GET", /^\/api\/captain\/sessions\/live\?all=true/)).toHaveLength(1);
    });
  });

  describe("gavel-managed sessions", () => {
    const ENDED: GavelAgentSession = { id: "managed-ended", source: "claude", title: "welcome threads", model: "m", status: "ended", inCmux: false, managed: true, resumable: true };
    const RUNNING: GavelAgentSession = { id: "managed-running", source: "claude", title: "pricing threads", model: "m", status: "active", inCmux: false, managed: true };
    const sessionsOf = async (query = "?page=welcome") =>
      ((await (await fetch(`${baseUrl}/__playground/agent-sessions/captain${query}`)).json()) as { sessions: CaptainSessionOption[] }).sessions;

    afterEach(() => vi.restoreAllMocks());

    it("lists the scope's managed sessions with ended ones resumable, and leaves gavel's other live sessions to captain's listing", async () => {
      vi.spyOn(CommentsClient.prototype, "agentSessions").mockResolvedValue([
        ENDED,
        RUNNING,
        { id: "captain-only", source: "claude", title: "Not managed", inCmux: false, status: "active" },
      ]);

      expect(await sessionsOf()).toEqual([
        { id: "managed-ended", source: "claude", title: "welcome threads", model: "m", status: "ended", inCmux: false, managed: true, resumable: true },
        { id: "managed-running", source: "claude", title: "pricing threads", model: "m", status: "active", inCmux: false, managed: true },
      ]);
    });

    it("marks a captain live session that gavel manages instead of listing it twice", async () => {
      captain.liveSessions = [{ id: "managed-running", source: "claude", title: "Live title", model: "m", cwd: join(REPO_ROOT, "apps/playground/src/pages") }];
      vi.spyOn(CommentsClient.prototype, "agentSessions").mockResolvedValue([{ ...RUNNING, resumable: true }]);

      expect(await sessionsOf()).toEqual([
        expect.objectContaining({ id: "managed-running", title: "Live title", managed: true, resumable: true }),
      ]);
    });

    it("lists a managed session that works outside the page's directory, which only gavel knows", async () => {
      captain.liveSessions = [{ id: "elsewhere-1", source: "claude", title: "Other", cwd: "/work/acme" }];
      vi.spyOn(CommentsClient.prototype, "agentSessions").mockResolvedValue([{ ...ENDED, cwd: "/work/acme" }]);

      expect((await sessionsOf()).map((entry) => entry.id)).toEqual(["managed-ended"]);
    });

    it("fails the listing with gavel's error instead of hiding the managed sessions", async () => {
      vi.spyOn(CommentsClient.prototype, "agentSessions").mockRejectedValue(new Error("gavel down"));

      const response = await fetch(`${baseUrl}/__playground/agent-sessions/captain?page=welcome`);

      expect(response.status).toBe(500);
      expect(((await response.json()) as { error: string }).error).toContain("gavel down");
    });

    describe("as a thread's target", () => {
      function captureDeliveries() {
        return vi.spyOn(CommentsClient.prototype, "deliver").mockImplementation(async (options) => ({ ...first, id: options.id, version: options.version + 1 }));
      }

      it("resumes an ended session that gavel marks resumable", async () => {
        vi.spyOn(CommentsClient.prototype, "agentSessions").mockResolvedValue([ENDED]);
        const deliveries = captureDeliveries();

        const response = await run("first", { target: { kind: "managed", sessionId: ENDED.id, label: ENDED.title } });

        expect(response.status).toBe(202);
        expect(deliveries.mock.calls.map(([options]) => options.target)).toEqual([{ kind: "session", sessionId: ENDED.id }]);
      });

      it("delivers into a running managed session gavel lists", async () => {
        vi.spyOn(CommentsClient.prototype, "agentSessions").mockResolvedValue([RUNNING]);
        const deliveries = captureDeliveries();

        const response = await run("first", { target: { kind: "captain", sessionId: RUNNING.id, label: RUNNING.title } });

        expect(response.status).toBe(202);
        expect(deliveries).toHaveBeenCalledOnce();
      });

      it("refuses an ended managed session that gavel cannot resume, leaving the thread as it was", async () => {
        vi.spyOn(CommentsClient.prototype, "agentSessions").mockResolvedValue([{ ...ENDED, resumable: false }]);
        const deliveries = captureDeliveries();

        const response = await run("first", { target: { kind: "managed", sessionId: ENDED.id, label: ENDED.title } });

        expect(response.status).toBe(409);
        expect(((await response.json()) as { error: string }).error).toContain("Managed session is no longer available");
        expect(deliveries).not.toHaveBeenCalled();
      });
    });
  });

  describe("assigning every open thread of a page", () => {
    const third: StoredComment = { ...first, id: "third", body: "Align the badge" };

    function runBatch(body: Record<string, unknown>) {
      return fetch(`${baseUrl}/__playground/comments/agent-run/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: human, page: "welcome", ...body }),
      });
    }
    const idsOf = async (response: Response) => ((await response.json()) as { comments: StoredComment[] }).comments.map((comment) => comment.id);

    beforeEach(async () => {
      await writeAll(dir, { welcome: [first, second, third], pricing: [{ ...first, id: "pricing-first" }] });
      captain.liveSessions = [{ id: LIVE_ID, source: "claude", title: "Fix toolbar", model: "m" }];
    });
    afterEach(() => vi.restoreAllMocks());

    it("hands gavel one batch carrying each open root's version, for the chosen session", async () => {
      const deliveries = vi.spyOn(CommentsClient.prototype, "deliverBatch").mockResolvedValue([]);

      const response = await runBatch({ target: LIVE_TARGET });

      expect(response.status).toBe(202);
      expect(deliveries).toHaveBeenCalledOnce();
      expect(deliveries.mock.calls[0]?.[0]).toEqual({
        requestId: expect.stringMatching(/^playground:/),
        target: { kind: "session", sessionId: LIVE_ID },
        threads: [
          { id: "first", expectedVersion: 1 },
          { id: "second", expectedVersion: 1 },
          { id: "third", expectedVersion: 1 },
        ],
      });
      expect(deliveries.mock.calls[0]?.[1]).toEqual(human);
    });

    it("delivers every open root of the page into the session, and no other page's", async () => {
      const response = await runBatch({ target: LIVE_TARGET });

      expect(response.status).toBe(202);
      expect(await idsOf(response)).toEqual(["first", "second", "third"]);
      for (const id of ["first", "second", "third"]) {
        expect((await stored(id)).agentRun).toMatchObject({ sessionId: LIVE_ID, state: "sent" });
      }
      expect((await stored("pricing-first")).agentRun).toBeUndefined();
    });

    it("leaves out resolved threads and threads already delivered to that session", async () => {
      await writeAll(dir, { welcome: [first, { ...second, status: "resolved" }, third] });
      expect((await run("first", { target: LIVE_TARGET })).status).toBe(202);
      const deliveries = vi.spyOn(CommentsClient.prototype, "deliverBatch").mockResolvedValue([]);

      await runBatch({ target: LIVE_TARGET });

      expect(deliveries.mock.calls[0]?.[0].threads.map((thread) => thread.id)).toEqual(["third"]);
    });

    it("retries a thread whose delivery to that session failed", async () => {
      captain.liveSessions = [{ id: "gone", source: "claude", title: "Gone", model: "m" }];
      const gone = { kind: "captain", sessionId: "gone", label: "Gone" } as const;
      expect((await run("first", { target: gone })).status).toBe(502);
      const deliveries = vi.spyOn(CommentsClient.prototype, "deliverBatch").mockResolvedValue([]);

      await runBatch({ target: gone });

      expect(deliveries.mock.calls[0]?.[0].threads.map((thread) => thread.id)).toEqual(["first", "second", "third"]);
    });

    it("answers 409 when the page has no open thread to deliver", async () => {
      await writeAll(dir, { welcome: [{ ...first, status: "resolved" }] });
      const deliveries = vi.spyOn(CommentsClient.prototype, "deliverBatch").mockResolvedValue([]);

      const response = await runBatch({ target: LIVE_TARGET });

      expect(response.status).toBe(409);
      expect(((await response.json()) as { error: string }).error).toContain("no open thread");
      expect(deliveries).not.toHaveBeenCalled();
    });

    it("starts one gavel-managed session for the page's threads when no session is chosen", async () => {
      const response = await runBatch({ runtime: RUNTIME });

      expect(response.status).toBe(202);
      const sessions = await Promise.all(["first", "second", "third"].map(async (id) => (await stored(id)).agentRun?.sessionId));
      expect(sessions).toEqual([MANAGED, MANAGED, MANAGED]);
      expect(new Set(sessions).size).toBe(1);
      expect(captain.calls.filter((call) => call.url.endsWith("/deliver"))).toHaveLength(0);
    });

    it("asks gavel for a new session of the page's group when `fresh` is sent", async () => {
      const deliveries = vi.spyOn(CommentsClient.prototype, "deliverBatch").mockResolvedValue([]);

      await runBatch({ runtime: RUNTIME, fresh: true });

      expect(deliveries.mock.calls[0]?.[0].target).toEqual(expect.objectContaining({ kind: "run", groupKey: "playground:shared", fresh: true }));
      expect(readAgentSessions(dir).settings.runtime).toEqual(RUNTIME);
    });

    it("asks for a runtime when no session is chosen and none was ever saved", async () => {
      const response = await runBatch({});

      expect(response.status).toBe(409);
      expect(((await response.json()) as { error: string }).error).toMatch(/no live agent session; supply a runtime/);
      expect((await stored("first")).agentRun).toBeUndefined();
    });

    it("refuses a chosen session that is no longer live, delivering nothing", async () => {
      const deliveries = vi.spyOn(CommentsClient.prototype, "deliverBatch").mockResolvedValue([]);

      const response = await runBatch({ target: { ...LIVE_TARGET, sessionId: "gone" } });

      expect(response.status).toBe(409);
      expect(deliveries).not.toHaveBeenCalled();
    });

    it("surfaces gavel's failure of the whole batch and leaves every thread undelivered", async () => {
      vi.spyOn(CommentsClient.prototype, "deliverBatch").mockRejectedValue(new LaunchHttpError(409, "thread second is stale"));

      const stale = await runBatch({ target: LIVE_TARGET });

      expect(stale.status).toBe(409);
      expect(((await stale.json()) as { error: string }).error).toContain("stale");
      expect((await stored("first")).agentRun).toBeUndefined();
    });

    it.each([
      ["an agent actor", { author: { name: "Coding agent", kind: "agent" } }, 403],
      ["no page", { page: undefined }, 400],
      ["an empty page", { page: "" }, 400],
      ["an unexpected field", { comment: "first" }, 400],
      ["a runtime together with a session, which needs none", { target: LIVE_TARGET, runtime: RUNTIME }, 409],
      ["`fresh` together with a session", { target: LIVE_TARGET, fresh: true }, 400],
      ["a target that is no session", { target: { kind: "playground" } }, 400],
    ])("rejects %s", async (_label, body, status) => {
      const deliveries = vi.spyOn(CommentsClient.prototype, "deliverBatch").mockResolvedValue([]);

      const response = await runBatch(body);

      expect(response.status).toBe(status);
      expect(deliveries).not.toHaveBeenCalled();
    });

    it("refuses a repository document a managed run, which gavel could only start in its own workspace", async () => {
      await writeAll(dir, { "document:demo/readme.md": [first] });

      const response = await runBatch({ page: "document:demo/readme.md", runtime: RUNTIME });

      expect(response.status).toBe(409);
      expect(((await response.json()) as { error: string }).error).toContain("gavel runs sessions in its workspace root");
    });
  });

  describe("auto-run", () => {
    it("has gavel start the playground agent's session for a new human root", async () => {
      await putSettings({ runtime: RUNTIME });
      await putAutoRun({ page: "welcome", autoRun: true });

      const created = await createRoot("welcome", {});

      expect(await settledRun(created.id, "sent")).toMatchObject({
        sessionId: MANAGED,
        state: "sent",
      });
      expect(captain.calls).toHaveLength(0);
    });

    it.each([
      ["auto-run was switched off again", async () => { await putAutoRun({ page: "welcome", autoRun: true }); await putAutoRun({ page: "welcome", autoRun: false }); }, {}],
      ["the author is an agent", async () => { await putAutoRun({ page: "welcome", autoRun: true }); }, { author: { name: "Coding agent", kind: "agent" } }],
      ["only another page has auto-run", async () => { await putAutoRun({ page: "elsewhere", autoRun: true }); }, {}],
    ])("delivers nothing when %s", async (_label, arrange, body) => {
      await putSettings({ runtime: RUNTIME });
      await arrange();

      const created = await createRoot("welcome", body);
      // Give a would-be background delivery time to reach the session.
      await new Promise((resolve) => setTimeout(resolve, 500));

      expect((await stored(created.id)).agentRun).toBeUndefined();
    });
  });
});
