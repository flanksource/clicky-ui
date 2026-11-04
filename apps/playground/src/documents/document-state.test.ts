import { describe, expect, it } from "vitest";
import { reconcileDocument } from "./document-state";

describe("document reconciliation", () => {
  const base = {
    root: "/repo",
    path: "guide.md",
    source: "original",
    revision: "old",
  };
  const incoming = { ...base, source: "external", revision: "new" };
  it("updates a clean buffer to the latest disk revision", () => {
    expect(
      reconcileDocument(
        { base, disk: base, draft: base.source, conflict: false },
        incoming,
      ),
    ).toEqual({
      base: incoming,
      disk: incoming,
      draft: incoming.source,
      conflict: false,
    });
  });
  it("retains an unsaved draft and its save precondition when disk changes", () => {
    expect(
      reconcileDocument(
        { base, disk: base, draft: "my draft", conflict: false },
        incoming,
      ),
    ).toEqual({ base, disk: incoming, draft: "my draft", conflict: true });
  });
});
