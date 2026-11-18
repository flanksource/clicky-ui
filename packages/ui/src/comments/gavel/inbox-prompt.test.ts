import { describe, expect, it } from "vitest";
import { EMPTY_INBOX_FILTERS, inboxItems, type InboxThread } from "./inbox-model";
import { describeInboxFilters, inboxPrompt } from "./inbox-prompt";

const SCOPE = "gavel://project/demo";
const BASE = "http://127.0.0.1:9092";

function thread(id: string, overrides: Partial<InboxThread> & { uri: string; selector?: unknown }): InboxThread {
  const { uri, selector, ...rest } = overrides;
  return {
    id,
    bodyMarkdown: `please fix ${id}`,
    author: { kind: "user", id: "user:ada", label: "Ada" },
    status: "open",
    phase: "active",
    version: 4,
    createdAt: "2026-11-01T10:00:00Z",
    updatedAt: "2026-11-01T10:00:00Z",
    readVersion: 4,
    unread: false,
    target: { uri, scopeUri: SCOPE, kind: "file", ...(selector === undefined ? {} : { selector }) },
    ...rest,
  };
}

const items = inboxItems([
  {
    scope: SCOPE,
    project: "demo",
    threads: [
      thread("t-file", {
        uri: `${SCOPE}/files/guide/intro.md`,
        selector: { kind: "code-range", patch: { startLine: 7 } },
        unread: true,
        anchor: { state: "matched", startLine: 12, endLine: 14 },
        messages: [{ id: "m1", bodyMarkdown: "on it", author: { kind: "agent", id: "agent:claude", label: "Claude" }, createdAt: "2026-11-01T11:00:00Z" }],
      }),
      thread("t-page", { uri: `${SCOPE}/pages/${encodeURIComponent("https://example.com/pricing")}`, selector: { kind: "dom" } }),
      thread("t-image", { uri: `${SCOPE}/files/logo.png`, selector: { kind: "region", region: { x: 0.1, y: 0.2, w: 0.3, h: 0.4 } } }),
    ],
  },
]);

const prompt = (target: "LLM" | "Claude" | "Codex" = "Claude", filters = EMPTY_INBOX_FILTERS) => inboxPrompt({ items, scopes: [SCOPE], filters, target, baseUrl: BASE, url: "http://127.0.0.1:9092/comments?status=open" });

describe("inboxPrompt", () => {
  it.each([
    ["LLM", "# Comment inbox for a coding agent"],
    ["Claude", "# Comment inbox for Claude"],
    ["Codex", "# Comment inbox for Codex"],
  ] as const)("addresses %s", (target, heading) => {
    expect(prompt(target).split("\n")[0]).toBe(heading);
  });

  it("names every thread's target, resolved line, region, id and the version an action must carry", () => {
    const text = prompt();
    expect(text).toContain("### guide/intro.md:12-14 (file, demo)");
    expect(text).toContain("### https://example.com/pricing (page, demo)");
    expect(text).toContain("### logo.png (image, demo, region x 0.1 y 0.2 w 0.3 h 0.4)");
    expect(text).toContain("- `t-file` version 4, open/active, by Ada, unread");
    expect(text).toContain("> please fix t-file");
    expect(text).toContain("  - Claude: on it");
  });

  it("gives the acknowledge, reply and resolve routes for the thread's own scope", () => {
    const text = prompt();
    expect(text).toContain(`POST ${BASE}/api/v1/comments/{id}/acknowledge`);
    expect(text).toContain(`POST ${BASE}/api/v1/comments/{id}/reply`);
    expect(text).toContain(`POST ${BASE}/api/v1/comments/{id}/resolve`);
    expect(text).toContain('{"expectedVersion":<version>');
    expect(text).toContain(`GET ${BASE}/api/v1/comments?scope=${encodeURIComponent(SCOPE)}&limit=200`);
  });

  it("repeats the server-side filters in the read URL and states the rest in words", () => {
    const text = prompt("Claude", { ...EMPTY_INBOX_FILTERS, phase: "active", unread: true, status: "open", q: "pricing" });
    expect(text).toContain(`GET ${BASE}/api/v1/comments?scope=${encodeURIComponent(SCOPE)}&phase=active&unread=true&limit=200`);
    expect(text).toContain("Filters: status open, phase active, unread only, search “pricing”");
  });

  it("states that an empty selection is a queue to keep watching, not an error", () => {
    const empty = inboxPrompt({ items: [], scopes: [SCOPE], filters: EMPTY_INBOX_FILTERS, target: "Codex", baseUrl: BASE, url: BASE });
    expect(empty).toContain("Matching threads: 0");
    expect(empty).toContain("No threads match right now");
  });

  it("refuses to build a prompt with no API base to point the agent at", () => {
    expect(() => inboxPrompt({ items, scopes: [SCOPE], filters: EMPTY_INBOX_FILTERS, target: "LLM", baseUrl: "", url: BASE })).toThrow(/baseUrl/);
  });
});

describe("describeInboxFilters", () => {
  it("says none when nothing is filtered", () => {
    expect(describeInboxFilters(EMPTY_INBOX_FILTERS)).toBe("none");
  });
});
