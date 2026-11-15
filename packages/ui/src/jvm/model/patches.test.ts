import { describe, expect, it } from "vitest";
import type { JvmPatch } from "../protocol/types";
import { canRestorePatch, formatLeaseRemaining, isVirtualLoader, leaseRemainingMs, patchKey, patchRowState, summarisePatches } from "./patches";

const NOW = 1_700_000_000_000;
const patched: JvmPatch = { class: "com.example.A", loader: "app", patched: true, leaseExpiresAt: NOW + 90_000 };
const unleased: JvmPatch = { class: "com.example.B", loader: "app", patched: true };
const stale: JvmPatch = { class: "com.example.C", loader: "app", patched: false, error: "class is no longer loaded" };
const original: JvmPatch = { class: "com.example.D", loader: "app", patched: false };

describe("patchRowState", () => {
  it.each([
    [patched, "patched"],
    [unleased, "patched"],
    [stale, "stale"],
    [original, "original"],
    [{ ...patched, error: "gone" }, "stale"],
  ] as const)("%j is %s", (patch, expected) => {
    expect(patchRowState(patch)).toBe(expected);
  });
});

describe("isVirtualLoader / canRestorePatch", () => {
  it("treats ~-prefixed loader ids as virtual groups", () => {
    expect(isVirtualLoader("~janino")).toBe(true);
    expect(isVirtualLoader("  ~janino")).toBe(true);
    expect(isVirtualLoader("app")).toBe(false);
  });

  it("only offers restore for patched rows in a real loader", () => {
    expect(canRestorePatch(patched)).toBe(true);
    expect(canRestorePatch(unleased)).toBe(true);
    expect(canRestorePatch(stale)).toBe(false);
    expect(canRestorePatch(original)).toBe(false);
    expect(canRestorePatch({ ...patched, loader: "~janino" })).toBe(false);
  });
});

describe("leaseRemainingMs", () => {
  it("counts down to the expiry", () => {
    expect(leaseRemainingMs(patched, NOW)).toBe(90_000);
  });

  it("clamps an expired lease at 0, which is not the same as no lease", () => {
    expect(leaseRemainingMs({ ...patched, leaseExpiresAt: NOW - 5 }, NOW)).toBe(0);
  });

  it.each([[undefined], [null]])("returns null when leaseExpiresAt is %s", (leaseExpiresAt) => {
    expect(leaseRemainingMs({ ...unleased, leaseExpiresAt }, NOW)).toBeNull();
  });
});

describe("formatLeaseRemaining", () => {
  it.each([
    [1, "1s"],
    [45_000, "45s"],
    [45_001, "46s"],
    [60_000, "1m 0s"],
    [125_000, "2m 5s"],
  ])("%d ms is %s", (ms, expected) => {
    expect(formatLeaseRemaining(ms)).toBe(expected);
  });
});

describe("summarisePatches", () => {
  it("counts patched, stale and unleased rows", () => {
    expect(summarisePatches([patched, unleased, stale, original])).toEqual({ patched: 2, stale: 1, unleased: 1 });
  });

  it("is empty for an empty register", () => {
    expect(summarisePatches([])).toEqual({ patched: 0, stale: 0, unleased: 0 });
  });
});

describe("patchKey", () => {
  it("distinguishes the same class in two loaders", () => {
    expect(patchKey(patched)).not.toBe(patchKey({ ...patched, loader: "other" }));
  });
});
