import { expect, it } from "vitest";
import { guidanceToMarkdown } from "./guidance";

it("exports vocabulary instructions before its item list and source references", () => {
  expect(guidanceToMarkdown("Shapes", { blocks: [{ kind: "vocabulary", alias: "shapes", instructions: "Read **shapes** as geometry.", items: [{ catalog: "shapes", type: "shape", id: "shape/decision", label: "Decision", description: "A branching decision", references: ["shapes/index.tsx"] }] }] })).toBe("# Shapes\n\n## shapes vocabulary\n\nRead **shapes** as geometry.\n\n- shapes:shape/decision: A branching decision\n  - shapes/index.tsx\n");
});
