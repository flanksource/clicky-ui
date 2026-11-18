// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { commentsClient } from "./comments-client";
import type { CommentAgentSettings } from "../src/comments/gavel-delivery";
import { LaunchHttpError } from "./launch-client";
import { readAll, writeAll, type StoredComment } from "./testing/comments-store";

const THREAD = "thread-1";
const PAGE = "welcome";
const LIVE_SESSION = "fake-session";
const human = { name: "Reviewer", kind: "user" } as const;
const root: StoredComment = {
  version: 1,
  id: THREAD,
  body: "Make the heading bolder",
  createdAt: "2026-10-18T09:00:00.000Z",
  author: human,
  status: "open",
  anchor: null,
};

describe("CommentsClient agent delivery", () => {
  let dir: string;

  beforeEach(async () => {
    mkdirSync(join(process.cwd(), ".tmp"), { recursive: true });
    dir = mkdtempSync(join(process.cwd(), ".tmp", "comments-delivery-"));
    await writeAll(dir, { [PAGE]: [root] });
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  async function version() {
    const found = (await readAll(dir))[PAGE]?.find((comment) => comment.id === THREAD);
    if (!found?.version) throw new Error("fixture thread has no version");
    return found.version;
  }

  it("lists the live agent sessions gavel can deliver to", async () => {
    const sessions = await (await commentsClient(dir)).agentSessions();

    expect(sessions).toEqual([
      expect.objectContaining({ id: LIVE_SESSION, source: "claude", model: "claude-test", inCmux: false }),
    ]);
  });

  it("delivers a thread into a live session and returns it with gavel's agentRun", async () => {
    const delivered = await (await commentsClient(dir)).deliver({
      id: THREAD,
      version: await version(),
      requestId: "deliver-1",
      target: { kind: "session", sessionId: LIVE_SESSION },
    }, human);

    expect(delivered.agentRun).toMatchObject({ sessionId: LIVE_SESSION, state: "sent", target: { label: LIVE_SESSION } });
  });

  it("surfaces a delivery to a session that is not live as gavel's 502, recorded on the thread", async () => {
    const attempt = (await commentsClient(dir)).deliver({
      id: THREAD,
      version: await version(),
      requestId: "deliver-gone",
      target: { kind: "session", sessionId: "gone" },
    }, human);

    await expect(attempt).rejects.toMatchObject({ status: 502, message: expect.stringContaining("no longer live") });
    expect((await readAll(dir))[PAGE]?.[0]?.agentRun).toMatchObject({ state: "error", error: expect.stringContaining("no longer live") });
  });

  it("answers a stale version with gavel's 409", async () => {
    const attempt = (await commentsClient(dir)).deliver({
      id: THREAD,
      version: 99,
      requestId: "deliver-stale",
      target: { kind: "session", sessionId: LIVE_SESSION },
    }, human);

    await expect(attempt).rejects.toBeInstanceOf(LaunchHttpError);
    await expect(attempt).rejects.toMatchObject({ status: 409 });
  });

  describe("batch delivery", () => {
    const OTHER = "thread-2";

    beforeEach(async () => {
      await writeAll(dir, { [PAGE]: [root, { ...root, id: OTHER, body: "Tighten the footer" }] });
    });

    async function threads() {
      const roots = (await readAll(dir))[PAGE] ?? [];
      return roots.map((comment) => {
        if (!comment.version) throw new Error(`fixture thread ${comment.id} has no version`);
        return { id: comment.id, expectedVersion: comment.version };
      });
    }

    it("delivers several threads into a live session in one request and returns each with gavel's agentRun", async () => {
      const delivered = await (await commentsClient(dir)).deliverBatch(
        { requestId: "batch-1", target: { kind: "session", sessionId: LIVE_SESSION }, threads: await threads() },
        human,
      );

      expect(delivered.map((comment) => ({ id: comment.id, run: comment.agentRun?.sessionId, state: comment.agentRun?.state }))).toEqual([
        { id: THREAD, run: LIVE_SESSION, state: "sent" },
        { id: OTHER, run: LIVE_SESSION, state: "sent" },
      ]);
    });

    it("fails the whole batch on a stale thread and delivers none", async () => {
      const [first, second] = await threads();
      const attempt = (await commentsClient(dir)).deliverBatch(
        { requestId: "batch-stale", target: { kind: "session", sessionId: LIVE_SESSION }, threads: [first!, { ...second!, expectedVersion: 99 }] },
        human,
      );

      await expect(attempt).rejects.toBeInstanceOf(LaunchHttpError);
      await expect(attempt).rejects.toMatchObject({ status: 409 });
      expect((await readAll(dir))[PAGE]?.map((comment) => comment.agentRun)).toEqual([undefined, undefined]);
    });
  });

  it("lists a session gavel started for a thread as managed once the run was delivered", async () => {
    await (await commentsClient(dir)).deliver({
      id: THREAD,
      version: await version(),
      requestId: "deliver-run",
      target: { kind: "run", prompt: "editor-comments", groupKey: "test:group", runOptions: { spec: { model: "test-model-1" } } },
    }, human);

    const sessions = await (await commentsClient(dir)).agentSessions();

    expect(sessions).toContainEqual(expect.objectContaining({ id: expect.stringMatching(/^managed-\d+$/), managed: true }));
  });

  describe("comment agent settings", () => {
    const layer = { kind: "project" } as const;
    const agent = { enabled: true, prompt: "editor-comments", group: "playground:shared", spec: { model: "test-model-1" } };
    const entryKey = `pages/${encodeURIComponent(PAGE)}`;
    const projectPages = (settings: CommentAgentSettings) =>
      Object.assign({}, ...settings.settings.layers.filter((entry) => entry.kind === "project").map((entry) => entry.config.comments?.agents?.pages ?? {}));

    it("saves a page entry in the project layer, resolves it for the page, and removes it again", async () => {
      const client = await commentsClient(dir);
      expect((await client.agent(PAGE)).agent.agent.enabled).toBeFalsy();

      const saved = await client.saveAgent({ page: PAGE, layer, entry: true, agent });
      expect(saved.agent.agent).toMatchObject(agent);
      expect(projectPages(saved)).toEqual({ [entryKey]: expect.objectContaining(agent) });
      expect((await client.agent(PAGE)).agent.agent).toMatchObject(agent);
      expect((await client.agent("pricing")).agent.agent.enabled).toBeFalsy();

      const removed = await client.saveAgent({ page: PAGE, layer, entry: true, agent: null });
      expect(projectPages(removed)).toEqual({});
      expect(removed.agent.agent.enabled).toBeFalsy();
    });

    it("saves {enabled: false} over an agent the page inherits from the default", async () => {
      const client = await commentsClient(dir);
      await client.saveAgent({ page: PAGE, layer, entry: false, agent });
      expect((await client.agent(PAGE)).agent.agent.enabled).toBe(true);

      const off = await client.saveAgent({ page: PAGE, layer, entry: true, agent: { enabled: false } });

      expect(off.agent.agent.enabled).toBe(false);
      expect(projectPages(off)).toEqual({ [entryKey]: { enabled: false } });
      expect((await client.agent("pricing")).agent.agent.enabled).toBe(true);
    });

    it("rejects a target outside the client's scope", async () => {
      const client = await commentsClient(dir);
      const attempt = client.request("/agent", {
        method: "PUT",
        body: JSON.stringify({ target: { scopeUri: client.scope, uri: "gavel://project/elsewhere/pages/welcome" }, layer, page: true, agent }),
      });

      await expect(attempt).rejects.toMatchObject({ status: 400 });
    });
  });
});
