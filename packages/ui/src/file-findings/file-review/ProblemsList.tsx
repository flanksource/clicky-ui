import { useProblemExpansion } from "../../data/diagnostics/use-problem-expansion";
import { useMemo } from "react";
import type { HighlightedLine } from "../../data/code-highlight";
import { HighlightedTokens } from "../../data/HighlightedTokens";
import { matchesFilterState } from "../../data/test-runner/filterState";
import { ProblemRow } from "../../data/diagnostics/ProblemRow";
import { FilterBar } from "../../components/FilterBar";
import { diagnosticKeys } from "../../data/diagnostics/diagnostic-identity";
import type { DropdownMenuItem } from "../../overlay/DropdownMenu";
import { FINDING_SEVERITIES } from "../severity-counts";
import type { FileFinding } from "../types";
import { SEVERITY_MARK, bySeverityThenLine, squiggleUnder } from "./marks";

import {
  emptyProblemFilters,
  matchesProblemFilters,
  problemType,
  type ProblemFilters,
} from "./problem-filters";
const LABELS = { error: "Errors", warning: "Warnings", info: "Info" };

function count(
  findings: readonly FileFinding[],
  value: (finding: FileFinding) => string,
) {
  const counts = new Map<string, number>();
  for (const finding of findings)
    counts.set(value(finding), (counts.get(value(finding)) ?? 0) + 1);
  return counts;
}

/** The "N of M problems" count and the severity / issue-type filter menu over a problem list. */
export function ProblemFilterBar({
  findings,
  shown,
  filters,
  onFiltersChange,
}: {
  findings: readonly FileFinding[];
  shown: number;
  filters: ProblemFilters;
  onFiltersChange: (next: ProblemFilters) => void;
}) {
  const severityCounts = count(
    findings.filter((f) => matchesFilterState(problemType(f), filters.type)),
    (f) => f.severity,
  );
  const typeCounts = count(
    findings.filter((f) => matchesFilterState(f.severity, filters.severity)),
    problemType,
  );
  const types = [
    ...new Set([...findings.map(problemType), ...filters.type.keys()]),
  ].sort();
  const active = filters.severity.size + filters.type.size;
  return (
    <div className="border-b border-border p-1 text-xs" data-problem-filters="">
      {/* Picks commit immediately (no Apply): the host owns the filter state. */}
      <FilterBar
        autoSubmit={false}
        overflowMode="wrap"
        leading={
          <span className="px-1 text-muted-foreground">
            {shown} of {findings.length} problems
          </span>
        }
        filters={[
          {
            key: "severity",
            kind: "multi",
            label: "Severity",
            options: FINDING_SEVERITIES.map((s) => ({
              value: s,
              label: LABELS[s],
              count: severityCounts.get(s) ?? 0,
            })),
            value: Object.fromEntries(filters.severity),
            onChange: (value) =>
              onFiltersChange({
                ...filters,
                severity: new Map(Object.entries(value)) as ProblemFilters["severity"],
              }),
          },
          {
            key: "type",
            kind: "multi",
            label: "Issue Type",
            options: types.map((type) => ({
              value: type,
              label: type,
              count: typeCounts.get(type) ?? 0,
            })),
            value: Object.fromEntries(filters.type),
            onChange: (value) => onFiltersChange({ ...filters, type: new Map(Object.entries(value)) }),
          },
        ]}
        trailing={
          active > 0 && (
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => onFiltersChange(emptyProblemFilters())}
            >
              Clear filters
            </button>
          )
        }
      />
    </div>
  );
}

export function ProblemsList({
  source,
  tokens,
  findings,
  filters,
  onFiltersChange,
  onOpen,
  openLabel,
  getFindingActions,
}: {
  source: string;
  tokens: readonly HighlightedLine[] | null;
  findings: readonly FileFinding[];
  filters: ProblemFilters;
  onFiltersChange: (next: ProblemFilters) => void;
  onOpen: (finding: FileFinding) => void;
  openLabel: string;
  getFindingActions?:
    | ((finding: FileFinding) => DropdownMenuItem[])
    | undefined;
}) {
  const lines = useMemo(() => source.split("\n"), [source]);
  const entries = useMemo(() => {
    const keys = diagnosticKeys(
      findings.map((f) => [
        f.workDir,
        f.file,
        f.source,
        f.rule,
        f.line,
        f.column,
        f.endLine,
        f.endColumn,
        f.message,
        f.severity,
        f.kind,
      ]),
    );
    return findings.map((finding, index) => ({ finding, key: keys[index]! }));
  }, [findings]);
  const keys = useMemo(() => entries.map((entry) => entry.key), [entries]);
  const [expanded, setExpanded] = useProblemExpansion(keys);
  const shown = entries
    .filter(({ finding }) => matchesProblemFilters(finding, filters))
    .sort((a, b) => bySeverityThenLine(a.finding, b.finding));
  return (
    <>
      <ProblemFilterBar
        findings={findings}
        shown={shown.length}
        filters={filters}
        onFiltersChange={onFiltersChange}
      />
      {shown.length === 0 ? (
        <p className="p-6 text-center text-xs text-muted-foreground">
          {findings.length
            ? "No problems match the current filters."
            : "No problems in this file."}
        </p>
      ) : (
        <ul>
          {shown.map(({ finding: f, key }) => {
            const first = Math.max(1, f.line - 3);
            const last = Math.min(lines.length, (f.endLine ?? f.line) + 3);
            return (
              <li key={key} data-problem-line={f.line}>
                <ProblemRow
                  message={f.message}
                  severity={f.severity}
                  metadata={`${f.source} ${f.rule ?? ""}`}
                  location={`${f.line}${f.column ? `:${f.column}` : ""}`}
                  expanded={expanded.includes(key)}
                  onExpandedChange={(open) =>
                    setExpanded((current) => {
                      const next = new Set(
                        [...current].filter((id) =>
                          entries.some((entry) => entry.key === id),
                        ),
                      );
                      if (open) next.add(key);
                      else next.delete(key);
                      return [...next];
                    })
                  }
                  actions={[
                    { label: openLabel, onSelect: () => onOpen(f) },
                    {
                      label: "Copy description",
                      onSelect: () => {
                        void navigator.clipboard.writeText(f.message);
                      },
                    },
                    ...(getFindingActions?.(f) ?? []),
                  ]}
                >
                  {f.line > lines.length ? (
                    <p role="alert">Source location is outside this file.</p>
                  ) : (
                    <ol
                      data-problem-context="block"
                      className="overflow-x-auto border-l border-border bg-muted/20 py-1 font-mono text-xs leading-5"
                    >
                      {lines.slice(first - 1, last).map((text, index) => {
                        const line = first + index;
                        return (
                          <li
                            key={line}
                            className="grid min-w-max grid-cols-[2.5rem_1fr] gap-2 pr-2"
                          >
                            <span className="select-none text-right text-muted-foreground">
                              {line}
                            </span>
                            <code
                              className="whitespace-pre"
                              style={
                                line >= f.line && line <= (f.endLine ?? f.line)
                                  ? squiggleUnder(
                                      SEVERITY_MARK[f.severity].stroke,
                                    )
                                  : undefined
                              }
                            >
                              <HighlightedTokens
                                tokens={tokens?.[line - 1]}
                                content={text || " "}
                              />
                            </code>
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </ProblemRow>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
