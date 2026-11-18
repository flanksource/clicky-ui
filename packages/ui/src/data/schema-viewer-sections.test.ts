import { describe, expect, it } from "vitest";
import { selectSchemaSections } from "./schema-viewer-sections";

const FIELDS = ["timeout", "script", "exec", "name"].map((label) => ({ key: `root/${label}`, label }));

describe("schema sections", () => {
  it("uses selectors and explicit ordering while preserving unselected fields", () => {
    const sections = selectSchemaSections(FIELDS, [
      { id: "kind", title: "Kind fields", select: ["script", "exec"], order: ["exec"] },
      { id: "global", title: "Global fields", select: (field) => field.label === "name" },
    ]);
    expect(sections.map(({ title, nodes }) => ({ title, fields: nodes.map((node) => node.label) }))).toEqual([
      { title: "Kind fields", fields: ["exec", "script"] },
      { title: "Global fields", fields: ["name"] },
      { title: "Other fields", fields: ["timeout"] },
    ]);
  });

  it("selects remaining fields only once with a wildcard and omits empty sections", () => {
    const sections = selectSchemaSections(FIELDS, [
      { id: "global", title: "Global fields", select: ["root/timeout"] },
      { id: "kind", title: "Kind fields", select: "*" },
      { id: "empty", title: "Empty fields", select: "*" },
    ]);
    expect(sections.map(({ id, nodes }) => ({ id, fields: nodes.map((node) => node.label) }))).toEqual([
      { id: "global", fields: ["timeout"] },
      { id: "kind", fields: ["script", "exec", "name"] },
    ]);
  });

  it("rejects duplicate section identifiers", () => {
    expect(() => selectSchemaSections(FIELDS, [
      { id: "fields", title: "First", select: "*" },
      { id: "fields", title: "Second", select: "*" },
    ])).toThrow("section IDs must be nonempty and unique");
  });
});
