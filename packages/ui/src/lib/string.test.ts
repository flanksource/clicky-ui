import { describe, expect, it } from "vitest";
import {
  stripHtmlTags,
  stripLeadingSlashes,
  stripSurroundingChars,
  stripTrailingNewlines,
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

describe("stripSurroundingChars", () => {
  it("strips long leading and trailing runs of any listed character", () => {
    const dashes = "-".repeat(50_000);
    expect(stripSurroundingChars(`${dashes}slug${dashes}`, "-")).toBe("slug");
    expect(stripSurroundingChars(dashes, "-")).toBe("");
    expect(stripSurroundingChars("a-b", "-")).toBe("a-b");
    expect(stripSurroundingChars("._-name_.", "._-")).toBe("name");
  });

  it("stays linear when only one end has a run", () => {
    const start = performance.now();
    expect(stripSurroundingChars(`x${"-".repeat(50_000)}x`, "-")).toHaveLength(50_002);
    expect(performance.now() - start).toBeLessThan(1_000);
  });
});

describe("stripTrailingNewlines", () => {
  it("strips a long trailing newline run without touching interior ones", () => {
    expect(stripTrailingNewlines(`a\nb${"\n".repeat(50_000)}`)).toBe("a\nb");
    expect(stripTrailingNewlines("\n\n")).toBe("");
    expect(stripTrailingNewlines("a")).toBe("a");
  });
});

describe("stripHtmlTags", () => {
  it("replaces each tag with the replacement and keeps the text between", () => {
    expect(stripHtmlTags("<p>hi <b>there</b></p>")).toBe(" hi  there  ");
    expect(stripHtmlTags("<p>hi</p>", "")).toBe("hi");
    expect(stripHtmlTags("a < b")).toBe("a < b");
    expect(stripHtmlTags("2 <> 1")).toBe("2 <> 1");
    expect(stripHtmlTags("<unclosed")).toBe("<unclosed");
  });

  it("stays linear on a long run of unterminated tag openers", () => {
    const start = performance.now();
    expect(stripHtmlTags("<".repeat(50_000))).toBe("<".repeat(50_000));
    expect(performance.now() - start).toBeLessThan(1_000);
  });
});
