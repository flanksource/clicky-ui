// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { commentsClient } from "./comments-client";
import { checkGavelDeliveryRoutes } from "./gavel-compatibility";
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

  it("is recognised by the playground's gavel compatibility check", async () => {
    await expect(checkGavelDeliveryRoutes(await commentsClient(dir).endpoint.url())).resolves.toBeUndefined();
  });

  it("lists the live agent sessions gavel can deliver to", async () => {
    const sessions = await commentsClient(dir).agentSessions();

    expect(sessions).toEqual([
      expect.objectContaining({ id: LIVE_SESSION, source: "claude", model: "claude-test", inCmux: false }),
    ]);
  });

  it("delivers a thread into a live session and returns it with gavel's agentRun", async () => {
    const delivered = await commentsClient(dir).deliver({
      id: THREAD,
      version: await version(),
      requestId: "deliver-1",
      target: { kind: "session", sessionId: LIVE_SESSION },
    }, human);

    expect(delivered.agentRun).toMatchObject({ sessionId: LIVE_SESSION, state: "sent", target: { label: LIVE_SESSION } });
  });

  it("surfaces a delivery to a session that is not live as gavel's 502, recorded on the thread", async () => {
    const attempt = commentsClient(dir).deliver({
      id: THREAD,
      version: await version(),
      requestId: "deliver-gone",
      target: { kind: "session", sessionId: "gone" },
    }, human);

    await expect(attempt).rejects.toMatchObject({ status: 502, message: expect.stringContaining("no longer live") });
    expect((await readAll(dir))[PAGE]?.[0]?.agentRun).toMatchObject({ state: "error", error: expect.stringContaining("no longer live") });
  });

  it("answers a stale version with gavel's 409", async () => {
    const attempt = commentsClient(dir).deliver({
      id: THREAD,
      version: 99,
      requestId: "deliver-stale",
      target: { kind: "session", sessionId: LIVE_SESSION },
    }, human);

    await expect(attempt).rejects.toBeInstanceOf(LaunchHttpError);
    await expect(attempt).rejects.toMatchObject({ status: 409 });
  });

  it("creates, replaces and deletes a route under the client's scope", async () => {
    const client = commentsClient(dir);
    const targetPrefix = client.target(PAGE).uri;
    const created = await client.saveRoute({
      scopeUri: client.scope,
      targetPrefix,
      workflowId: "human-review",
      target: { kind: "session", sessionId: LIVE_SESSION },
      enabled: false,
    });
    expect(await client.routes()).toEqual([created]);
    expect(created).toMatchObject({ targetPrefix, enabled: false, target: { kind: "session", sessionId: LIVE_SESSION } });

    const replaced = await client.saveRoute({ ...created, enabled: true });
    expect(replaced).toEqual({ ...created, enabled: true });
    expect(await client.routes()).toEqual([replaced]);

    await client.deleteRoute(created.id);
    expect(await client.routes()).toEqual([]);
  });

  it("rejects a route whose prefix is outside the scope", async () => {
    const client = commentsClient(dir);
    const attempt = client.saveRoute({
      scopeUri: client.scope,
      targetPrefix: "gavel://workspace/elsewhere/page/welcome",
      workflowId: "human-review",
      target: { kind: "session", sessionId: LIVE_SESSION },
      enabled: true,
    });

    await expect(attempt).rejects.toMatchObject({ status: 400 });
  });
});
