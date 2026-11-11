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
} from "./agent-runs-server";
import {
  readAgentSessions,
  type AgentSession,
  type AgentSessionsView,
} from "./agent-session-store";
import { CommentsClient, commentsClient } from "./comments-client";
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

  function putTarget(body: Record<string, unknown>) {
    return fetch(`${baseUrl}/__playground/agent-sessions/targets`, {
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

  async function view(): Promise<AgentSessionsView> {
    return (await (
      await fetch(`${baseUrl}/__playground/agent-sessions`)
    ).json()) as AgentSessionsView;
  }

  /** The page's comment target, which is also its route's prefix. */
  const pageUri = (page: string) => commentsClient(dir).target(page).uri;

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
    it("creates a session, records it, and points the page at it through a gavel route", async () => {
      const created = await createManaged();
      expect(created.status).toBe(201);
      const { session, route } = (await created.json()) as {
        session: AgentSession;
        route: unknown;
      };

      const target = {
        kind: "managed",
        sessionId: session.sessionId,
        label: `welcome · ${MODEL}`,
      };
      expect(route).toEqual({ target, autoRun: false });
      expect(readAgentSessions(dir).sessions).toEqual([session]);
      expect(await commentsClient(dir).routes()).toEqual([
        expect.objectContaining({
          targetPrefix: pageUri("welcome"),
          enabled: false,
          target: { kind: "session", sessionId: session.sessionId },
        }),
      ]);
      expect((await view()).pages).toEqual({ welcome: { target, autoRun: false } });
      expect((await stored(second.id)).agentRun).toBeUndefined();
    });

    it("lets gavel refuse a thread for a session that gavel does not see live, and records it on the thread", async () => {
      await createManaged();

      const response = await run(second.id, {});

      expect(response.status).toBe(502);
      expect(((await response.json()) as { error: string }).error).toContain("no longer live");
      expect((await stored(second.id)).agentRun).toMatchObject({
        state: "error",
        error: expect.stringContaining("no longer live"),
      });
    });

    it("keeps comments, sessions and routes as they were when startup fails", async () => {
      captain.nextRunFailure = { status: 422, body: { error: "runtime unavailable" } };
      const before = await readAll(dir);

      const created = await createManaged();

      expect(created.status).toBe(502);
      expect(readAgentSessions(dir).sessions).toEqual([]);
      expect(await commentsClient(dir).routes()).toEqual([]);
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
      expect(await commentsClient(dir).routes()).toEqual([]);
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

    it("answers gavel's 502 when the page's session is no longer live, and records it on the thread", async () => {
      await putTarget({
        page: "welcome",
        target: { kind: "captain", sessionId: "gone", label: "Gone" },
      });

      const response = await run("first", {});

      expect(response.status).toBe(502);
      expect(((await response.json()) as { error: string }).error).toContain("no longer live");
      expect(await stored("first")).toMatchObject({
        agentRun: { state: "error", error: expect.stringContaining("no longer live") },
      });
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

      it("refuses a fresh run for a page that sends to a session, which has no group to restart", async () => {
        const deliveries = captureDeliveries();
        await putTarget({ page: "welcome", target: LIVE_TARGET });

        const response = await run("first", { fresh: true });

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

      it("does not change the page's route", async () => {
        captureDeliveries();

        await run("first", { runtime: RUNTIME, fresh: true });

        expect(await commentsClient(dir).routes()).toEqual([]);
        expect((await view()).pages).toEqual({});
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
      ["auto-run, which is a per-page route now", { autoRun: true }, 400],
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

    it("rebuilds the auto-run routes that start a session when the runtime or grouping changes", async () => {
      await putSettings({ runtime: RUNTIME });
      await putTarget({ page: "welcome", autoRun: true });
      const model = "test-model-2";

      await putSettings({ grouping: "page", runtime: { spec: { model, mode: "agent" } } });

      expect(await commentsClient(dir).routes()).toEqual([
        expect.objectContaining({
          target: expect.objectContaining({
            kind: "run",
            groupKey: "playground:page:welcome",
            runOptions: expect.objectContaining({ spec: { model, mode: "agent" } }),
          }),
        }),
      ]);
    });
  });

  describe("page routes", () => {
    it("maps the playground agent's auto-run to a gavel run route under the page's comment target", async () => {
      await putSettings({ runtime: RUNTIME });

      const response = await putTarget({ page: "welcome", autoRun: true });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        route: { target: { kind: "playground" }, autoRun: true },
      });
      const [route] = await commentsClient(dir).routes();
      if (route?.target.kind !== "run") throw new Error(`expected a run route, got ${JSON.stringify(route)}`);
      const instructions = route.target.runOptions?.instructions;
      expect(instructions).toContain("clicky-ui-playground");
      expect(await commentsClient(dir).routes()).toEqual([
        {
          id: expect.any(String),
          scopeUri: commentsClient(dir).scope,
          targetPrefix: pageUri("welcome"),
          workflowId: "human-review",
          enabled: true,
          target: {
            kind: "run",
            prompt: "editor-comments",
            groupKey: "playground:shared",
            runOptions: { spec: RUNTIME.spec, instructions },
          },
        },
      ]);
    });

    it("needs a runtime to auto-run the playground agent, and leaves no route behind", async () => {
      const response = await putTarget({ page: "welcome", autoRun: true });

      expect(response.status).toBe(409);
      expect(((await response.json()) as { error: string }).error).toContain("auto-run needs a runtime");
      expect(await commentsClient(dir).routes()).toEqual([]);
    });

    it("stores a page's session target as a disabled route and clears it back to the playground agent", async () => {
      captain.liveSessions = [{ id: LIVE_ID, source: "claude", title: "Fix toolbar", model: "m" }];

      const set = await putTarget({ page: "welcome", target: LIVE_TARGET });

      expect(set.status).toBe(200);
      expect(await set.json()).toEqual({ route: { target: LIVE_TARGET, autoRun: false } });
      expect(await commentsClient(dir).routes()).toEqual([
        expect.objectContaining({
          targetPrefix: pageUri("welcome"),
          enabled: false,
          target: { kind: "session", sessionId: LIVE_ID },
        }),
      ]);
      expect((await view()).pages).toEqual({ welcome: { target: LIVE_TARGET, autoRun: false } });

      expect((await putTarget({ page: "welcome", target: { kind: "playground" } })).status).toBe(200);
      expect(await commentsClient(dir).routes()).toEqual([]);
      expect((await view()).pages).toEqual({});
    });

    it("keeps the session target when auto-run is switched on and off, and the auto-run when the target changes", async () => {
      await putTarget({ page: "welcome", target: LIVE_TARGET });

      await putTarget({ page: "welcome", autoRun: true });
      expect((await view()).pages["welcome"]).toMatchObject({ target: { sessionId: LIVE_ID }, autoRun: true });
      await putTarget({ page: "welcome", autoRun: false });
      expect((await view()).pages["welcome"]).toMatchObject({ target: { sessionId: LIVE_ID }, autoRun: false });
      await putTarget({ page: "welcome", autoRun: true });
      await putTarget({ page: "welcome", target: { ...LIVE_TARGET, sessionId: "other" } });

      expect(await commentsClient(dir).routes()).toEqual([
        expect.objectContaining({ enabled: true, target: { kind: "session", sessionId: "other" } }),
      ]);
    });

    it("keeps each page's route apart, even when the page name needs escaping", async () => {
      await putTarget({ page: "team/summary", target: LIVE_TARGET });

      expect((await commentsClient(dir).routes())[0]?.targetPrefix).toBe(
        `${commentsClient(dir).scope}/page/team%2Fsummary`,
      );
      expect(Object.keys((await view()).pages)).toEqual(["team/summary"]);
    });

    it.each([
      ["a captain target without a session", { page: "welcome", target: { kind: "captain", label: "x" } }],
      ["an unknown kind", { page: "welcome", target: { kind: "terminal" } }],
      ["extra fields", { page: "welcome", target: { ...LIVE_TARGET, environment: {} } }],
      ["a request that changes nothing", { page: "welcome" }],
      ["a non-boolean autoRun", { page: "welcome", autoRun: "yes" }],
    ])("rejects %s", async (_label, body) => {
      expect((await putTarget(body)).status).toBe(400);
      expect(await commentsClient(dir).routes()).toEqual([]);
    });

    it("refuses a managed target that is not a running session", async () => {
      const response = await putTarget({
        page: "welcome",
        target: { kind: "managed", sessionId: "nope", label: "Nope" },
      });

      expect(response.status).toBe(409);
      expect(await commentsClient(dir).routes()).toEqual([]);
    });

    it("delivers a thread into the page's session through gavel, as that session's agent", async () => {
      await putTarget({ page: "welcome", target: LIVE_TARGET });

      const response = await run("first", {});

      expect(response.status).toBe(202);
      expect(captain.calls.filter((call) => call.url.endsWith("/deliver"))).toHaveLength(0);
      expect((await stored("first")).agentRun).toMatchObject({
        sessionId: LIVE_ID,
        state: "sent",
        target: { channel: "claude-socket" },
      });
    });

    it("refuses a runtime for a page that sends to a session", async () => {
      await putTarget({ page: "welcome", target: LIVE_TARGET });

      const response = await run("first", { runtime: RUNTIME });

      expect(response.status).toBe(409);
      expect((await stored("first")).agentRun).toBeUndefined();
    });

    it("keeps other pages on the playground agent", async () => {
      await putTarget({ page: "elsewhere", target: LIVE_TARGET });

      const response = await run("first", { runtime: RUNTIME });

      expect(response.status).toBe(202);
      expect((await stored("first")).agentRun?.sessionId).toEqual(MANAGED);
    });

    it("offers the session a page is routed to even when it works elsewhere", async () => {
      captain.liveSessions = [{ id: "elsewhere-1", source: "claude", title: "Other", cwd: "/work/acme" }];
      await putTarget({ page: "welcome", target: { kind: "captain", sessionId: "elsewhere-1", label: "Other" } });

      const response = await fetch(`${baseUrl}/__playground/agent-sessions/captain?page=welcome`);

      expect(((await response.json()) as { sessions: { id: string }[] }).sessions.map((entry) => entry.id)).toEqual(["elsewhere-1"]);
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

  describe("auto-run", () => {
    it("has gavel start the playground agent's session for a new human root", async () => {
      await putSettings({ runtime: RUNTIME });
      await putTarget({ page: "welcome", autoRun: true });

      const created = await createRoot("welcome", {});

      expect(await settledRun(created.id, "sent")).toMatchObject({
        sessionId: MANAGED,
        state: "sent",
      });
      expect(captain.calls).toHaveLength(0);
    });

    it("has gavel deliver a new human root into the page's session", async () => {
      await putTarget({ page: "welcome", target: LIVE_TARGET, autoRun: true });

      const created = await createRoot("welcome", {});

      expect(await settledRun(created.id, "sent")).toMatchObject({
        sessionId: LIVE_ID,
        state: "sent",
      });
    });

    it.each([
      ["the route is not enabled", { target: LIVE_TARGET }, {}],
      ["the author is an agent", { target: LIVE_TARGET, autoRun: true }, { author: { name: "Coding agent", kind: "agent" } }],
      ["the page has no route", { page: "elsewhere", target: LIVE_TARGET, autoRun: true }, {}],
    ])("delivers nothing when %s", async (_label, route, body) => {
      await putTarget({ page: "welcome", ...route });

      const created = await createRoot("welcome", body);
      // Give a would-be background delivery time to reach the session.
      await new Promise((resolve) => setTimeout(resolve, 500));

      expect((await stored(created.id)).agentRun).toBeUndefined();
    });

    it("records a failed delivery on the comment when the routed session is gone", async () => {
      await putTarget({ page: "welcome", target: { ...LIVE_TARGET, sessionId: "gone" }, autoRun: true });

      const created = await createRoot("welcome", {});

      expect(await settledRun(created.id, "error")).toMatchObject({
        error: expect.stringContaining("no longer live"),
      });
    });
  });
});
