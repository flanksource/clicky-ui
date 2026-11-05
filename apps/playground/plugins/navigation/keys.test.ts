// @vitest-environment node
import { describe, expect, it } from "vitest";
import { NavigationRequestError, parseNodeKey, repositoryKey } from "./keys";

const repositoryId = "11111111-1111-1111-1111-111111111111";

describe("navigation node keys", () => {
  it.each([
    ["", { kind: "root" }],
    ["external", { kind: "external" }],
    ["page:gtm/plans", { kind: "page-folder", folder: "gtm/plans" }],
    [`repo:${repositoryId}:.:.`, { kind: "repository", repositoryId, folder: ".", path: "." }],
    [`repo:${repositoryId}:docs:docs/a b`, { kind: "repository", repositoryId, folder: "docs", path: "docs/a b" }],
  ] as const)("parses %j", (key, expected) => {
    expect(parseNodeKey(key)).toEqual(expected);
  });

  it("round-trips repository paths containing colons and percent signs", () => {
    const node = { repositoryId, folder: "notes:2026", path: "notes:2026/100%.md" };
    expect(parseNodeKey(repositoryKey(node))).toEqual({ kind: "repository", ...node });
  });

  it.each(["page-item:solo", `doc:document:${repositoryId}/a.md`, "external:11111111-1111-1111-1111-111111111111", "nonsense", "repo:bad", "page:"])(
    "rejects %j as a request error",
    (key) => {
      expect(() => parseNodeKey(key)).toThrow(NavigationRequestError);
    },
  );
});
