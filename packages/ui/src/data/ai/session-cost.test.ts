import { describe, expect, it } from "vitest";
import { compactTokens, costTotal, formatCost, tokenTotal } from "./session-cost";

describe("tokenTotal", () => {
  it("prefers the explicit total when present", () => {
    expect(tokenTotal({ totalTokens: 4200, inputTokens: 1, outputTokens: 1 })).toBe(4200);
  });

  it("sums the per-bucket tokens when no explicit total", () => {
    expect(
      tokenTotal({
        inputTokens: 100,
        outputTokens: 50,
        reasoningTokens: 20,
        cacheReadTokens: 10,
        cacheWriteTokens: 5,
      }),
    ).toBe(185);
  });

  it("is zero for missing usage", () => {
    expect(tokenTotal(undefined)).toBe(0);
  });
});

describe("costTotal", () => {
  it("sums the per-bucket costs", () => {
    expect(
      costTotal({ inputCost: 0.1, outputCost: 0.2, reasoningCost: 0.05, cacheReadCost: 0.01, cacheWriteCost: 0.04 }),
    ).toBeCloseTo(0.4, 10);
  });

  it("is zero for missing cost", () => {
    expect(costTotal(undefined)).toBe(0);
  });
});

describe("compactTokens", () => {
  it("abbreviates thousands and millions, empty for zero", () => {
    expect(compactTokens(0)).toBe("");
    expect(compactTokens(950)).toBe("950");
    expect(compactTokens(12_000)).toBe("12k");
    expect(compactTokens(1_500_000)).toBe("1.5M");
  });
});

describe("formatCost", () => {
  it("uses sub-cent precision only for tiny amounts", () => {
    expect(formatCost(0.0042)).toBe("$0.0042");
    expect(formatCost(1.2)).toBe("$1.20");
  });
});
