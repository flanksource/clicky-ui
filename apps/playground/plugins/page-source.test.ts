import { describe, expect, it } from "vitest";

import { rewritePageTitle } from "./page-source";

describe("rewritePageTitle", () => {
  it("replaces only a string-literal meta title", () => {
    const source = `export const meta = {
  title: "Old title",
  description: "Keep me",
};

export default function Example() {
  return <h1>Old title</h1>;
}
`;

    expect(rewritePageTitle(source, "Renamed page")).toBe(`export const meta = {
  title: "Renamed page",
  description: "Keep me",
};

export default function Example() {
  return <h1>Old title</h1>;
}
`);
  });

  it("rejects derived metadata instead of guessing which source owns the title", () => {
    const source = `export const meta = pageMetadata("examples/old-page");\n`;

    expect(() => rewritePageTitle(source, "Renamed page")).toThrow(
      /simple string-literal meta\.title/,
    );
  });

  it("rejects an empty title", () => {
    expect(() =>
      rewritePageTitle('export const meta = { title: "Old" };\n', "   "),
    ).toThrow(/non-empty page title/);
  });
});
