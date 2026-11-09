import { describe, expect, it } from "vitest";
import {
  changeStructuredDocument,
  documentParts,
  structuredDocument,
} from "./document-source";

describe("document source", () => {
  it("retains nested comments when editing a nested YAML field", () => {
    const source =
      "settings:\n  # preserve nested documentation\n  name: initial\n  unknown: retained\n";
    expect(
      changeStructuredDocument(source, "config.yaml", {
        settings: { name: "edited", unknown: "retained" },
      }),
    ).toContain("# preserve nested documentation");
  });
  it("keeps Markdown body and unknown YAML fields while changing frontmatter", () => {
    const source =
      "---\n# description\nname: initial\nunknown: retained\n---\n\nimport Widget from './Widget'\n\n<Widget />\n";
    const next = changeStructuredDocument(source, "page.mdx", {
      name: "edited",
      unknown: "retained",
    });
    expect(next).toContain("# description");
    expect(documentParts(next, "page.mdx").suffix).toBe(
      documentParts(source, "page.mdx").suffix,
    );
    expect(structuredDocument(next, "page.mdx").value).toEqual({
      name: "edited",
      unknown: "retained",
    });
  });
  it("does not normalize unchanged JSON", () => {
    const source = '{ "name" : "initial", "unknown":42 }';
    expect(
      changeStructuredDocument(source, "config.json", {
        name: "initial",
        unknown: 42,
      }),
    ).toBe(source);
    expect(
      changeStructuredDocument(source, "config.json", {
        name: "edited",
        unknown: 42,
      }),
    ).toContain('"unknown":42');
  });
  it("rejects broken frontmatter", () => {
    expect(() => structuredDocument("---\nname: [\n", "page.md")).toThrow();
  });
  it("reads aliases without rewriting unchanged YAML", () => {
    const source =
      "questions:\n  - &shared\n    question: Initial question\nreused: [*shared]\n";
    const value = {
      questions: [{ question: "Initial question" }],
      reused: [{ question: "Initial question" }],
    };
    expect(structuredDocument(source, "config.yaml").value).toEqual(value);
    expect(changeStructuredDocument(source, "config.yaml", value)).toBe(source);
  });
  it("preserves anchors and linked aliases when editing an anchored array item", () => {
    const source =
      "questions:\n  - &shared\n    # Keep this documentation\n    question: Initial question\nreused: [*shared]\n";
    const next = changeStructuredDocument(source, "config.yaml", {
      questions: [{ question: "Edited question" }],
      reused: [{ question: "Initial question" }],
    });
    expect(next).toContain("&shared");
    expect(next).toContain("*shared");
    expect(next).toContain("# Keep this documentation");
    expect(structuredDocument(next, "config.yaml").value).toEqual({
      questions: [{ question: "Edited question" }],
      reused: [{ question: "Edited question" }],
    });
  });
  it("detaches an edited alias occurrence without changing its anchor or other aliases", () => {
    const source =
      "questions:\n  - &shared\n    question: Initial question\nreused: [*shared]\nother: *shared\n";
    const value = {
      questions: [{ question: "Initial question" }],
      reused: [{ question: "Edited question" }],
      other: { question: "Initial question" },
    };
    const next = changeStructuredDocument(source, "config.yaml", value);
    expect(next).toContain("&shared");
    expect(next).toContain("other: *shared");
    expect(structuredDocument(next, "config.yaml").value).toEqual(value);
  });
  it("rejects cyclic aliases before rendering a form", () => {
    expect(() =>
      structuredDocument("node: &node {child: *node}\n", "config.yaml"),
    ).toThrow(/cyclic/i);
  });
  it("retains the YAML library's alias expansion limit", () => {
    const aliases = Array.from({ length: 101 }, () => "*shared").join(", ");
    const source = `shared: &shared [first, second]\nreused: [${aliases}]\n`;
    expect(() => structuredDocument(source, "config.yaml")).toThrow(
      /alias count/i,
    );
  });
  it.each(["config.yaml", "config.json"])(
    "adds and removes multiple array items in %s",
    (path) => {
      const source = path.endsWith("json")
        ? '{"items":["initial"]}'
        : "items: [initial]\n";
      const expanded = { items: ["initial", "second", "third"] };
      const next = changeStructuredDocument(source, path, expanded);
      expect(structuredDocument(next, path).value).toEqual(expanded);
      expect(
        structuredDocument(
          changeStructuredDocument(next, path, { items: [] }),
          path,
        ).value,
      ).toEqual({ items: [] });
    },
  );
});
