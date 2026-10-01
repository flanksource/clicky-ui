import { describe, expect, it } from "vitest";
import { edgeLabelWidth, edgeName, type GraphDiagramEdge } from "./graph-diagram-model";

const ends = { id: "e", from: "a", to: "b" } satisfies GraphDiagramEdge;
const ICON = "icon";

describe("edgeLabelWidth", () => {
  // 5.4px per character, 14px of padding and border, a 14px icon, and a 4px gap between icon and text.
  it.each<[string, Partial<GraphDiagramEdge>, number]>([
    ["text only", { label: "limit > 0" }, 9 * 5.4 + 14],
    ["icon and text", { label: "limit > 0", icon: ICON }, 9 * 5.4 + 14 + 14 + 4],
    ["icon only", { icon: ICON }, 14 + 14],
  ])("estimates a pill with %s", (_, edge, expected) => {
    expect(edgeLabelWidth({ ...ends, ...edge })).toBeCloseTo(expected, 6);
  });
});

describe("edgeName", () => {
  const names = { a: "Run", b: "Load" };

  it.each<[string, Partial<GraphDiagramEdge>, string]>([
    ["neither label nor icon label", {}, "Run to Load"],
    ["a label", { label: "limit > 0" }, "Run to Load: limit > 0"],
    ["an icon label", { icon: ICON, iconLabel: "via interface" }, "Run to Load: via interface"],
    ["both", { label: "limit > 0", icon: ICON, iconLabel: "via interface" }, "Run to Load: via interface limit > 0"],
  ])("names an edge with %s", (_, edge, expected) => {
    expect(edgeName({ ...ends, ...edge }, names)).toBe(expected);
  });
});
