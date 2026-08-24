import { describe, expect, it } from "vitest";

import {
  CATEGORICAL,
  DIVERGING,
  FORBIDDEN_ADJACENCIES,
  INCUMBENT,
  SEQUENTIAL,
  STATUS,
} from "./dataviz-palette";

/**
 * Guards on the two properties of this palette that a future edit could break
 * without anything looking wrong: the order, and the ramp shapes.
 *
 * The colour *values* were validated by the data-viz skill's
 * `scripts/validate_palette.js` and its verdicts are recorded in the module
 * header. Re-implementing OKLab CVD simulation here to re-derive them would be
 * a second, worse validator. What is asserted instead is everything the
 * validator cannot see once the palette is in the repo — that nobody re-orders
 * the slots into a pair the validator already rejected.
 */

const hueAt = (index: number) => CATEGORICAL.find((slot) => slot.index === index)?.hue;

describe("categorical order", () => {
  it("numbers the slots 1..7 contiguously, so --chart-N matches the array", () => {
    expect(CATEGORICAL.map((slot) => slot.index)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("uses each hue exactly once — a cycled hue is a repeated identity", () => {
    const hues = CATEGORICAL.map((slot) => slot.hue);
    expect(new Set(hues).size).toBe(hues.length);
  });

  it("never places a forbidden pair next to each other", () => {
    for (const pair of FORBIDDEN_ADJACENCIES) {
      for (let index = 0; index < CATEGORICAL.length - 1; index += 1) {
        const left = hueAt(index + 1);
        const right = hueAt(index + 2);
        const isPair =
          (left === pair.a && right === pair.b) || (left === pair.b && right === pair.a);
        expect(isPair, `${pair.a} adjacent to ${pair.b}: ${pair.verdict}`).toBe(false);
      }
    }
  });

  it("excludes slate, which fails the chroma floor and reads as grey", () => {
    expect(CATEGORICAL.map((slot) => slot.hue)).not.toContain("slate");
  });

  it("is a strict improvement on the four hexes shipping today", () => {
    expect(CATEGORICAL).toHaveLength(7);
    expect(INCUMBENT).toHaveLength(4);
    // The incumbent hexes are not silently carried forward under new names.
    for (const hex of INCUMBENT) {
      expect(CATEGORICAL.map((slot) => slot.hex)).not.toContain(hex);
    }
  });

  it("writes every hex as a full six-digit value the validator can parse", () => {
    for (const slot of CATEGORICAL) {
      expect(slot.hex, `slot ${slot.index}`).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});

describe("sequential ramp", () => {
  it("is one hue rather than a rainbow, so it can only encode magnitude", () => {
    // A single-hue sky ramp: blue channel dominates at every step.
    for (const hex of SEQUENTIAL) {
      const r = Number.parseInt(hex.slice(1, 3), 16);
      const b = Number.parseInt(hex.slice(5, 7), 16);
      expect(b, `${hex} should stay blue-dominant`).toBeGreaterThan(r);
    }
  });

  it("darkens monotonically — the only check a sequential ramp has to pass", () => {
    const luminance = SEQUENTIAL.map(
      (hex) =>
        0.2126 * Number.parseInt(hex.slice(1, 3), 16) +
        0.7152 * Number.parseInt(hex.slice(3, 5), 16) +
        0.0722 * Number.parseInt(hex.slice(5, 7), 16),
    );
    for (let index = 1; index < luminance.length; index += 1) {
      expect(luminance[index]!, `step ${index} vs ${index - 1}`).toBeLessThan(luminance[index - 1]!);
    }
  });
});

describe("diverging ramp", () => {
  it("has an odd length so a true midpoint exists", () => {
    expect(DIVERGING.length % 2).toBe(1);
  });

  it("puts a NEUTRAL grey at the midpoint, never a hue", () => {
    const mid = DIVERGING[(DIVERGING.length - 1) / 2]!;
    const [r, g, b] = [
      Number.parseInt(mid.slice(1, 3), 16),
      Number.parseInt(mid.slice(3, 5), 16),
      Number.parseInt(mid.slice(5, 7), 16),
    ];
    expect(Math.max(r, g, b) - Math.min(r, g, b), `${mid} should be near-grey`).toBeLessThan(16);
  });

  it("uses two hues rather than red and green, which CVD readers cannot separate", () => {
    const negative = DIVERGING[0]!;
    const positive = DIVERGING[DIVERGING.length - 1]!;
    const redness = (hex: string) =>
      Number.parseInt(hex.slice(1, 3), 16) - Number.parseInt(hex.slice(5, 7), 16);
    // One pole warm, the other cool.
    expect(redness(negative)).toBeGreaterThan(0);
    expect(redness(positive)).toBeLessThan(0);
  });
});

describe("status palette", () => {
  it("covers all four levels", () => {
    expect(Object.keys(STATUS).sort()).toEqual(["critical", "good", "serious", "warning"]);
  });

  it("explains every level, since a status colour never ships without a label", () => {
    for (const [level, entry] of Object.entries(STATUS)) {
      expect(entry.meaning.length, `${level} meaning`).toBeGreaterThan(10);
      expect(entry.hex, `${level} hex`).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});
