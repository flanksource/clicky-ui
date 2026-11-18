import { describe, expect, it } from "vitest";
import type { CompileDiagnostic } from "../protocol/types";
import { diagnosticMarkers } from "./source-markers";

describe("diagnosticMarkers", () => {
  it("maps ERROR to an error marker and every other kind to a warning", () => {
    const diagnostics: CompileDiagnostic[] = [
      { kind: "ERROR", line: 17, column: 9, message: "incompatible types" },
      { kind: "WARNING", line: 1, column: 1, message: "[deprecation]" },
      { kind: "MANDATORY_WARNING", line: 3, column: 5, message: "unchecked call" },
      { kind: "NOTE", line: 4, column: 1, message: "Some input files use unchecked operations." },
    ];
    expect(diagnosticMarkers(diagnostics)).toEqual([
      { line: 17, column: 9, message: "incompatible types", severity: "error" },
      { line: 1, column: 1, message: "[deprecation]", severity: "warning" },
      { line: 3, column: 5, message: "unchecked call", severity: "warning" },
      { line: 4, column: 1, message: "Some input files use unchecked operations.", severity: "warning" },
    ]);
  });

  it("leaves out diagnostics with no source position, which have no line to mark", () => {
    expect(diagnosticMarkers([{ kind: "ERROR", line: -1, column: -1, message: "no position" }, { kind: "ERROR", line: 0, column: 0, message: "also none" }])).toEqual([]);
  });
});
