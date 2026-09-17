import { describe, expect, it } from "vitest";

import { rewritePageTitle } from "./page-source";

describe("rewritePageTitle", () => {
  it("renames a literal title in metadata checked with satisfies", () => {
    const source = `export const meta = {
  title: "Icons + palette",
  description: "Keep this description",
} satisfies PageMeta;`;

    expect(rewritePageTitle(source, "Tracing palette")).toBe(`export const meta = {
  title: "Tracing palette",
  description: "Keep this description",
} satisfies PageMeta;`);
  });
});
