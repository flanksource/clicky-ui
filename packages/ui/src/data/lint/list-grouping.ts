import { diagnosticKeys } from "../diagnostics/diagnostic-identity";
import { flattenLint, type FlatViolation } from "./grouping";
import type { LintFilters, LinterResult } from "./types";

type ListedViolation = { id: string; flat: FlatViolation };
type FileGroup = { file: string; violations: ListedViolation[] };
type LinterGroup = { linter: string; count: number; files: FileGroup[] };

export const NO_FILE = "";

/** Linter → file → violation, in run order with files sorted and violations by line, as `gavel lint` prints them. */
export function lintListGroups(results: readonly LinterResult[], filters: LintFilters): LinterGroup[] {
  const all = flattenLint(results, filters);
  const keys = diagnosticKeys(all.map((f) => [f.workDir, f.rawFile, f.linter, f.v.rule?.method, f.v.line, f.v.column, f.v.end_line, f.v.end_column, f.v.message, f.v.severity]));
  const byLinter = new Map<string, Map<string, ListedViolation[]>>();
  all.forEach((flat, i) => {
    const files = byLinter.get(flat.linter) ?? new Map<string, ListedViolation[]>();
    byLinter.set(flat.linter, files);
    const file = flat.file ?? NO_FILE;
    files.set(file, [...(files.get(file) ?? []), { id: keys[i]!, flat }]);
  });
  return [...byLinter].map(([linter, files]) => ({
    linter,
    count: [...files.values()].reduce((sum, list) => sum + list.length, 0),
    files: [...files]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([file, violations]) => ({
        file,
        violations: violations.slice().sort((a, b) => (a.flat.v.line ?? 0) - (b.flat.v.line ?? 0)),
      })),
  }));
}
