// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createServer, type ViteDevServer } from "vite";

import { playgroundComments } from "./comments-server";
import { readAll, writeAll, type StoredComment } from "./comments-store";

const human = { name: "Reviewer", kind: "user" } as const;
const agent = { name: "Agent", kind: "agent" } as const;
const comment: StoredComment = {
  id: "root",
  body: "Check the result",
  createdAt: "2026-10-18T09:00:00.000Z",
  author: human,
  status: "open",
};

describe("playground comment lifecycle API", () => {
  let dir: string;
  let server: ViteDevServer;
  let baseUrl: string;

  beforeEach(async () => {
    mkdirSync(join(process.cwd(), ".tmp"), { recursive: true });
    dir = mkdtempSync(join(process.cwd(), ".tmp", "comment-lifecycle-"));
    server = await createServer({
      configFile: false,
      plugins: [playgroundComments({ dir })],
      server: { host: "127.0.0.1", port: 0 },
    });
    await server.listen();
    const address = server.httpServer?.address();
    if (!address || typeof address === "string") {
      throw new Error("playground comment test server has no TCP address");
    }
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterEach(async () => {
    await server?.close();
    if (dir) rmSync(dir, { recursive: true, force: true });
  });

  async function postAction(options: {
    action: "close" | "reopen";
    id?: string;
    author: typeof human | typeof agent;
  }) {
    return fetch(
      `${baseUrl}/__playground/comments/${options.id ?? comment.id}/${options.action}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: options.author }),
      },
    );
  }

  it.each(["open", "in_progress", "resolved"])(
    "closes a %s root directly and reopens it with attribution cleared",
    async (status) => {
      writeAll(dir, { sample: [{ ...comment, status }] });

      const closeResponse = await postAction({
        action: "close",
        author: human,
      });
      expect(closeResponse.status).toBe(200);
      const closed = (await closeResponse.json()) as StoredComment;
      expect(closed).toMatchObject({
        id: comment.id,
        status: "closed",
        closedBy: human,
        closedAt: expect.any(String),
      });
      expect(readAll(dir).sample?.[0]).toEqual(closed);

      const reopenResponse = await postAction({
        action: "reopen",
        author: human,
      });
      expect(reopenResponse.status).toBe(200);
      const reopened = (await reopenResponse.json()) as StoredComment;
      expect(reopened).toMatchObject({ id: comment.id, status: "open" });
      expect(reopened).not.toHaveProperty("closedAt");
      expect(reopened).not.toHaveProperty("closedBy");
      expect(readAll(dir).sample?.[0]).toEqual(reopened);
    },
  );

  it("keeps repeated close idempotent and rejects a non-human actor", async () => {
    writeAll(dir, { sample: [comment] });

    const forbidden = await postAction({ action: "close", author: agent });
    expect(forbidden.status).toBe(403);
    expect(readAll(dir).sample?.[0]).toEqual(comment);

    const first = await postAction({ action: "close", author: human });
    const firstClosed = (await first.json()) as StoredComment;
    const second = await postAction({ action: "close", author: human });
    expect(second.status).toBe(200);
    expect(await second.json()).toEqual(firstClosed);
  });

  it("rejects closing a reply or an unknown root status", async () => {
    writeAll(dir, {
      sample: [
        { ...comment, status: "unexpected" },
        { ...comment, id: "reply", parentId: comment.id },
      ],
    });

    const reply = await postAction({
      action: "close",
      id: "reply",
      author: human,
    });
    expect(reply.status).toBe(409);
    const unknown = await postAction({ action: "close", author: human });
    expect(unknown.status).toBe(409);
    expect(readAll(dir).sample?.map((entry) => entry.status)).toEqual([
      "unexpected",
      "open",
    ]);
  });
});
