import { spawn, type ChildProcess } from "node:child_process";
import { resolve } from "node:path";
import { beforeAll, afterAll } from "vitest";
import { configureComments } from "../comments-client";
import { commentActor } from "../comments-projection";
import * as store from "../comments-store";
export * from "../comments-store";

let process: ChildProcess;
let url: string;
beforeAll(async () => {
  const cwd = resolve(import.meta.dirname, "../../../../../gavel");
  process = spawn("go", ["run", "./comments/testhost"], {
    cwd,
    detached: true,
    env: { ...globalThis.process.env },
  });
  url = await new Promise<string>((ready, reject) => {
    let output = "";
    let errors = "";
    process.stderr?.on("data", (data) => {
      errors += String(data);
    });
    process.stdout?.on("data", (data) => {
      output += String(data);
      for (const line of output.split("\n")) {
        if (!line.startsWith('{"url":')) continue;
        const value = JSON.parse(line) as { url: string };
        ready(value.url);
      }
    });
    process.once("error", reject);
    process.once("exit", (code) =>
      reject(new Error(`Comments test host exited (${code}): ${errors}`)),
    );
  });
}, 120_000);
afterAll(() => {
  if (process?.pid) globalThis.process.kill(-process.pid, "SIGTERM");
});

export function configureTestComments(dir: string) {
  if (!url) throw new Error("Comments test host is not ready");
  return configureComments({
    dir,
    workspace: dir,
    endpoint: {
      url: async () => url,
      unreachable: () => false,
      generation: 0,
      close: async () => undefined,
    },
  });
}
const client = configureTestComments;
export async function writeAll(dir: string, data: store.CommentsFile) {
  const c = client(dir);
  const rows = Object.entries(data).flatMap(([page, list]) =>
    list
      .filter((comment) => !comment.parentId)
      .map((comment) => {
        const status = comment.status ?? "open";
        const createdAt = new Date(comment.createdAt).toISOString();
        const author = commentActor(
          comment.author ?? { name: "You", kind: "user" },
        );
        return {
          id: comment.id,
          tenantId: c.scope,
          target: c.target(page),
          bodyMarkdown: comment.body || "Feedback",
          author,
          workflowId: "human-review",
          status,
          phase:
            status === "closed"
              ? "final"
              : status === "resolved"
                ? "awaiting_outcome"
                : "active",
          version: 1,
          createdAt,
          updatedAt: comment.updatedAt ?? createdAt,
          content: { playground: { ...comment, page } },
          ...(comment.assignee
            ? { assignee: commentActor(comment.assignee) }
            : {}),
          ...(status === "closed"
            ? { outcome: { kind: "close", actor: author, at: createdAt } }
            : {}),
          messages: list
            .filter((reply) => reply.parentId === comment.id)
            .map((reply) => ({
              id: reply.id,
              bodyMarkdown: reply.body,
              author: commentActor(
                reply.author ?? { name: "You", kind: "user" },
              ),
              createdAt: new Date(reply.createdAt).toISOString(),
              content: { playground: { ...reply, page } },
            })),
        };
      }),
  );
  const response = await fetch(`${url}/fixtures`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Gavel-Comment-Scope": c.scope,
    },
    body: JSON.stringify(rows),
  });
  if (!response.ok) throw new Error(await response.text());
}
export async function readAll(dir: string) {
  client(dir);
  return store.readAll(dir);
}
export async function readPage(dir: string, page: string) {
  client(dir);
  return store.readPage(dir, page);
}
export async function addComment(
  dir: string,
  page: string,
  comment: store.StoredComment,
) {
  client(dir);
  const created = await store.addComment(dir, page, comment);
  const all = await store.readAll(dir);
  const fixture = {
    ...created,
    ...comment,
    id: comment.id,
    rootId: comment.id,
  };
  all[page] = (all[page] ?? []).map((row) =>
    row.id === created.id ? fixture : row,
  );
  await writeAll(dir, all);
  return fixture;
}
