import { describe, expect, it } from "vitest";

import {
  assignProgrammingComponentNames,
  archiveIdentity,
  programmingConcept,
  programmingFamily,
  programmingTone,
} from "./import-jetbrains-zips";
import type { SelectionRow } from "./icon-sources";

function programmingRow(options: {
  name: string;
  concept: string;
  componentName?: string;
}): SelectionRow {
  return {
    consumerName: `programming-${options.name}`,
    group: "programming",
    status: "NEW",
    outline: `jb-download:${options.name}`,
    filled: null,
    dark: `jb-download:${options.name}-dark`,
    concept: options.concept,
    note: "",
    ...(options.componentName ? { componentName: options.componentName } : {}),
  };
}

describe("JetBrains ZIP catalog metadata", () => {
  it("keeps repeated archive names distinct", () => {
    expect([
      archiveIdentity("variable.zip"),
      archiveIdentity("variable (1).zip"),
    ]).toEqual([
      { stem: "variable", slug: "variable" },
      { stem: "variable", slug: "variable-alt-1" },
    ]);
    expect(() => archiveIdentity("../variable.zip")).toThrow(
      "Unsupported JetBrains archive name",
    );
  });

  it("groups programming variants and assigns color by meaning", () => {
    expect([
      programmingConcept("variable"),
      programmingConcept("gvariable"),
      programmingConcept("functionRun"),
      programmingConcept("functionExternal"),
      programmingFamily("columnBlueKey"),
      programmingTone("runError"),
      programmingTone("testPassedIgnored"),
    ]).toEqual([
      "Variable",
      "Variable",
      "Function",
      "Function",
      "Database and data",
      "danger",
      "warning",
    ]);
  });
});

describe("programming icon component names", () => {
  it("keeps existing defaults and numbers alternatives across families", () => {
    const imported = [
      programmingRow({ name: "function-external", concept: "Function" }),
      programmingRow({ name: "function-run", concept: "Function" }),
      programmingRow({ name: "index-fun", concept: "Function" }),
      programmingRow({ name: "run-error", concept: "Run control" }),
      programmingRow({ name: "run", concept: "Run control" }),
      programmingRow({ name: "step-over", concept: "Debugger step" }),
      programmingRow({ name: "step-into", concept: "Debugger step" }),
      programmingRow({ name: "constant", concept: "Constant" }),
      programmingRow({ name: "alias", concept: "Alias" }),
    ];

    expect(
      assignProgrammingComponentNames({
        existing: [],
        imported,
        reservedNames: new Set(["UiFunction", "UiConstant"]),
      }).map(({ consumerName, componentName }) => [consumerName, componentName]),
    ).toEqual([
      ["programming-function-external", "UiFunction1"],
      ["programming-function-run", "UiFunction2"],
      ["programming-index-fun", "UiFunction3"],
      ["programming-run-error", "UiRun1"],
      ["programming-run", "UiRun"],
      ["programming-step-over", "UiStep1"],
      ["programming-step-into", "UiStep"],
      ["programming-constant", "UiConstant1"],
      ["programming-alias", "UiAlias"],
    ]);
  });

  it("retains assigned names and untouched rows on a later import", () => {
    const existing = [
      programmingRow({
        name: "function-external",
        concept: "Function",
        componentName: "UiFunction1",
      }),
      programmingRow({
        name: "run",
        concept: "Run control",
        componentName: "UiRun",
      }),
      programmingRow({
        name: "run-error",
        concept: "Run control",
        componentName: "UiRun1",
      }),
    ];
    const imported = [
      programmingRow({ name: "function-external", concept: "Function" }),
      programmingRow({ name: "function-run", concept: "Function" }),
      programmingRow({ name: "run-success", concept: "Run control" }),
    ];

    expect(
      assignProgrammingComponentNames({
        existing,
        imported,
        reservedNames: new Set(["UiFunction"]),
      }).map(({ consumerName, componentName }) => [consumerName, componentName]),
    ).toEqual([
      ["programming-function-external", "UiFunction1"],
      ["programming-run", "UiRun"],
      ["programming-run-error", "UiRun1"],
      ["programming-function-run", "UiFunction2"],
      ["programming-run-success", "UiRun2"],
    ]);
  });

  it("rejects a stored name that would overwrite an existing icon", () => {
    expect(() =>
      assignProgrammingComponentNames({
        existing: [
          programmingRow({
            name: "function-run",
            concept: "Function",
            componentName: "UiFunction",
          }),
        ],
        imported: [],
        reservedNames: new Set(["UiFunction"]),
      }),
    ).toThrow('Invalid or duplicate programming component name "UiFunction"');
  });
});
