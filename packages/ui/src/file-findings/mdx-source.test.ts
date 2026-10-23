import { describe, expect, it } from "vitest";
import { blankMdxPreamble } from "./mdx-source";

describe("blankMdxPreamble", () => {
  it("blanks frontmatter and top-level imports and exports while keeping every line in place", () => {
    const source = [
      "---", // 1
      "title: Guide", // 2
      "---", // 3
      "", // 4
      'import { Callout } from "./Callout"', // 5
      "import Foo from './Foo'", // 6
      "", // 7
      "# Heading", // 8
      "", // 9
      'export const meta = { title: "Guide" }', // 10
      "", // 11
      "Body text.", // 12
    ].join("\n");

    expect(blankMdxPreamble(source)).toBe(["", "", "", "", "", "", "", "# Heading", "", "", "", "Body text."].join("\n"));
  });

  it("blanks every line of an import or export that spans several lines", () => {
    const source = [
      "import {", // 1
      "  A,", // 2
      "  B,", // 3
      '} from "./ab"', // 4
      "export const items = [", // 5
      "  1,", // 6
      "]", // 7
      "# Heading", // 8
    ].join("\n");

    expect(blankMdxPreamble(source)).toBe(["", "", "", "", "", "", "", "# Heading"].join("\n"));
  });

  it("leaves JSX, prose that mentions import, and indented lines alone", () => {
    const source = ["<Callout>", "  import this", "</Callout>", "We import things.", "exports are fine"].join("\n");

    expect(blankMdxPreamble(source)).toBe(source);
  });

  it("does not touch import or export lines inside a fenced code block", () => {
    const source = ["```ts", 'import x from "y"', "export default x", "```", "after"].join("\n");

    expect(blankMdxPreamble(source)).toBe(source);
  });

  it("only treats --- as frontmatter on the first line", () => {
    const source = ["# Heading", "---", "not: frontmatter", "---"].join("\n");

    expect(blankMdxPreamble(source)).toBe(source);
  });

  it("keeps the line count of every input", () => {
    for (const source of ["", "\n", "import a from 'a'\n", "---\na: 1\n---\n\ntext\n"]) {
      expect(blankMdxPreamble(source).split("\n")).toHaveLength(source.split("\n").length);
    }
  });
});
