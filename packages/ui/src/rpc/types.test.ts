import { describe, expect, it } from "vitest";
import { parameterPlaceholder, type OpenAPIParameter } from "./types";

function param(overrides: Partial<OpenAPIParameter>): OpenAPIParameter {
  return { name: "owner", in: "query", ...overrides };
}

describe("parameterPlaceholder", () => {
  it("returns the explicit placeholder field", () => {
    expect(parameterPlaceholder(param({ placeholder: "team name…" }))).toBe("team name…");
  });

  it("prefers x-clicky-placeholder over placeholder", () => {
    const p = param({ placeholder: "fallback", "x-clicky-placeholder": "owning team" });
    expect(parameterPlaceholder(p)).toBe("owning team");
  });

  it("never derives a placeholder from description", () => {
    const p = param({ description: "The team that owns this resource." });
    expect(parameterPlaceholder(p)).toBeUndefined();
  });

  it("returns undefined when no placeholder is declared", () => {
    expect(parameterPlaceholder(param({}))).toBeUndefined();
  });
});
