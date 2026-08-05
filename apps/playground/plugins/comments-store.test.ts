import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  addComment,
  commentsPath,
  patchComment,
  readAll,
  readPage,
  removeComment,
  type StoredComment,
} from "./comments-store";

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const scratchRoot = join(appRoot, ".tmp");

function comment(overrides: Partial<StoredComment> & { id: string }): StoredComment {
  return {
    body: `note ${overrides.id}`,
    createdAt: "2026-01-01T00:00:00.000Z",
    author: { name: "Moshe", kind: "user" },
    status: "open",
    anchor: ":scope > div:nth-child(1)",
    ...overrides,
  };
}

describe("comments-store", () => {
  let dir: string;

  beforeEach(() => {
    mkdirSync(scratchRoot, { recursive: true });
    dir = mkdtempSync(join(scratchRoot, "comments-"));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("reads an empty file map before anything has been written", () => {
    expect(readAll(dir)).toEqual({});
    expect(readPage(dir, "welcome")).toEqual([]);
  });

  it("round-trips a comment through the on-disk page map", () => {
    addComment(dir, "welcome", comment({ id: "c1" }));

    expect(readAll(dir)).toEqual({ welcome: [comment({ id: "c1" })] });
  });

  it("scopes comments to their page slug", () => {
    addComment(dir, "welcome", comment({ id: "c1" }));
    addComment(dir, "agent-inbox", comment({ id: "c2" }));

    expect(readPage(dir, "welcome").map((entry) => entry.id)).toEqual(["c1"]);
    expect(readPage(dir, "agent-inbox").map((entry) => entry.id)).toEqual(["c2"]);
  });

  it("rejects a duplicate id on the same page", () => {
    addComment(dir, "welcome", comment({ id: "c1" }));

    expect(() => addComment(dir, "welcome", comment({ id: "c1" }))).toThrow(
      /already exists on page "welcome"/,
    );
  });

  it.each([
    ["id", { id: "" }],
    ["body", { id: "c1", body: "" }],
    ["createdAt", { id: "c1", createdAt: "" }],
  ])("rejects a payload with an empty %s", (field, overrides) => {
    expect(() =>
      addComment(dir, "welcome", comment(overrides as Partial<StoredComment> & { id: string })),
    ).toThrow(new RegExp(`non-empty string "${field}"`));
  });

  it("rejects an empty page slug", () => {
    expect(() => addComment(dir, "", comment({ id: "c1" }))).toThrow(
      /non-empty page slug/,
    );
  });

  it("patches only the supplied fields and leaves the rest intact", () => {
    addComment(dir, "welcome", comment({ id: "c1" }));

    const patched = patchComment(dir, "welcome", "c1", {
      status: "resolved",
      updatedAt: "2026-02-02T00:00:00.000Z",
    });

    expect(patched).toEqual({
      ...comment({ id: "c1" }),
      status: "resolved",
      updatedAt: "2026-02-02T00:00:00.000Z",
    });
    expect(readPage(dir, "welcome")).toEqual([patched]);
  });

  it("throws when patching a comment that does not exist", () => {
    expect(() => patchComment(dir, "welcome", "missing", { body: "x" })).toThrow(
      /comment "missing" not found on page "welcome"/,
    );
  });

  it("cascades a root deletion to its replies at any depth", () => {
    addComment(dir, "welcome", comment({ id: "root" }));
    addComment(dir, "welcome", comment({ id: "reply", parentId: "root" }));
    addComment(dir, "welcome", comment({ id: "nested", parentId: "reply" }));
    addComment(dir, "welcome", comment({ id: "unrelated" }));

    expect(removeComment(dir, "welcome", "root")).toBe(3);
    expect(readPage(dir, "welcome").map((entry) => entry.id)).toEqual(["unrelated"]);
  });

  it("throws rather than silently resetting when the file is malformed", () => {
    mkdirSync(dir, { recursive: true });
    writeFileSync(commentsPath(dir), "{ not json", "utf8");

    expect(() => readAll(dir)).toThrow(/is not valid JSON/);
  });

  it("throws when the file holds an array instead of a page map", () => {
    mkdirSync(dir, { recursive: true });
    writeFileSync(commentsPath(dir), "[]", "utf8");

    expect(() => readAll(dir)).toThrow(/JSON object keyed by page slug/);
  });

  it("throws when a page maps to something other than an array", () => {
    mkdirSync(dir, { recursive: true });
    writeFileSync(commentsPath(dir), '{"welcome": {}}', "utf8");

    expect(() => readAll(dir)).toThrow(/page "welcome" must map to an array/);
  });
});
