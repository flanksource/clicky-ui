import { describe, expect, it } from "vitest";

import { guidanceToMarkdown } from "./guidance";

describe("guidanceToMarkdown", () => {
  it("serializes every extracted guidance kind as plain Markdown", () => {
    expect(
      guidanceToMarkdown("Page anatomy", {
        blocks: [
          { kind: "section", title: "Regions", description: "Where controls belong" },
          { kind: "practice", tone: "do", title: "Keep scope visible", body: "Use the route." },
          { kind: "annotation", tone: "rule", title: "Rail owns location", body: "Keep state out." },
          { kind: "variant", title: "Compact", verdict: "Fast to scan", selected: true },
          { kind: "callout", tone: "important", title: "Required", body: "Choose an owner." },
          { kind: "list", title: "Avoid when", tone: "avoid", items: ["The list is tiny"] },
          { kind: "table", headers: ["Slot", "Holds"], rows: [["Search", "Global find"]] },
        ],
      }),
    ).toBe(`# Page anatomy

## Regions

Where controls belong

### Do: Keep scope visible

Use the route.

### Rule: Rail owns location

Keep state out.

### Compact (selected)

Fast to scan

> **Important — Required:** Choose an owner.

### Avoid when

- The list is tiny

| Slot | Holds |
| --- | --- |
| Search | Global find |
`);
  });

  it("states explicitly when a page contains no extractable guidance", () => {
    expect(guidanceToMarkdown("Blank", { blocks: [] })).toContain(
      "No AST-extractable guidance was found for this page.",
    );
  });
});
