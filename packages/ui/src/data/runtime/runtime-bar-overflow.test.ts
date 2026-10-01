import { describe, expect, it } from "vitest";
import { runtimeBarInlineCount } from "./use-runtime-bar-overflow";

describe("runtime bar overflow", () => {
  const widths = { identity: 200, trigger: 32, fields: [80, 60, 90], gap: 0 };
  it.each([
    { width: 200, expected: 0 },
    { width: 311, expected: 0 },
    { width: 312, expected: 1 },
    { width: 372, expected: 2 },
    { width: 462, expected: 3 },
  ])(
    "fits $expected settings into $width pixels while reserving the menu",
    ({ width, expected }) => {
      expect(runtimeBarInlineCount({ ...widths, width })).toBe(expected);
    },
  );

  it("accounts for spacing between combo controls", () => {
    expect(runtimeBarInlineCount({ ...widths, width: 372, gap: 4 })).toBe(1);
  });
});
