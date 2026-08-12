import { describe, expect, it } from "vitest";
import {
  stripLeadingSlashes,
  stripSurroundingDashes,
  stripTrailingSlashes,
} from "./string";

describe("slash stripping", () => {
  it("strips long leading and trailing slash runs", () => {
    const slashes = "/".repeat(50_000);
    expect(stripLeadingSlashes(`${slashes}path`)).toBe("path");
    expect(stripTrailingSlashes(`path${slashes}`)).toBe("path");
    expect(stripLeadingSlashes(slashes)).toBe("");
    expect(stripTrailingSlashes(slashes)).toBe("");
  });
});

describe("dash stripping", () => {
  it("strips long leading and trailing dash runs", () => {
    const dashes = "-".repeat(50_000);
    expect(stripSurroundingDashes(`${dashes}slug${dashes}`)).toBe("slug");
    expect(stripSurroundingDashes(dashes)).toBe("");
    expect(stripSurroundingDashes("a-b")).toBe("a-b");
  });
});
