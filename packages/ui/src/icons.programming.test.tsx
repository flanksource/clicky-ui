import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  UiExceptionAnalyzerImportant,
  UiFunction,
  programmingIconCatalog,
} from "./icons";

const selections = JSON.parse(
  readFileSync(join(process.cwd(), "icons/icon-selections.json"), "utf8"),
) as {
  rows: Array<{ consumerName: string; group: string; componentName?: string }>;
};
const programmingRows = selections.rows.filter(
  ({ group }) => group === "programming",
);

describe("programming icon catalog", () => {
  it("exports every downloaded pair with distinct light and dark sources and header status", () => {
    expect(programmingIconCatalog).toHaveLength(programmingRows.length);
    expect(new Set(programmingIconCatalog.map(({ id }) => id)).size).toBe(
      programmingRows.length,
    );
    expect(
      programmingIconCatalog.map(({ id, componentName }) => [
        id,
        componentName,
      ]),
    ).toEqual(
      programmingRows.map(({ consumerName, componentName }) => [
        consumerName,
        componentName,
      ]),
    );
    expect(
      new Set(programmingIconCatalog.map(({ componentName }) => componentName))
        .size,
    ).toBe(programmingRows.length);
    for (const entry of programmingIconCatalog) {
      expect(entry.headerVerified).toBe(
        !entry.source.startsWith("jb-download-unverified:"),
      );
      expect(entry.icon.__source).toBe(entry.source);
      expect(entry.darkIcon.__source).toBe(`${entry.source}-dark`);
      expect(entry.icon.__consumerName).toBe(entry.id);
      expect(entry.darkIcon.__consumerName).toBe(entry.id);
      expect(entry.icon.displayName).toBe(entry.componentName);
      expect(entry.darkIcon.displayName).toBe(`${entry.componentName}Dark`);
      expect(entry.componentName).not.toMatch(/^UiProgramming/);
    }
  });

  it("keeps the existing Function icon and exports concept-numbered alternatives", () => {
    expect(UiFunction.__source).toBe("jb-expui-nodes:function");
    expect(
      programmingIconCatalog
        .filter(({ concept }) => concept === "Function")
        .map(({ componentName }) => componentName),
    ).toEqual(["UiFunction1", "UiFunction2", "UiFunction3", "UiFunction4"]);
  });

  it("renders imported inline SVG styles as valid React styles", () => {
    expect(renderToStaticMarkup(<UiExceptionAnalyzerImportant />)).toContain(
      'style="fill:#c85451;fill-opacity:1;stroke-width:1.70224"',
    );
  });

  it("groups navigation and execution icons by action", () => {
    const expected = {
      UiStep: ["Debugging and profiling", "Step into"],
      UiStep1: ["Debugging and profiling", "Run to cursor"],
      UiStep2: ["Debugging and profiling", "Step into"],
      UiStep3: ["Debugging and profiling", "Step over"],
      UiStep4: ["Debugging and profiling", "Run to cursor"],
      UiStep5: ["Debugging and profiling", "Step into"],
      UiStep6: ["Debugging and profiling", "Step into"],
      UiStep7: ["Debugging and profiling", "Step out"],
      UiStep8: ["Debugging and profiling", "Step out"],
      UiStep9: ["Debugging and profiling", "Step over"],
      UiRun: ["Execution and status", "Run"],
      UiRun3: ["Execution and status", "Rerun"],
      UiRun4: ["Execution and status", "Rerun"],
      UiRun5: ["Execution and status", "Rerun"],
      UiRun6: ["Execution and status", "Restart"],
      UiRun7: ["Execution and status", "Restart"],
      UiRun10: ["Execution and status", "Run outcome"],
      UiRun12: ["Execution and status", "Run outcome"],
      UiRun13: ["Execution and status", "Stop"],
      UiRun14: ["Execution and status", "Stop"],
      UiSortAlphabetically: ["Navigation and organization", "Sorting"],
      UiSortByType: ["Navigation and organization", "Sorting"],
      UiSortByUsage: ["Navigation and organization", "Sorting"],
      UiSortByVisibility: ["Navigation and organization", "Sorting"],
      UiMethod3: ["Navigation and organization", "Grouping"],
      UiGroupByModuleGroup: ["Navigation and organization", "Grouping"],
      UiGroupByPackage: ["Navigation and organization", "Grouping"],
      UiGroupByTestProduction: ["Navigation and organization", "Grouping"],
      UiIndex5: ["Database and data", "Unique index"],
    };
    expect(
      Object.fromEntries(
        programmingIconCatalog
          .filter(({ componentName }) => componentName in expected)
          .map(({ componentName, family, concept }) => [
            componentName,
            [family, concept],
          ]),
      ),
    ).toEqual(expected);
  });
});
