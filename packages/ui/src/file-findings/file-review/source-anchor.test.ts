import { describe, expect, it } from "vitest";
import { describeSource, locateSource, parseSourceAnchor, resolveSource, sourceAnchor } from "./source-anchor";

const SOURCE = [
  "func retry(n int) error {", // 1
  "\tfor i := 0; i < n; i++ {", // 2
  "\t\tif err := call(); err == nil {", // 3
  "\t\t\treturn nil", // 4
  "\t\t}", // 5
  "\t}", // 6
  "\treturn errors.New(\"gave up\")", // 7
  "}", // 8
].join("\n");

describe("source anchors", () => {
  it("round-trips a locator through its anchor string", () => {
    const locator = { line: 3, prefix: "if err := ", quote: "call()", suffix: "; err == nil" };
    expect(parseSourceAnchor(sourceAnchor(locator))).toEqual(locator);
  });

  it.each([
    ["q:[]", /not a source anchor/],
    ['s:[0,"","x",""]', /malformed/],
    ['s:[2,"",3,""]', /malformed/],
  ])("rejects %s", (anchor, error) => {
    expect(() => parseSourceAnchor(anchor)).toThrow(error);
  });

  it("finds a single-line quote again after lines are added above it", () => {
    const locator = locateSource(SOURCE, { line: 3, column: 12 }, { line: 3, column: 18 })!;
    expect(locator.quote).toBe("call()");
    const edited = `// Package retry.\n\n${SOURCE}`;
    expect(resolveSource(edited, locator)).toEqual([{ line: 5, start: 12, end: 18 }]);
  });

  it("cuts a quote spanning lines into one span per line", () => {
    const locator = locateSource(SOURCE, { line: 4, column: 3 }, { line: 5, column: 3 })!;
    expect({ quote: locator.quote, spans: resolveSource(SOURCE, locator) }).toEqual({
      quote: "return nil\n\t\t}",
      spans: [
        { line: 4, start: 3, end: 13 },
        { line: 5, start: 0, end: 3 },
      ],
    });
  });

  it("picks the repeat nearest the original line when the context is the same", () => {
    const repeated = ["x := 1", "x := 1", "y := 2", "x := 1"].join("\n");
    const quote = { prefix: "", quote: "x", suffix: " := 1" };
    expect(resolveSource(repeated, { ...quote, line: 4 })).toEqual([{ line: 4, start: 0, end: 1 }]);
    expect(resolveSource(repeated, { ...quote, line: 1 })).toEqual([{ line: 1, start: 0, end: 1 }]);
  });

  it("finds nothing once the quoted text changed", () => {
    const locator = locateSource(SOURCE, { line: 7, column: 1 }, { line: 7, column: 7 })!;
    expect(resolveSource(SOURCE.replace("return errors", "return fmt"), locator)).toEqual([]);
  });

  it("offers no locator for a whitespace-only selection, and clamps a column past the line end", () => {
    expect(locateSource(SOURCE, { line: 2, column: 0 }, { line: 2, column: 1 })).toBeNull();
    expect(locateSource(SOURCE, { line: 8, column: 0 }, { line: 8, column: 9 })?.quote).toBe("}");
  });

  it("labels a thread with its line and a shortened quote", () => {
    expect(describeSource({ line: 4, prefix: "", quote: "return nil\n\t\t}", suffix: "" })).toBe("Line 4 · “return nil }”");
  });
});
