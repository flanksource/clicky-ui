// @vitest-environment node
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { DEFAULT_COMMENT_STATUSES } from "../../../packages/ui/src/comments/comment-types";
import {
  COMMENT_STATUSES,
  RESOLVED_STATUS,
  UNRESOLVED_STATUSES,
  patchComment,
  readAll,
  writeAll,
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

describe("server and library comment statuses", () => {
  it("lists the same statuses, in the same order, as the library defaults", () => {
    expect([...COMMENT_STATUSES]).toEqual(
      DEFAULT_COMMENT_STATUSES.map((status) => status.value),
    );
  });

  it("marks exactly the library's unresolved statuses as unresolved", () => {
    expect([...UNRESOLVED_STATUSES]).toEqual(
      DEFAULT_COMMENT_STATUSES.filter((status) => status.unresolved).map(
        (status) => status.value,
      ),
    );
  });

  it("resolves to the library's resolved-stage status", () => {
    expect(RESOLVED_STATUS).toBe(
      DEFAULT_COMMENT_STATUSES.find((status) => status.stage === "resolved")
        ?.value,
    );
  });
});

describe("dashboard filter module", () => {
  it("loads under plain node type stripping, as the copied watcher script requires", () => {
    const model = fileURLToPath(
      new URL("../src/comments/dashboard-model.ts", import.meta.url),
    );
    const script = `
      import { filterDashboardComments } from ${JSON.stringify(model)};
      const base = { createdAt: "2026-10-18T09:00:00.000Z", author: { name: "A" }, page: "p" };
      const comments = [
        { ...base, id: "open", body: "a", status: "open" },
        { ...base, id: "progress", body: "b", status: "in_progress" },
        { ...base, id: "done", body: "c", status: "resolved" },
      ];
      const state = { status: "unresolved", projects: {}, pages: {}, author: "", assignee: "", screenshots: "all", query: "", sort: null };
      process.stdout.write(JSON.stringify(filterDashboardComments(comments, state).map((entry) => entry.id)));
    `;
    const output = execFileSync(
      process.execPath,
      ["--experimental-strip-types", "--input-type=module", "-e", script],
      { encoding: "utf8" },
    );
    expect(JSON.parse(output)).toEqual(["open", "progress"]);
  });
});

describe("assignment fields in the comment store", () => {
  let dir: string;

  beforeEach(() => {
    mkdirSync(join(process.cwd(), ".tmp"), { recursive: true });
    dir = mkdtempSync(join(process.cwd(), ".tmp", "comment-store-"));
  });

  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("loads comments without assignment metadata", async () => {
    await writeAll(dir, { sample: [comment] });

    const [loaded] = (await readAll(dir)).sample ?? [];

    expect(loaded).toEqual(comment);
    expect(loaded?.assignee).toBeUndefined();
  });

  it("sets assignee and acknowledgement through a patch and clears them with null", async () => {
    await writeAll(dir, { sample: [comment] });
    const acknowledgedAt = "2026-10-18T10:00:00.000Z";

    const set = await patchComment(dir, comment.id, {
      status: "in_progress",
      assignee: agent,
      acknowledgedAt,
      acknowledgedBy: agent,
    });
    expect(set).toMatchObject({
      status: "in_progress",
      assignee: agent,
      acknowledgedAt,
      acknowledgedBy: agent,
    });
    expect((await readAll(dir)).sample?.[0]).toEqual(set);

    const cleared = await patchComment(dir, comment.id, {
      status: "open",
      assignee: null,
      acknowledgedAt: null,
      acknowledgedBy: null,
    }, { assign: true });
    expect(cleared).toEqual({ ...comment, version: 5, updatedAt: expect.any(String) });
    expect((await readAll(dir)).sample?.[0]).toEqual(cleared);
  });

  it("leaves assignment untouched by an unrelated patch", async () => {
    const held = { ...comment, status: "in_progress", assignee: agent };
    await writeAll(dir, { sample: [held] });

    expect(await patchComment(dir, comment.id, { body: "Edited" })).toEqual({
      ...held,
      body: "Edited",
      version: 3,
      updatedAt: expect.any(String),
    });
  });
});
