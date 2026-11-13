import { describe, expect, it } from "vitest";
import { vocabularyHref, vocabularyReferences, vocabularyChoices } from "./comment-vocabulary";

const items = [{ catalog: "example", type: "shape", id: "shape/diamond", label: "Diamond", description: "A decision", references: ["src/shapes.ts"] }];
describe("vocabulary references", () => {
  it("discovers an additional type from data", () => {
    expect(vocabularyChoices(items, "").map(c => c.label)).toEqual(["shape"]);
    expect(vocabularyChoices(items, "shape/").map(c => c.label)).toEqual(["Diamond"]);
  });
  it("resolves and deduplicates selected links, excluding code", () => {
    const link = `[Diamond](${vocabularyHref(items[0]!)})`;
    expect(vocabularyReferences(`${link} ${link} \`${link}\``, items)).toEqual(items);
    expect(vocabularyReferences(`\`${link}\``, items)).toEqual([]);
  });
  it("rejects unknown item links", () => {
    expect(() => vocabularyReferences("[Missing](/?vocabulary=example%3Amissing)", items)).toThrow("Unknown vocabulary");
  });
});
