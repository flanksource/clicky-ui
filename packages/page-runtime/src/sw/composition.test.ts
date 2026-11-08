import { describe, expect, it } from "vitest";
import type { BarrelIndex } from "../schema.ts";
import { mergeBarrels } from "./composition.ts";

const SHARED_BARREL = "d3-shape@3.2.0/src/index.js";
const LINE = "d3-shape@3.2.0/src/line.js";
const ARC = "d3-shape@3.2.0/src/arc.js";

function index(own: string, sharedModules: string[], shared: Record<string, number | [number, string]>): BarrelIndex {
  return { modules: [own, ...sharedModules], barrels: { [`${own}-barrel`]: { thing: 0 }, [SHARED_BARREL]: shared } };
}

describe("mergeBarrels", () => {
  it("coalesces a barrel two libraries index identically, keeping every name on the same defining module", () => {
    const clicky = index("clicky.js", [LINE, ARC], { line: 1, arc: [2, "default"] });
    const facet = index("facet.js", [ARC, LINE], { line: 2, arc: [1, "default"] });
    const merged = mergeBarrels([clicky, facet]);
    const resolve = (at: number | [number, string] | undefined) => (typeof at === "number" ? merged.modules[at] : at && [merged.modules[at[0]], at[1]]);
    expect({
      line: resolve(merged.barrels[SHARED_BARREL]?.["line"]),
      arc: resolve(merged.barrels[SHARED_BARREL]?.["arc"]),
      clicky: resolve(merged.barrels["clicky.js-barrel"]?.["thing"]),
      facet: resolve(merged.barrels["facet.js-barrel"]?.["thing"]),
      modules: [...merged.modules].sort(),
    }).toEqual({ line: LINE, arc: [ARC, "default"], clicky: "clicky.js", facet: "facet.js", modules: [ARC, "clicky.js", "facet.js", LINE].sort() });
  });

  it("rejects a barrel two libraries index to different defining modules", () => {
    const clicky = index("clicky.js", [LINE, ARC], { line: 1 });
    const facet = index("facet.js", [LINE, ARC], { line: 2 });
    expect(() => mergeBarrels([clicky, facet])).toThrow(`barrel ${SHARED_BARREL} is indexed differently by two libraries`);
  });

  it("rejects an entry pointing past its own module list", () => {
    expect(() => mergeBarrels([{ modules: ["a.js"], barrels: { "a-barrel": { x: 3 } } }])).toThrow("barrel a-barrel: x points outside its module list");
  });
});
