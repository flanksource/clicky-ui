import { describe, expect, it } from "vitest";
import { EXAMPLE_SESSIONS } from ".";

describe("example sessions", () => {
  it("includes sanitized recent Codex and Claude session shapes", () => {
    expect(EXAMPLE_SESSIONS.map((session) => session.source)).toEqual([
      "codex",
      "claude",
    ]);

    for (const session of EXAMPLE_SESSIONS) {
      expect(session).toMatchObject({
        provider: expect.any(String),
        modelMode: expect.any(String),
        model: expect.any(String),
        reasoningEffort: expect.any(String),
        usage: { totalTokens: expect.any(Number) },
        cost: { totalTokens: expect.any(Number) },
      });
      expect(session.turns?.length).toBeGreaterThanOrEqual(3);
      expect(session.messages?.length).toBeGreaterThanOrEqual(6);
    }

    const serialized = JSON.stringify(EXAMPLE_SESSIONS);
    expect(serialized).not.toContain("/Users/");
    expect(serialized).not.toContain("moshe");
    expect(serialized).not.toMatch(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
    );
  });
});
