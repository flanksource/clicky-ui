// @vitest-environment node
import { existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createServer, type ViteDevServer } from "vite";

import { playgroundComments } from "./comments-server";
import {
  configureTestComments,
  readAll,
  writeAll,
  type StoredAuthor,
  type StoredComment,
} from "./testing/comments-store";

const human = { name: "Reviewer", kind: "user" } as const;
const agent = { name: "Agent", kind: "agent" } as const;
const comment: StoredComment = {
  id: "root",
  version: 1,
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
    configureTestComments(dir);
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

  it("stores screenshot bytes as Gavel attachments and hides them with a deleted root", async () => {
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6sV8AAAAASUVORK5CYII=",
      "base64",
    );
    const response = await fetch(`${baseUrl}/__playground/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page: "sample",
        body: "Review this capture",
        author: human,
        element: {
          source: "sample.tsx",
          html: "<main>Sample</main>",
          screenshot: {
            status: "captured",
            dataUrl: `data:image/png;base64,${png.toString("base64")}`,
          },
        },
      }),
    });
    expect(response.status).toBe(201);
    const root = (await response.json()) as StoredComment;
    const screenshot = root.element?.screenshot;
    if (screenshot?.status !== "captured")
      throw new Error("Expected a captured attachment");
    const image = await fetch(new URL(screenshot.url, baseUrl));
    expect(image.status).toBe(200);
    expect(image.headers.get("content-type")).toBe("image/png");
    expect(Buffer.from(await image.arrayBuffer())).toEqual(png);
    expect(existsSync(join(dir, "comments.json"))).toBe(false);
    expect(existsSync(join(dir, "screenshots"))).toBe(false);
    const deleted = await fetch(`${baseUrl}/__playground/comments/${root.id}`, {
      method: "DELETE",
    });
    expect(deleted.status).toBe(200);
    expect((await fetch(new URL(screenshot.url, baseUrl))).status).toBe(404);
    expect(await readAll(dir)).toEqual({});
  });

  it("serves activity without bodies or capture context", async () => {
    await writeAll(dir, { sample: [comment] });
    const response = await fetch(`${baseUrl}/__playground/comments/activity`);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      pages: {
        sample: {
          updated: 0,
          commented: Date.parse(comment.createdAt),
          resolved: 0,
          openCount: 1,
          resolvedCount: 0,
          waitingOn: ["Unassigned"],
          rootCounts: { open: 1, in_progress: 0, resolved: 0, closed: 0 },
          commentCount: 1,
        },
      },
    });
  });

  it.each(["open", "in_progress", "resolved"])(
    "closes a %s root directly and reopens it with attribution cleared",
    async (status) => {
      await writeAll(dir, { sample: [{ ...comment, status }] });

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
      expect((await readAll(dir)).sample?.[0]).toEqual(closed);

      const reopenResponse = await postAction({
        action: "reopen",
        author: human,
      });
      expect(reopenResponse.status).toBe(200);
      const reopened = (await reopenResponse.json()) as StoredComment;
      expect(reopened).toMatchObject({ id: comment.id, status: "open" });
      expect(reopened).not.toHaveProperty("closedAt");
      expect(reopened).not.toHaveProperty("closedBy");
      expect((await readAll(dir)).sample?.[0]).toEqual(reopened);
    },
  );

  it("keeps repeated close idempotent and rejects a non-human actor", async () => {
    await writeAll(dir, { sample: [comment] });

    const forbidden = await postAction({ action: "close", author: agent });
    expect(forbidden.status).toBe(403);
    expect((await readAll(dir)).sample?.[0]).toEqual(comment);

    const first = await postAction({ action: "close", author: human });
    const firstClosed = (await first.json()) as StoredComment;
    const second = await postAction({ action: "close", author: human });
    expect(second.status).toBe(200);
    expect(await second.json()).toEqual(firstClosed);
  });

  it("rejects closing a reply or an unknown root status", async () => {
    await writeAll(dir, {
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
    expect((await readAll(dir)).sample?.map((entry) => entry.status)).toEqual([
      "unexpected",
      "open",
    ]);
  });

  async function postReply(author: Record<string, unknown>) {
    return fetch(`${baseUrl}/__playground/comments/${comment.id}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: "Review findings", author }),
    });
  }

  it("keeps the relaying agent, session and cost of a delegated reply", async () => {
    await writeAll(dir, { sample: [comment] });
    const delegated = {
      name: "gpt-6.1-sol",
      kind: "agent",
      via: "Claude",
      sessionId: "019a3f2e-session",
      cost: 0.42,
    };

    const response = await postReply(delegated);

    expect(response.status).toBe(201);
    const reply = (await response.json()) as StoredComment;
    expect(reply.author).toEqual(delegated);
    expect((await readAll(dir)).sample?.[1]?.author).toEqual(delegated);
  });

  it.each([
    ["an empty via", { via: " " }],
    ["a non-string session id", { sessionId: 42 }],
    ["a negative cost", { cost: -0.01 }],
    ["a cost given as text", { cost: "0.42" }],
  ])("rejects a reply author with %s", async (_label, attribution) => {
    await writeAll(dir, { sample: [comment] });

    const response = await postReply({ ...agent, ...attribution });

    expect(response.status).toBe(400);
    expect((await readAll(dir)).sample).toEqual([comment]);
  });

  describe("acknowledge and assign", () => {
    const otherAgent = { name: "Codex", kind: "agent" } as const;
    const otherHuman = { name: "Reviewer Two", kind: "user" } as const;
    const heldBy = (holder: StoredAuthor) => ({
      ...comment,
      status: "in_progress",
      assignee: holder,
      acknowledgedBy: holder,
      acknowledgedAt: "2026-10-18T09:30:00.000Z",
    });

    async function act(
      action: "acknowledge" | "assign" | "resolve" | "close" | "reopen",
      body: Record<string, unknown>,
      id: string = comment.id,
    ) {
      return fetch(`${baseUrl}/__playground/comments/${id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }
    const stored = async () => (await readAll(dir)).sample?.[0];

    it.each([
      ["an agent", agent],
      ["a user", human],
    ])(
      "lets %s acknowledge an open root, assigning it to themselves",
      async (_label, actor) => {
        await writeAll(dir, { sample: [comment] });

        const response = await act("acknowledge", { author: actor });

        expect(response.status).toBe(200);
        const acknowledged = (await response.json()) as StoredComment;
        expect(acknowledged).toMatchObject({
          id: comment.id,
          status: "in_progress",
          assignee: actor,
          acknowledgedBy: actor,
          acknowledgedAt: expect.any(String),
          updatedAt: expect.any(String),
        });
        expect(await stored()).toEqual(acknowledged);
      },
    );

    it("keeps repeated acknowledgement by the same holder unchanged", async () => {
      await writeAll(dir, { sample: [heldBy(agent)] });

      const response = await act("acknowledge", { author: agent });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual(heldBy(agent));
      expect(await stored()).toEqual(heldBy(agent));
    });

    it("records the acknowledgement when the assignee picks up an assigned root", async () => {
      const assigned = { ...comment, status: "in_progress", assignee: agent };
      await writeAll(dir, { sample: [assigned] });

      const response = await act("acknowledge", { author: agent });

      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({
        status: "in_progress",
        assignee: agent,
        acknowledgedBy: agent,
        acknowledgedAt: expect.any(String),
      });
    });

    it("claims an in-progress root that has no assignee (older data)", async () => {
      await writeAll(dir, { sample: [{ ...comment, status: "in_progress" }] });

      const response = await act("acknowledge", { author: agent });

      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({
        status: "in_progress",
        assignee: agent,
        acknowledgedBy: agent,
      });
    });

    it.each([
      ["an agent holds it and another agent", heldBy(agent), otherAgent],
      ["a user holds it and an agent", heldBy(human), agent],
    ])(
      "rejects acknowledgement when %s competes",
      async (_label, existing, actor) => {
        await writeAll(dir, { sample: [existing] });

        const response = await act("acknowledge", { author: actor });

        expect(response.status).toBe(409);
        expect(await stored()).toEqual(existing);
      },
    );

    it.each([
      ["an agent holds it", heldBy(agent), human],
      ["another user holds it", heldBy(otherHuman), human],
    ])("lets a user take over when %s", async (_label, existing, actor) => {
      await writeAll(dir, { sample: [existing] });

      const response = await act("acknowledge", { author: actor });

      expect(response.status).toBe(200);
      const taken = (await response.json()) as StoredComment;
      expect(taken).toMatchObject({
        status: "in_progress",
        assignee: actor,
        acknowledgedBy: actor,
      });
      expect(taken.acknowledgedAt).not.toBe(existing.acknowledgedAt);
    });

    it.each(["resolved", "closed"])(
      "rejects acknowledging a %s root",
      async (status) => {
        const existing = {
          ...comment,
          status,
          ...(status === "closed"
            ? {
                closedAt: comment.createdAt,
                closedBy: { ...human, id: "user:Reviewer" },
              }
            : {}),
        };
        await writeAll(dir, { sample: [existing] });

        for (const actor of [agent, human]) {
          const response = await act("acknowledge", { author: actor });
          expect(response.status).toBe(409);
        }
        expect(await stored()).toEqual(existing);
      },
    );

    it("rejects acknowledging a reply, an unknown id and a malformed request", async () => {
      await writeAll(dir, {
        sample: [comment, { ...comment, id: "reply", parentId: comment.id }],
      });

      expect(
        (await act("acknowledge", { author: agent }, "reply")).status,
      ).toBe(409);
      expect(
        (await act("acknowledge", { author: agent }, "missing")).status,
      ).toBe(404);
      expect((await act("acknowledge", {})).status).toBe(400);
      expect(
        (await act("acknowledge", { author: agent, assignee: agent })).status,
      ).toBe(400);
      expect(await stored()).toEqual(comment);
    });

    it.each(["open", "in_progress"])(
      "lets a user assign a %s root to an agent without acknowledging for it",
      async (status) => {
        await writeAll(dir, { sample: [{ ...comment, status }] });

        const response = await act("assign", {
          author: human,
          assignee: agent,
        });

        expect(response.status).toBe(200);
        const assigned = (await response.json()) as StoredComment;
        expect(assigned).toMatchObject({
          status: "in_progress",
          assignee: agent,
        });
        expect(assigned).not.toHaveProperty("acknowledgedAt");
        expect(assigned).not.toHaveProperty("acknowledgedBy");
        expect(await stored()).toEqual(assigned);
      },
    );

    it("treats assigning yourself as acknowledging", async () => {
      await writeAll(dir, { sample: [comment] });

      const response = await act("assign", { author: human, assignee: human });

      expect(await response.json()).toMatchObject({
        assignee: human,
        acknowledgedBy: human,
        acknowledgedAt: expect.any(String),
      });
    });

    it("starts a new work cycle when the assignee changes", async () => {
      await writeAll(dir, { sample: [heldBy(agent)] });

      const response = await act("assign", {
        author: human,
        assignee: otherAgent,
      });

      const reassigned = (await response.json()) as StoredComment;
      expect(reassigned).toMatchObject({ assignee: otherAgent });
      expect(reassigned).not.toHaveProperty("acknowledgedBy");
      expect(reassigned).not.toHaveProperty("acknowledgedAt");
    });

    it("keeps the acknowledgement when the same assignee is assigned again", async () => {
      await writeAll(dir, { sample: [heldBy(agent)] });

      const response = await act("assign", { author: human, assignee: agent });

      expect(await response.json()).toMatchObject(heldBy(agent));
    });

    it("clears the assignee and returns the root to open when assignee is null", async () => {
      await writeAll(dir, { sample: [heldBy(agent)] });

      const response = await act("assign", { author: human, assignee: null });

      expect(response.status).toBe(200);
      const cleared = (await response.json()) as StoredComment;
      expect(cleared.status).toBe("open");
      for (const field of ["assignee", "acknowledgedBy", "acknowledgedAt"]) {
        expect(cleared).not.toHaveProperty(field);
      }
      expect(await stored()).toEqual(cleared);
    });

    it("keeps unassigning an open root unchanged", async () => {
      await writeAll(dir, { sample: [comment] });

      const response = await act("assign", { author: human, assignee: null });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual(comment);
    });

    it("rejects assignment by an agent", async () => {
      await writeAll(dir, { sample: [comment] });

      const response = await act("assign", { author: agent, assignee: agent });

      expect(response.status).toBe(403);
      expect(await stored()).toEqual(comment);
    });

    it.each(["resolved", "closed"])(
      "rejects assigning a %s root",
      async (status) => {
        const existing = {
          ...comment,
          status,
          ...(status === "closed"
            ? {
                closedAt: comment.createdAt,
                closedBy: { ...human, id: "user:Reviewer" },
              }
            : {}),
        };
        await writeAll(dir, { sample: [existing] });

        const response = await act("assign", {
          author: human,
          assignee: agent,
        });

        expect(response.status).toBe(409);
        expect(await stored()).toEqual(existing);
      },
    );

    it.each([
      ["a missing assignee", { author: human }],
      [
        "an assignee without a name",
        { author: human, assignee: { kind: "agent" } },
      ],
      ["a text assignee", { author: human, assignee: "Claude" }],
      ["an unexpected field", { author: human, assignee: agent, note: "x" }],
    ])("rejects an assign request with %s", async (_label, body) => {
      await writeAll(dir, { sample: [comment] });

      const response = await act("assign", body);

      expect(response.status).toBe(400);
      expect(await stored()).toEqual(comment);
    });

    it("keeps the assignee on record when the holder resolves or a human closes", async () => {
      await writeAll(dir, { sample: [heldBy(agent)] });

      const resolved = await act("resolve", {});
      expect(await resolved.json()).toMatchObject({
        status: "resolved",
        assignee: agent,
        acknowledgedBy: agent,
      });
      const closed = await act("close", { author: human });
      expect(await closed.json()).toMatchObject({
        status: "closed",
        assignee: agent,
      });
    });

    it.each([
      ["without feedback", undefined],
      ["with feedback", "Still broken"],
    ])(
      "clears the assignee and acknowledgement when reopened %s",
      async (_label, feedback) => {
        await writeAll(dir, {
          sample: [{ ...heldBy(agent), status: "resolved" }],
        });

        const response = await act("reopen", {
          author: human,
          ...(feedback ? { body: feedback } : {}),
        });

        expect(response.status).toBe(200);
        const reopened = (await response.json()) as StoredComment;
        expect(reopened.status).toBe("open");
        for (const field of ["assignee", "acknowledgedBy", "acknowledgedAt"]) {
          expect(reopened).not.toHaveProperty(field);
          expect(await stored()).not.toHaveProperty(field);
        }
      },
    );

    it("no longer accepts a status through PATCH, only text and rating", async () => {
      await writeAll(dir, { sample: [comment] });

      const rejected = await fetch(
        `${baseUrl}/__playground/comments/${comment.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "in_progress" }),
        },
      );
      expect(rejected.status).toBe(400);
      expect(await stored()).toEqual(comment);

      const accepted = await fetch(
        `${baseUrl}/__playground/comments/${comment.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: "Edited", rating: "positive" }),
        },
      );
      expect(accepted.status).toBe(200);
      expect(await stored()).toMatchObject({
        body: "Edited",
        rating: "positive",
      });
    });

    it("advertises acknowledge_comment to agents, but not the human-only assign", async () => {
      const response = await fetch(`${baseUrl}/__playground/comments/schema`);
      const { tools } = (await response.json()) as {
        tools: {
          name: string;
          method: string;
          path: string;
          inputSchema: {
            properties: Record<string, unknown>;
            required?: string[];
          };
        }[];
      };

      const names = tools.map((tool) => tool.name);
      expect(names).toContain("acknowledge_comment");
      expect(names).not.toContain("assign_comment");
      const acknowledge = tools.find(
        (tool) => tool.name === "acknowledge_comment",
      );
      expect(acknowledge).toMatchObject({
        method: "POST",
        path: "/__playground/comments/{id}/acknowledge",
      });
      expect(acknowledge?.inputSchema.required).toEqual(["id", "author"]);
      const update = tools.find((tool) => tool.name === "update_comment");
      expect(Object.keys(update?.inputSchema.properties ?? {}).sort()).toEqual([
        "body",
        "id",
        "rating",
      ]);
    });
  });
});
