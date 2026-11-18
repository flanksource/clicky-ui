import type { CompileDiagnostic } from "../protocol/types";

/** One compiler diagnostic positioned in the edited text. */
export type SourceMarker = {
  line: number;
  column: number;
  message: string;
  severity: "error" | "warning";
};

/** The diagnostics that point at a line, as editor markers. */
export function diagnosticMarkers(diagnostics: readonly CompileDiagnostic[]): SourceMarker[] {
  return diagnostics
    .filter((diagnostic) => diagnostic.line > 0)
    .map((diagnostic) => ({
      line: diagnostic.line,
      column: diagnostic.column,
      message: diagnostic.message,
      severity: diagnostic.kind === "ERROR" ? "error" : "warning",
    }));
}
