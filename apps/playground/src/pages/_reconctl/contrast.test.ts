import { describe, expect, it } from "vitest";

import { contrastRatio, relativeLuminance, wcagGrade } from "./contrast";

/**
 * Oracles are the spec's own published values, not this module's output.
 *
 * `#767676` is the canonical example of the smallest grey that still clears AA
 * on white (4.54:1); if the transfer curve is wrong — the common slip is using
 * 0.03928 as the threshold with the wrong divisor — that pair drifts before
 * black-on-white does, because 21:1 survives almost any error in the curve.
 */
const BLACK = "#000000";
const WHITE = "#ffffff";
const AA_GREY_ON_WHITE = "#767676";

describe("contrastRatio", () => {
  it("returns the spec maximum of 21 for black against white", () => {
    expect(contrastRatio(BLACK, WHITE)).toBeCloseTo(21, 5);
  });

  it("is symmetric in its arguments", () => {
    expect(contrastRatio(BLACK, WHITE)).toBeCloseTo(contrastRatio(WHITE, BLACK), 10);
  });

  it("returns 1 for a colour against itself", () => {
    expect(contrastRatio(AA_GREY_ON_WHITE, AA_GREY_ON_WHITE)).toBeCloseTo(1, 10);
  });

  it("scores the canonical AA boundary grey at 4.54 on white", () => {
    expect(contrastRatio(AA_GREY_ON_WHITE, WHITE)).toBeCloseTo(4.54, 2);
  });

  it("expands #rgb shorthand to the same value as #rrggbb", () => {
    expect(contrastRatio("#fff", BLACK)).toBeCloseTo(contrastRatio(WHITE, BLACK), 10);
  });

  it("throws on a value that is not a hex colour", () => {
    expect(() => contrastRatio("rgb(0,0,0)", WHITE)).toThrow(/not a #rgb/);
  });
});

describe("relativeLuminance", () => {
  it("puts white at 1 and black at 0", () => {
    expect(relativeLuminance(WHITE)).toBeCloseTo(1, 10);
    expect(relativeLuminance(BLACK)).toBeCloseTo(0, 10);
  });
});

describe("wcagGrade", () => {
  it.each([
    [21, "AAA"],
    [7, "AAA"],
    [6.99, "AA"],
    [4.5, "AA"],
    [4.49, "AA-large"],
    [3, "AA-large"],
    [2.99, "fail"],
    [1, "fail"],
  ])("grades %s as %s", (ratio, grade) => {
    expect(wcagGrade(ratio)).toBe(grade);
  });
});
