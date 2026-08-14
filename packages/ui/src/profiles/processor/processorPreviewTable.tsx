import { useState } from "react";
import { SegmentedControl } from "../../components/SegmentedControl";
import { Badge } from "../../data/Badge";
import { cn } from "../../lib/utils";
import type { ProcessorPreview } from "./processorPreview";

const PREVIEW_VIEWS = [
  { id: "raw", label: "Raw" },
  { id: "output", label: "Output" },
  { id: "split", label: "Split" },
] as const;

type ProcessorPreviewView = (typeof PREVIEW_VIEWS)[number]["id"];

export function ProcessorPreviewTable({
  preview,
  selected,
}: {
  preview: ProcessorPreview;
  selected: number;
}) {
  const [view, setView] = useState<ProcessorPreviewView>("output");
  const stage = preview.stages[selected];
  if (!stage) return null;
  const before =
    selected === 0 ? preview.input : (preview.stages[selected - 1]?.rows ?? []);

  return (
    <section className="space-y-3 rounded-lg border border-border p-3">
      <header className="flex flex-wrap items-center gap-2">
        <h4 className="text-sm font-semibold">
          Processor result · {stage.label}
        </h4>
        <Badge tone="neutral" variant="soft" size="md">
          {rowSummary(stage.rowsIn, stage.rowsOut)}
        </Badge>
        <SegmentedControl
          value={view}
          options={PREVIEW_VIEWS.map((entry) => ({
            id: entry.id,
            label: entry.label,
          }))}
          onChange={setView}
          size="sm"
          aria-label="Preview view"
          className="ml-auto"
        />
        <p className="basis-full text-right text-[11px] text-muted-foreground">
          Bounded preview · selected stage received {stage.rowsIn} sampled rows
        </p>
      </header>
      <div className={cn("grid gap-3", view === "split" && "lg:grid-cols-2")}>
        {view !== "output" ? <RowsTable title="Raw" rows={before} /> : null}
        {view !== "raw" ? <RowsTable title="Output" rows={stage.rows} /> : null}
      </div>
    </section>
  );
}

function RowsTable({
  title,
  rows,
}: {
  title: string;
  rows: Record<string, unknown>[];
}) {
  const columns = rowColumns(rows);
  return (
    <section className="min-w-0 space-y-1.5">
      <div className="flex items-baseline gap-2">
        <h5 className="text-xs font-semibold">{title}</h5>
        <span className="text-[11px] text-muted-foreground">
          {rows.length} rows
        </span>
      </div>
      <div className="max-h-64 overflow-auto rounded border border-border">
        {rows.length === 0 ? (
          <p className="p-3 text-xs text-muted-foreground">No rows emitted.</p>
        ) : (
          <table className="w-full border-collapse text-left text-[11px]">
            <thead className="sticky top-0 bg-muted/90">
              <tr>
                {columns.map((column) => (
                  <th key={column} className="border-b px-2 py-1 font-medium">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 20).map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-border/50 last:border-0"
                >
                  {columns.map((column) => (
                    <td
                      key={column}
                      className="max-w-72 px-2 py-1 align-top font-mono"
                    >
                      <span className="line-clamp-4 break-all">
                        {formatCell(row[column])}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {rows.length > 20 ? (
        <p className="text-[10px] text-muted-foreground">
          Showing the first 20 rows.
        </p>
      ) : null}
    </section>
  );
}

function rowColumns(rows: Record<string, unknown>[]): string[] {
  const names = new Set<string>();
  rows.forEach((row) => Object.keys(row).forEach((key) => names.add(key)));
  return [...names].sort();
}

function formatCell(value: unknown): string {
  if (value === undefined) return "";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

function rowSummary(input: number, output: number): string {
  return `${input} input ${input === 1 ? "row" : "rows"} → ${output} output ${output === 1 ? "row" : "rows"}`;
}
