import { describe, expect, it } from "vitest";
import { AVATAR_PALETTE, fnv1a32, paletteClass } from "./palette";

describe("palette", () => {
  it("fnv1a32 is deterministic", () => {
    expect(fnv1a32("alice")).toBe(fnv1a32("alice"));
    expect(fnv1a32("alice")).not.toBe(fnv1a32("bob"));
  });

  it("paletteClass returns a member of AVATAR_PALETTE", () => {
    const cls = paletteClass("some-key");
    expect(AVATAR_PALETTE).toContain(cls);
  });

  it("paletteClass is stable for the same key", () => {
    expect(paletteClass("flanksource/clicky-ui")).toBe(paletteClass("flanksource/clicky-ui"));
  });
});
