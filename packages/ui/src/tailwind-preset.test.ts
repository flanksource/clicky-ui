import { describe, expect, it } from "vitest";
import preset from "./tailwind-preset";

describe("tailwind preset layout tokens", () => {
  it("mirrors the wide viewport, container, and max-width scales", () => {
    expect(preset.theme?.extend).toMatchObject({
      screens: { "3xl": "1920px" },
      containers: { "8xl": "1536px", "9xl": "1920px" },
      maxWidth: { "8xl": "1536px", "9xl": "1920px" },
    });
  });
});
