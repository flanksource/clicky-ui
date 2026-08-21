import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
// Vitest resolves the workspace aliases, so the store's hand-copied status
// vocabulary can be checked against the library's — see "status vocabulary".
import { DEFAULT_COMMENT_STATUSES } from "@flanksource/clicky-ui/comments";

import {
  COMMENT_STATUSES,
  RESOLVED_STATUS,
  UNRESOLVED_STATUSES,
  addComment,
  addReply,
  commentsPath,
  findComment,
  listComments,
  parseCommentFilter,
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

/** A comment stored with no status at all — every reply, and older roots. */
function statusless(overrides: Partial<StoredComment> & { id: string }): StoredComment {
  const entry = comment(overrides);
  delete entry.status;
  return entry;
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
    expect(() => addComment(dir, "", comment({ id: "c1" }))).toThrow(/non-empty page slug/);
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

  describe("status vocabulary", () => {
    it("matches the library's configured statuses", () => {
      expect(COMMENT_STATUSES).toEqual(DEFAULT_COMMENT_STATUSES.map((status) => status.value));
    });

    it("treats exactly the library's unresolved statuses as unresolved", () => {
      expect(UNRESOLVED_STATUSES).toEqual(
        DEFAULT_COMMENT_STATUSES.filter((status) => status.unresolved).map(
          (status) => status.value,
        ),
      );
    });

    it("resolves to a status the library can render", () => {
      expect(COMMENT_STATUSES).toContain(RESOLVED_STATUS);
      expect(UNRESOLVED_STATUSES).not.toContain(RESOLVED_STATUS);
    });

    it("rejects a status the UI could not render", () => {
      expect(() => addComment(dir, "welcome", comment({ id: "c1", status: "done" }))).toThrow(
        /status "done" is not one of open, in_progress, resolved, closed/,
      );
    });
  });

  describe("parseCommentFilter", () => {
    it("returns an unfiltered request when no parameters are supplied", () => {
      expect(parseCommentFilter(new URLSearchParams())).toEqual({});
    });

    it("carries the page slug through", () => {
      expect(parseCommentFilter(new URLSearchParams("page=welcome"))).toEqual({
        page: "welcome",
      });
    });

    it.each([
      ["repeated", "status=open&status=closed"],
      ["comma-separated", "status=open,closed"],
      ["mixed and padded", "status=open&status=%20closed%20"],
    ])("accepts %s statuses", (_form, query) => {
      expect(parseCommentFilter(new URLSearchParams(query))).toEqual({
        statuses: ["open", "closed"],
      });
    });

    it("expands unresolved=true to the unresolved statuses", () => {
      expect(parseCommentFilter(new URLSearchParams("unresolved=true"))).toEqual({
        statuses: ["open", "in_progress"],
      });
    });

    it("leaves the filter open when unresolved=false", () => {
      expect(parseCommentFilter(new URLSearchParams("unresolved=false"))).toEqual({});
    });

    it("de-duplicates statuses that arrive twice", () => {
      expect(parseCommentFilter(new URLSearchParams("status=open&unresolved=true"))).toEqual({
        statuses: ["open", "in_progress"],
      });
    });

    it("rejects an unknown status by naming the valid ones", () => {
      expect(() => parseCommentFilter(new URLSearchParams("status=nope"))).toThrow(
        /status "nope" is not one of open, in_progress, resolved, closed/,
      );
    });

    it("rejects a non-boolean unresolved flag", () => {
      expect(() => parseCommentFilter(new URLSearchParams("unresolved=yes"))).toThrow(
        /"unresolved" must be "true" or "false"/,
      );
    });
  });

  describe("listComments", () => {
    beforeEach(() => {
      addComment(dir, "welcome", comment({ id: "w-open" }));
      addComment(dir, "welcome", statusless({ id: "w-reply", parentId: "w-open" }));
      addComment(dir, "welcome", comment({ id: "w-done", status: "resolved" }));
      addComment(dir, "agent-inbox", comment({ id: "a-progress", status: "in_progress" }));
    });

    it("flattens every page and tags each comment with its page", () => {
      expect(listComments(dir, {}).map((entry) => [entry.page, entry.id])).toEqual([
        ["agent-inbox", "a-progress"],
        ["welcome", "w-open"],
        ["welcome", "w-reply"],
        ["welcome", "w-done"],
      ]);
    });

    it("narrows to a single page", () => {
      expect(listComments(dir, { page: "agent-inbox" }).map((entry) => entry.id)).toEqual([
        "a-progress",
      ]);
    });

    it("returns nothing for a page that has never been commented on", () => {
      expect(listComments(dir, { page: "unknown" })).toEqual([]);
    });

    it("filters thread roots by status", () => {
      expect(listComments(dir, { statuses: ["resolved"] }).map((entry) => entry.id)).toEqual([
        "w-done",
      ]);
    });

    it("keeps the replies of a root that matches the status filter", () => {
      expect(listComments(dir, { statuses: ["open"] }).map((entry) => entry.id)).toEqual([
        "w-open",
        "w-reply",
      ]);
    });

    it("combines a page and a status filter", () => {
      expect(
        listComments(dir, { page: "welcome", statuses: UNRESOLVED_STATUSES }).map(
          (entry) => entry.id,
        ),
      ).toEqual(["w-open", "w-reply"]);
    });

    it("treats a root with no stored status as open", () => {
      addComment(dir, "welcome", statusless({ id: "w-bare" }));

      expect(listComments(dir, { statuses: ["open"] }).map((entry) => entry.id)).toContain(
        "w-bare",
      );
    });
  });

  describe("addressing a comment by id alone", () => {
    beforeEach(() => {
      addComment(dir, "welcome", comment({ id: "root" }));
      addComment(dir, "agent-inbox", comment({ id: "other" }));
    });

    it("finds the page a comment lives on", () => {
      expect(findComment(dir, "other")).toEqual({
        page: "agent-inbox",
        comment: comment({ id: "other" }),
      });
    });

    it("reports a miss rather than guessing a page", () => {
      expect(findComment(dir, "missing")).toBeUndefined();
    });

    it("patches only the supplied fields and leaves the rest intact", () => {
      const patched = patchComment(dir, "root", {
        status: "resolved",
        updatedAt: "2026-02-02T00:00:00.000Z",
      });

      expect(patched).toEqual({
        ...comment({ id: "root" }),
        status: "resolved",
        updatedAt: "2026-02-02T00:00:00.000Z",
      });
      expect(readPage(dir, "welcome")).toEqual([patched]);
    });

    it("rejects a patch to a status the UI could not render", () => {
      expect(() => patchComment(dir, "root", { status: "done" })).toThrow(
        /status "done" is not one of/,
      );
    });

    it("throws when patching a comment that does not exist", () => {
      expect(() => patchComment(dir, "missing", { body: "x" })).toThrow(/comment "missing" not found/);
    });

    it("cascades a root deletion to its replies at any depth", () => {
      addComment(dir, "welcome", comment({ id: "reply", parentId: "root" }));
      addComment(dir, "welcome", comment({ id: "nested", parentId: "reply" }));
      addComment(dir, "welcome", comment({ id: "unrelated" }));

      expect(removeComment(dir, "root")).toBe(3);
      expect(readPage(dir, "welcome").map((entry) => entry.id)).toEqual(["unrelated"]);
      expect(readPage(dir, "agent-inbox").map((entry) => entry.id)).toEqual(["other"]);
    });

    it("throws when deleting a comment that does not exist", () => {
      expect(() => removeComment(dir, "missing")).toThrow(/comment "missing" not found/);
    });
  });

  describe("addReply", () => {
    const ROOT_ANCHOR = ":scope > h1:nth-child(1)";

    beforeEach(() => {
      addComment(dir, "welcome", comment({ id: "root", anchor: ROOT_ANCHOR }));
    });

    it("inherits the root's page and anchor so the reply lands on the same pin", () => {
      const reply = addReply(
        dir,
        "root",
        statusless({ id: "r1", anchor: null, author: { name: "Agent", kind: "agent" } }),
      );

      expect(reply).toMatchObject({ parentId: "root", anchor: ROOT_ANCHOR });
      expect(readPage(dir, "welcome").map((entry) => entry.id)).toEqual(["root", "r1"]);
    });

    it("flattens a reply-to-a-reply onto the thread root", () => {
      addReply(dir, "root", statusless({ id: "r1" }));

      expect(addReply(dir, "r1", statusless({ id: "r2" }))).toMatchObject({ parentId: "root" });
    });

    it("throws when the parent does not exist", () => {
      expect(() => addReply(dir, "missing", comment({ id: "r1" }))).toThrow(
        /comment "missing" not found/,
      );
    });
  });
});
