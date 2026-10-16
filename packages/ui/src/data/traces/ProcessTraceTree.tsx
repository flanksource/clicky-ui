import { useMemo } from "react";
import { UiDebug, UiLoader, UiServerProcess } from "../../icons";
import { formatBytes, formatDuration } from "../../lib/format";
import { cn } from "../../lib/utils";
import { processLabel, processStateColor, processStateIcon } from "../diagnostics/utils";
import { Icon } from "../Icon";
import { Tree } from "../Tree";
import {
  buildProcessForest,
  cpuSeriesByKey,
  flattenForest,
  formatCpuPercent,
  processLifetimeMs,
  pruneExitedProcesses,
  type ProcessTreeNode,
} from "./process-tree";
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
  /**
   * Tri-state expand-all: true opens every process, false closes them, null
   * restores the default depth. Without `onExpandAllChange` the host owns the
   * state and the tree's own Expand / Collapse buttons are hidden.
   */
  expandAll?: boolean | null;
  /** Called when the tree's Expand all / Collapse all buttons change the state. */
  onExpandAllChange?: (next: boolean | null) => void;
  /** Drop exited processes, keeping an exited one only while a live descendant hangs off it. */
  hideExited?: boolean;
  /** Called with the checkbox state; providing it shows the "N processes / Hide exited" toolbar. */
  onHideExitedChange?: (hide: boolean) => void;
  /** No trace has arrived yet: with no processes, show a waiting spinner instead of the empty label. */
  loading?: boolean;
  /** A load failure, shown as a banner above the tree. */
  error?: string;
};

/** The tree is controlled by a host that owns the expand-all buttons, so the tree never changes it. */
const hostOwnedExpandAll = () => {};

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
      <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground" title={row.command} data-process-command="">
        {row.command}
      </span>
      {series ? <Sparkline values={series} label={`CPU % over ${series.length} samples`} /> : null}
      <span className={cn("inline-flex shrink-0 items-center gap-1 text-xs", processStateColor(row.status))}>
        <Icon icon={processStateIcon(row.status)} />
        {row.status}
      </span>
      {exited ? (
        <>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground" title="Lifetime">
            {formatDuration(processLifetimeMs(row))}
          </span>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground" title="Peak CPU">
            {`peak ${formatCpuPercent(row.peakCpuPercent)}`}
          </span>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground" title="Peak RSS">
            {`peak ${formatBytes(row.peakRssBytes)}`}
          </span>
        </>
      ) : (
        <>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground" title={`Peak ${formatCpuPercent(row.peakCpuPercent)}`}>
            {formatCpuPercent(row.cpuPercent)}
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
 * Each row shows the process, its truncated command, state and usage; exited
 * processes are dimmed and show their lifetime and peak usage. It is built on
 * the same `Tree` primitive and process helpers as `DiagnosticsTree`, which
 * cannot take a forest, key selection or exit information.
 */
export function ProcessTraceTree({
  nodes,
  samples,
  onSelect,
  selectedKey,
  emptyLabel = "No processes recorded",
  className,
  expandAll,
  onExpandAllChange,
  hideExited = false,
  onHideExitedChange,
  loading = false,
  error,
}: ProcessTraceTreeProps) {
  const full = useMemo(() => buildProcessForest(nodes), [nodes]);
  const roots = useMemo(() => (hideExited ? pruneExitedProcesses(full) : full), [full, hideExited]);
  const series = useMemo(() => cpuSeriesByKey(samples ?? []), [samples]);
  const selected = useMemo(
    () => (selectedKey ? (flattenForest(roots).find((node) => node.row.key === selectedKey) ?? null) : null),
    [roots, selectedKey],
  );

  const empty =
    nodes.length === 0 ? (
      error ? null : loading ? (
        <div className="p-density-6 text-center text-sm text-muted-foreground" role="status">
          <Icon icon={UiLoader} className="animate-spin text-3xl text-blue-500" />
          <p className="mt-2">Waiting for process trace…</p>
        </div>
      ) : (
        <div className="p-density-6 text-center text-sm text-muted-foreground">{emptyLabel}</div>
      )
    ) : (
      <div className="p-density-6 text-center text-sm text-muted-foreground">Every process has exited</div>
    );

  const hostOwnsExpandAll = expandAll !== undefined && onExpandAllChange === undefined;

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      {onHideExitedChange && (
        <div
          className="flex items-center justify-between gap-2 border-b border-border bg-background px-3 py-1.5 text-xs text-muted-foreground"
          data-process-toolbar=""
        >
          <span>
            {nodes.length} {nodes.length === 1 ? "process" : "processes"}
          </span>
          <label className="inline-flex cursor-pointer items-center gap-1.5">
            <input
              type="checkbox"
              checked={hideExited}
              onChange={(event) => onHideExitedChange(event.target.checked)}
            />
            Hide exited
          </label>
        </div>
      )}
      {error && (
        <div className="whitespace-pre-wrap px-3 py-2 text-xs text-red-700 dark:text-red-400" role="alert">
          {error}
        </div>
      )}
      <Tree<ProcessTreeNode>
        roots={roots}
        className="min-h-0 flex-1"
        ariaLabel="Process tree"
        empty={empty}
        showControls={!hostOwnsExpandAll}
        {...(expandAll !== undefined ? { expandAll, onExpandAllChange: onExpandAllChange ?? hostOwnedExpandAll } : {})}
        {...(expandAll === undefined && onExpandAllChange ? { onExpandAllChange } : {})}
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
    </div>
  );
}
