import { describe, expect, it } from "vitest";
import { assertFeedbackActivity, commentActivity } from "./comment-activity";

describe("comment activity projection", () => {
  it("counts roots only and includes reply edits in recency without capture data", () => {
    const createdAt = "2026-10-01T00:00:00Z";
    const updatedAt = "2026-10-29T00:00:00Z";
    expect(commentActivity([
      { page: "example", createdAt, status: "open", assignee: { name: "Agent" } },
      { page: "example", createdAt, status: "resolved" },
      { page: "example", createdAt, updatedAt, parentId: "root", status: "open" },
    ])).toEqual({ example: {
      updated: 0, commented: Date.parse(updatedAt), resolved: Date.parse(createdAt),
      openCount: 1, resolvedCount: 1, waitingOn: ["Agent", "You · review"],
      rootCounts: { open: 1, in_progress: 0, resolved: 1, closed: 0 },
      commentCount: 3,
    } });
  });
  it("rejects invalid timestamps", () => {
    expect(() => commentActivity([{ page: "example", createdAt: "invalid" }])).toThrow("timestamp");
  });
  it.each([null, [], { example: { commented: "yesterday" } }])("rejects malformed activity responses", (value) => {
    expect(() => assertFeedbackActivity(value)).toThrow("activity");
  });
});
