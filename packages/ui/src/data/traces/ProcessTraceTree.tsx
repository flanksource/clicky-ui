import { useMemo } from "react";
import { UiDebug, UiServerProcess } from "../../icons";
import { formatBytes, formatDuration } from "../../lib/format";
import { cn } from "../../lib/utils";
import { processLabel, processStateColor, processStateIcon } from "../diagnostics/utils";
import { Icon } from "../Icon";
import { Tree } from "../Tree";
import { buildProcessForest, cpuSeriesByKey, flattenForest, type ProcessTreeNode } from "./process-tree";
import { Sparkline } from "./Sparkline";
import type { ProcessNodeRow, ProcessSampleRow } from "./types";

/** Roots and their direct children start open; deeper levels open on demand or to reveal the selection. */
const OPEN_DEPTH = 2;

export type ProcessTraceTreeProps = {
  /** `process_tree` trace records, one per process. */
  nodes: ProcessNodeRow[];
  /** `process_samples` records; a process with at least two shows a CPU sparkline. */
  samples?: ProcessSampleRow[];
  /** Called with the `key` of the clicked process. */
  onSelect: (key: string) => void;
  /** `key` of the selected process. */
  selectedKey?: string | null;
  /** Shown when there are no processes. */
  emptyLabel?: string;
  /** Classes applied to the tree root. */
  className?: string;
};

function lifetimeMs(row: ProcessNodeRow): number {
  const end = row.exitedAt ?? row.lastSeenAt;
  return Date.parse(end) - Date.parse(row.startedAt);
}

function ProcessRow({ node, selected, series }: { node: ProcessTreeNode; selected: boolean; series: number[] | undefined }) {
  const { row, exited } = node;
  return (
    <div
      data-process-key={row.key}
      {...(exited ? { "data-exited": "true" } : {})}
      className={cn("flex min-w-0 flex-1 items-center gap-1.5", exited && "opacity-60")}
      title={row.command}
    >
      <Icon
        icon={row.isRoot ? UiServerProcess : UiDebug}
        className={row.isRoot ? "text-base text-blue-600" : "text-base text-muted-foreground"}
      />
      <span className={cn("truncate", selected ? "font-semibold text-primary" : "font-medium text-foreground")}>
        {processLabel({ pid: row.pid, name: row.name, command: row.command })}
      </span>
      <span className="shrink-0 text-xs text-muted-foreground">pid {row.pid}</span>
      <span className="flex-1" />
      {series ? <Sparkline values={series} label={`CPU % over ${series.length} samples`} /> : null}
      <span className={cn("inline-flex shrink-0 items-center gap-1 text-xs", processStateColor(row.status))}>
        <Icon icon={processStateIcon(row.status)} />
        {row.status}
      </span>
      {exited ? (
        <>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground" title="Lifetime">
            {formatDuration(lifetimeMs(row))}
          </span>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground" title="Peak CPU">
            {`peak ${row.peakCpuPercent.toFixed(1)}%`}
          </span>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground" title="Peak RSS">
            {`peak ${formatBytes(row.peakRssBytes)}`}
          </span>
        </>
      ) : (
        <>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground" title={`Peak ${row.peakCpuPercent.toFixed(1)}%`}>
            {`${row.cpuPercent.toFixed(1)}%`}
          </span>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground" title={`Peak ${formatBytes(row.peakRssBytes)}`}>
            {formatBytes(row.rssBytes)}
          </span>
        </>
      )}
    </div>
  );
}

/**
 * The process tree of a `process_tree` trace: a forest keyed by `key` /
 * `parentKey`, where a process whose parent was never recorded is a root.
 * Exited processes are dimmed and show their lifetime and peak usage. It is
 * built on the same `Tree` primitive and process helpers as `DiagnosticsTree`,
 * which cannot take a forest, key selection or exit information.
 */
export function ProcessTraceTree({
  nodes,
  samples,
  onSelect,
  selectedKey,
  emptyLabel = "No processes recorded",
  className,
}: ProcessTraceTreeProps) {
  const roots = useMemo(() => buildProcessForest(nodes), [nodes]);
  const series = useMemo(() => cpuSeriesByKey(samples ?? []), [samples]);
  const selected = useMemo(
    () => (selectedKey ? (flattenForest(roots).find((node) => node.row.key === selectedKey) ?? null) : null),
    [roots, selectedKey],
  );

  return (
    <Tree<ProcessTreeNode>
      roots={roots}
      {...(className ? { className } : {})}
      ariaLabel="Process tree"
      empty={<div className="p-density-6 text-center text-muted-foreground text-sm">{emptyLabel}</div>}
      getChildren={(node) => node.children}
      getKey={(node) => node.row.key}
      getSearchText={(node) => `${node.row.name} ${node.row.command} ${node.row.pid}`}
      selected={selected}
      revealSelected
      defaultOpen={(_node, depth) => depth < OPEN_DEPTH}
      onSelect={(node) => onSelect(node.row.key)}
      renderRow={({ node, selected: isSelected }) => (
        <ProcessRow node={node} selected={isSelected} series={series.get(node.row.key)} />
      )}
      rowClass={(_node, isSelected) =>
        isSelected ? "bg-primary/10 border-l-2 border-primary" : "hover:bg-accent"
      }
    />
  );
}
