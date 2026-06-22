import { describe, expect, it } from "vitest";
import {
  applyCommentFilters,
  authorDisplayName,
  buildReplyMap,
  commentCountForPrefix,
  defaultStatusValue,
  deriveAnchorCounts,
  deriveAnchorMeta,
  emptyCommentFilters,
  getRoots,
  groupByFacet,
  hasActiveFilters,
  isUnresolved,
  matchMentionsInBody,
  nextChecklistStatus,
  resolveStatusConfig,
  sortReplies,
  toneToBadgeTone,
  truncatePlain,
} from "./comment-utils";
import {
  DOCUMENT_ANCHOR,
  type Comment,
  type CommentConfig,
  type CommentMentionable,
} from "./comment-types";

const config: CommentConfig = {
  statuses: [
    { value: "open", label: "Open", tone: "info", unresolved: true },
    { value: "resolved", label: "Resolved", tone: "success" },
  ],
  facets: [
    {
      key: "area",
      label: "Area",
      options: [
        { value: "ui", label: "UI" },
        { value: "api", label: "API" },
      ],
    },
  ],
  checklistStatusCycle: ["open", "in_progress", "done"],
};

function comment(over: Partial<Comment> & Pick<Comment, "id">): Comment {
  return {
    body: "body",
    createdAt: "2026-01-01T00:00:00.000Z",
    author: { name: "Ada" },
    ...over,
  };
}

describe("buildReplyMap / sortReplies / getRoots", () => {
  const comments: Comment[] = [
    comment({ id: "r1", status: "open" }),
    comment({ id: "c2", parentId: "r1", createdAt: "2026-01-02T00:00:00.000Z" }),
    comment({ id: "c1", parentId: "r1", createdAt: "2026-01-01T05:00:00.000Z" }),
    comment({ id: "r2", status: "resolved" }),
  ];

  it("indexes replies under their parent id", () => {
    const map = buildReplyMap(comments);
    expect(map.get("r1")?.map((c) => c.id).sort()).toEqual(["c1", "c2"]);
    expect(map.has("r2")).toBe(false);
  });

  it("returns only root comments", () => {
    expect(getRoots(comments).map((c) => c.id)).toEqual(["r1", "r2"]);
  });

  it("sorts replies by creation time then id", () => {
    const replies = buildReplyMap(comments).get("r1") ?? [];
    expect(sortReplies(replies).map((c) => c.id)).toEqual(["c1", "c2"]);
  });
});

describe("groupByFacet", () => {
  it("groups roots by facet value, missing values under empty key", () => {
    const groups = groupByFacet(
      [
        comment({ id: "a", facets: { area: "ui" } }),
        comment({ id: "b", facets: { area: "api" } }),
        comment({ id: "c" }),
        comment({ id: "d", parentId: "a", facets: { area: "ui" } }),
      ],
      "area",
    );
    expect(groups.get("ui")?.map((c) => c.id)).toEqual(["a"]);
    expect(groups.get("api")?.map((c) => c.id)).toEqual(["b"]);
    expect(groups.get("")?.map((c) => c.id)).toEqual(["c"]);
  });
});

describe("deriveAnchorCounts / deriveAnchorMeta", () => {
  const comments: Comment[] = [
    comment({ id: "a", anchor: "row.1", author: { name: "Ada" }, status: "open" }),
    comment({
      id: "b",
      anchor: "row.1",
      author: { name: "Bo" },
      status: "resolved",
      updatedAt: "2026-02-01T00:00:00.000Z",
    }),
    comment({ id: "c", anchor: null, author: { name: "Ada" } }),
  ];

  it("counts comments per anchor, null → document anchor", () => {
    expect(deriveAnchorCounts(comments)).toEqual({ "row.1": 2, [DOCUMENT_ANCHOR]: 1 });
  });

  it("aggregates distinct authors and the latest status", () => {
    const meta = deriveAnchorMeta(comments);
    expect(meta["row.1"]?.count).toBe(2);
    expect(meta["row.1"]?.authors.sort()).toEqual(["Ada", "Bo"]);
    expect(meta["row.1"]?.latestStatus).toBe("resolved");
  });
});

describe("commentCountForPrefix", () => {
  it("sums an anchor and its dotted descendants", () => {
    const counts = { a: 1, "a.b": 2, "a.b.c": 3, other: 9 };
    expect(commentCountForPrefix(counts, "a")).toBe(6);
    expect(commentCountForPrefix(counts, "a.b")).toBe(5);
  });
});

describe("nextChecklistStatus", () => {
  it("advances and wraps within the cycle", () => {
    const cycle = ["open", "in_progress", "done"];
    expect(nextChecklistStatus("open", cycle)).toBe("in_progress");
    expect(nextChecklistStatus("done", cycle)).toBe("open");
  });

  it("falls back to the first entry for an unknown status", () => {
    expect(nextChecklistStatus("???", ["open", "done"])).toBe("open");
  });
});

describe("truncatePlain", () => {
  it("strips inline markdown punctuation", () => {
    expect(truncatePlain("**bold** and `code`")).toBe("bold and code");
  });

  it("truncates with an ellipsis past the limit", () => {
    expect(truncatePlain("abcdefghij", 4)).toBe("abcd…");
  });
});

describe("applyCommentFilters", () => {
  const comments: Comment[] = [
    comment({ id: "r1", status: "open", facets: { area: "ui" }, author: { name: "Ada", kind: "user" } }),
    comment({ id: "r1c", parentId: "r1", author: { name: "Bot", kind: "agent" } }),
    comment({ id: "r2", status: "resolved", facets: { area: "api" }, author: { name: "Bo" } }),
    comment({ id: "r3", status: "open", author: { name: "AI", kind: "agent" } }),
  ];

  it("filters by status and keeps the replies of passing roots", () => {
    const result = applyCommentFilters(
      comments,
      { ...emptyCommentFilters(), statuses: new Set(["open"]) },
      config,
    );
    expect(result.map((c) => c.id).sort()).toEqual(["r1", "r1c", "r3"]);
  });

  it("filters by facet value", () => {
    const result = applyCommentFilters(
      comments,
      { ...emptyCommentFilters(), facets: { area: new Set(["api"]) } },
      config,
    );
    expect(result.map((c) => c.id)).toEqual(["r2"]);
  });

  it("filters by author kind", () => {
    const result = applyCommentFilters(
      comments,
      { ...emptyCommentFilters(), authorKind: "agent" },
      config,
    );
    expect(result.map((c) => c.id)).toEqual(["r3"]);
  });
});

describe("hasActiveFilters", () => {
  it("is false for an empty filter and true once an axis is set", () => {
    expect(hasActiveFilters(emptyCommentFilters())).toBe(false);
    expect(hasActiveFilters({ ...emptyCommentFilters(), statuses: new Set(["open"]) })).toBe(true);
    expect(hasActiveFilters({ ...emptyCommentFilters(), authorKind: "agent" })).toBe(true);
  });
});

describe("matchMentionsInBody", () => {
  const mentionables: CommentMentionable[] = [
    { id: "u1", name: "Ada", kind: "user" },
    { id: "a1", name: "claude", kind: "agent" },
  ];

  it("returns mentionables whose @name appears in the body", () => {
    expect(matchMentionsInBody("hey @claude please check", mentionables)).toEqual([
      { id: "a1", name: "claude", kind: "agent" },
    ]);
  });

  it("returns nothing when no mention token is present", () => {
    expect(matchMentionsInBody("no mentions here", mentionables)).toEqual([]);
  });
});

describe("status helpers", () => {
  it("maps comment tones onto badge tones", () => {
    expect(toneToBadgeTone("danger")).toBe("danger");
    expect(toneToBadgeTone("default")).toBe("neutral");
    expect(toneToBadgeTone(undefined)).toBe("neutral");
  });

  it("resolves the default and unresolved status", () => {
    expect(defaultStatusValue(config)).toBe("open");
    expect(isUnresolved(config, "open")).toBe(true);
    expect(isUnresolved(config, "resolved")).toBe(false);
  });

  it("resolves a status config by value", () => {
    expect(resolveStatusConfig(config, "resolved")?.label).toBe("Resolved");
    expect(resolveStatusConfig(config, "nope")).toBeUndefined();
  });

  it("names an author with an Unknown fallback", () => {
    expect(authorDisplayName({ name: "Ada" })).toBe("Ada");
    expect(authorDisplayName(null)).toBe("Unknown");
  });
});
