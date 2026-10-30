import ts from "typescript";
import { describe, expect, it } from "vitest";

import { memoryGuidanceHost, StaticModuleGraph, type GuidanceHost } from "./markdown-static-evaluator";

const PAGE = "/src/pages/page.tsx";
const SCENARIOS = "/src/pages/_page/scenarios.ts";

// Mirrors the vite host, which refuses any import that resolves outside the playground src.
function boundedHost(files: Record<string, string>): GuidanceHost {
  const memory = memoryGuidanceHost(files);
  return {
    read: memory.read,
    resolve(importer, specifier) {
      const resolved = memory.resolve(importer, specifier);
      if (resolved && !resolved.startsWith("/src/")) throw new Error(`guidance source escapes playground src: ${resolved}`);
      return resolved;
    },
  };
}

function evaluateTitles(scenarios: string): unknown {
  const graph = new StaticModuleGraph(
    boundedHost({
      [PAGE]: 'import { TITLES } from "./_page/scenarios";\nexport default function Page() { return TITLES; }',
      [SCENARIOS]: scenarios,
      "/plugins/model.ts": "export type Model = { id: string };",
    }),
  );
  const titles = ts.factory.createIdentifier("TITLES");
  return graph.evaluate(PAGE, titles, new Map());
}

describe("StaticModuleGraph imports", () => {
  it.each([
    ["a type-only import", 'import type { Model } from "../../../plugins/model";'],
    ["an inline type specifier", 'import { type Model } from "../../../plugins/model";'],
  ])("never resolves %s, so a type from outside src does not block evaluation", (_label, importLine) => {
    expect(evaluateTitles(`${importLine}\nexport const TITLES = ["Ready", "Failed"];`)).toEqual(["Ready", "Failed"]);
  });

  it("still refuses a value import from outside src", () => {
    expect(() =>
      evaluateTitles('import { Model } from "../../../plugins/model";\nexport const TITLES = ["Ready"];'),
    ).toThrow("guidance source escapes playground src: /plugins/model.ts");
  });
});
