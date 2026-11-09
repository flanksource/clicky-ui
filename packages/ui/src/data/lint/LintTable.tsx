import { useContainerWiderThan } from "../../hooks/use-container-width";
import { useProblemExpansion } from "../diagnostics/use-problem-expansion";
import { violationMenuItems } from "./violation-menu-items";
import { ProblemActions } from "../diagnostics/ProblemActions";
import { useMemo } from "react";
import { DataTable, type DataTableColumnInput } from "../DataTable";
import { toolMark } from "../test-runner/marks";
import { LintSeverityIcon, ToolIcon } from "../test-runner/MarkIcons";
import { ViolationCard, ViolationDetail, type HostActionProps } from "./LintDetail";
import { flattenLint, type FlatViolation } from "./grouping";
import { severityOf } from "./stats";
import { violationLocationLabel } from "./locations";
import { diagnosticKeys } from "../diagnostics/diagnostic-identity";
import { matchesFilterState } from "../test-runner/filterState";
import type { LintFilters, LintSeverity, LinterResult } from "./types";

type LintTableRow = {
  id: string;
  severity: LintSeverity;
  linter: string;
  rule: string;
  location: string;
  message: string;
  flat: FlatViolation;
};

const SEVERITY_RANK: Record<LintSeverity, number> = { error: 0, warning: 1, info: 2 };

function tableRows(results: readonly LinterResult[], filters: LintFilters): LintTableRow[] {
  const all = flattenLint(results, { severity: new Map(), linter: new Map() });
  const keys = diagnosticKeys(all.map((f) => [f.workDir, f.rawFile, f.linter, f.v.rule?.method, f.v.line, f.v.column, f.v.end_line, f.v.end_column, f.v.message, f.v.severity]));
  return all.map((flat, i) => ({
    id: keys[i]!,
    severity: severityOf(flat.v),
    linter: flat.linter,
    rule: flat.v.rule?.method ?? "",
    location: flat.file ? `${flat.file}${flat.v.line ? `:${flat.v.line}` : ""}` : violationLocationLabel(flat.v, true),
    message: flat.v.message ?? "",
    flat,
  })).filter(({ flat }) => matchesFilterState(flat.linter, filters.linter) && matchesFilterState(severityOf(flat.v), filters.severity));
}

const COLUMNS: Array<DataTableColumnInput<LintTableRow>> = [
  {
    key: "severity",
    label: "Severity",
    sortable: true,
    sortValue: (value) => SEVERITY_RANK[value as LintSeverity],
    shrink: true,
    render: (value) => (
      <span className="inline-flex items-center gap-1">
        <LintSeverityIcon severity={value as LintSeverity} />
        
      </span>
    ),
  },
  {
    key: "linter",
    label: "Linter",
    sortable: true,
    shrink: true,
    render: (value) => (
      <span className="inline-flex items-center gap-1">
        <ToolIcon tool={value as string} />
        {toolMark(value as string)?.label ?? (value as string)}
      </span>
    ),
  },
  { key: "rule", label: "Rule", sortable: true, render: (value) => <span className="font-mono text-xs">{value as string}</span> },
  { key: "location", label: "Location", sortable: true, render: (value) => <span title={value as string} className="block max-w-40 truncate font-mono text-xs">{value as string}</span> },
  { key: "message", label: "Message", grow: true },
];

export type LintTableProps = HostActionProps & {
  results: readonly LinterResult[];
  filters: LintFilters;
  className?: string;
};

/**
 * Every violation the filters keep as one sortable table row; clicking a row
 * opens the same violation card the tree's detail pane shows beneath it.
 */
export function LintTable({ results, filters, className, ...host }: LintTableProps) {
  const { ref, wider: roomy } = useContainerWiderThan(640);
  const columns = useMemo<Array<DataTableColumnInput<LintTableRow>>>(() => [...COLUMNS, {
    key: "actions", label: "", shrink: true,
    render: (_value, row) => <ProblemActions items={violationMenuItems({ violation: row.flat.v, linter: row.flat.linter, file: row.flat.rawFile ?? "", workDir: row.flat.workDir ?? "", ...host })} />,
  }], [host]);
  const allKeys = useMemo(() => tableRows(results, { severity: new Map(), linter: new Map() }).map((row) => row.id), [results]);
  const [expanded, setExpanded] = useProblemExpansion(allKeys);
  const rows = useMemo(() => tableRows(results, filters), [results, filters]);
  return (
    <div ref={ref} className="min-w-0">
    {!roomy ? <div>{rows.slice().sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]).map(({ id, flat }) => <ViolationCard key={id} expanded={expanded.includes(id)} onExpandedChange={(open) => setExpanded((current) => open ? [...current, id] : current.filter((key) => key !== id))} violation={flat.v} linter={flat.linter} file={flat.rawFile ?? ""} workDir={flat.workDir ?? ""} showFile {...host} />)}</div> : <DataTable<LintTableRow>
      data={rows}
      columns={columns}
      getRowId={(row) => row.id}
      defaultSort={{ key: "severity", dir: "asc" }}
      emptyMessage="No violations match the current filters"
      detailStyle="row"
      expandedRowIds={expanded}
      onExpandedRowIdsChange={setExpanded}
      renderExpandedRow={({ flat }) => (
        <ViolationDetail
          violation={flat.v}
          linter={flat.linter}
          file={flat.rawFile ?? ""}
          workDir={flat.workDir ?? ""}
          {...host}
        />
      )}
      {...(className ? { className } : {})}
    />}
    </div>
  );
}
