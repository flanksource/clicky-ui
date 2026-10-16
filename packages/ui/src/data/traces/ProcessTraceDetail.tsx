import { useMemo, useState, type ReactNode } from "react";
import { Button } from "../../components/button";
import { Select } from "../../components/select";
import { UiDebug, UiDebugSmall, UiLoader, UiServerProcess } from "../../icons";
import { Tabs, type TabItem } from "../../layout/Tabs";
import { formatBytes, formatDuration } from "../../lib/format";
import { cn } from "../../lib/utils";
import { ConfirmDialog } from "../../overlay/ConfirmDialog";
import { MetricTile } from "../diagnostics/MetricTile";
import { cpuTone } from "../diagnostics/metric-tone";
import { StackDumpView } from "../diagnostics/StackDumpView";
import { processLabel, processStateColor, processStateIcon } from "../diagnostics/utils";
import { Icon } from "../Icon";
import {
  SAMPLE_FACETS,
  armedFacets,
  diskSeries,
  facetCountSeries,
  latestFacetReading,
} from "./process-facets";
import {
  formatCpuPercent,
  formatProcessTimestamp,
  isProcessExited,
  processLifetimeMs,
  processSeries,
} from "./process-tree";
import { ProcessFacetTable } from "./ProcessFacetTable";
import { stackCheckpoints } from "./stack-checkpoints";
import { LabeledSparkline } from "./Sparkline";
import type { ProcessNodeRow, ProcessSampleFacet, ProcessSampleRow, ProcessStackTransport, StackRecord } from "./types";

type TransportSpec = {
  label: (hasStack: boolean) => string;
  title: string;
  /** Shown when a destructive collection asks for confirmation. */
  warning?: (pid: number) => string;
};

/** How each stack transport a node offers in `stackTransports` is presented. */
const STACK_TRANSPORTS: Record<string, TransportSpec> = {
  inprocess: {
    label: (hasStack) => (hasStack ? "Refresh stack trace" : "Collect stack trace"),
    title: "Take a fresh observation and dump the goroutine stacks",
  },
  native: {
    label: () => "Native sample",
    title: "Sample the process's native threads without interrupting it",
  },
  pprof: {
    label: () => "Collect via pprof",
    title: "Read the goroutine profile from the process's pprof endpoint",
  },
  gops: {
    label: () => "Collect via gops",
    title: "Read the goroutine stacks from the process's gops agent",
  },
  sigquit: {
    label: () => "Dump goroutines & kill",
    title: "Send SIGQUIT: the process prints every goroutine's stack and exits",
    warning: (pid) => `This sends SIGQUIT to pid ${pid}. The process prints every goroutine's stack and exits.`,
  },
};

function transportSpec(transport: string): TransportSpec {
  const spec = STACK_TRANSPORTS[transport];
  if (!spec) {
    throw new Error(`unknown stack transport "${transport}"; expected one of ${Object.keys(STACK_TRANSPORTS).join(", ")}`);
  }
  return spec;
}

type DetailTab = "overview" | "env" | ProcessSampleFacet;

const NO_STACKS: StackRecord[] = [];

export type ProcessTraceDetailProps = {
  /** The selected `process_tree` record; null renders the empty selection state. */
  node: ProcessNodeRow | null;
  /**
   * `process_samples` records; those of other processes are ignored. They carry
   * the resource series, and the facet counts and lists: a facet tab is shown
   * only when the samples carry that facet's count, that is when the session
   * armed it.
   */
  samples: ProcessSampleRow[];
  /** `stacks` records; those of other processes are ignored. */
  stacks?: StackRecord[];
  /** Host content at the top of Overview, for example a link to the fixture step that started the process. */
  links?: ReactNode;
  /**
   * Collects a stack for a process over one of its `stackTransports`. Without it
   * no collect buttons are shown. A destructive transport (sigquit) kills the
   * process, so it asks for confirmation first.
   */
  onCollectStack?: (key: string, transport: string) => void | Promise<void>;
  /** A collection is in flight: collect buttons are disabled. */
  collecting?: boolean;
  /** Why the last collection failed. */
  collectError?: string;
  className?: string;
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</div>
      {children}
    </section>
  );
}

function InfoTile({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`rounded-lg border border-border bg-muted/50 px-2.5 py-density-2 ${wide ? "col-span-2" : ""}`}>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 break-all text-xs font-medium text-foreground">{value}</div>
    </div>
  );
}

function Header({ node }: { node: ProcessNodeRow }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-density-2">
        <Icon icon={node.isRoot ? UiServerProcess : UiDebug} className="shrink-0 text-2xl text-blue-600" />
        <h2 className="break-words text-lg font-bold text-foreground">{processLabel(node)}</h2>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-density-2 text-xs text-muted-foreground">
        <span className="font-mono">pid {node.pid}</span>
        {node.ppid ? <span className="font-mono">ppid {node.ppid}</span> : null}
        <span className={`inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 ${processStateColor(node.status)}`}>
          <Icon icon={processStateIcon(node.status)} />
          {node.status}
        </span>
      </div>
    </div>
  );
}

function CollectButtons({
  transports,
  hasStack,
  collecting,
  onCollect,
}: {
  transports: ProcessStackTransport[];
  hasStack: boolean;
  collecting: boolean;
  onCollect: (transport: ProcessStackTransport) => void;
}) {
  return (
    <div className="flex items-center gap-density-1" data-stack-actions="">
      {transports.map((transport) => {
        const spec = transportSpec(transport.transport);
        return (
          <Button
            key={transport.transport}
            size="sm"
            variant={transport.destructive ? "destructive" : hasStack ? "outline" : "default"}
            disabled={collecting}
            title={spec.title}
            onClick={() => onCollect(transport)}
          >
            <Icon icon={collecting ? UiLoader : UiDebugSmall} className={collecting ? "mr-1 animate-spin" : "mr-1"} />
            {spec.label(hasStack)}
          </Button>
        );
      })}
    </div>
  );
}

function StackSection({
  node,
  stacks,
  onCollectStack,
  collecting,
  collectError,
}: Pick<ProcessTraceDetailProps, "onCollectStack" | "collecting" | "collectError"> & {
  node: ProcessNodeRow;
  stacks: StackRecord[];
}) {
  const [confirming, setConfirming] = useState<ProcessStackTransport | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const checkpoints = useMemo(() => stackCheckpoints(stacks, node.key), [stacks, node.key]);
  const transports = node.stackTransports ?? [];
  const canCollect = Boolean(onCollectStack) && transports.length > 0;
  if (checkpoints.length === 0 && !canCollect) return null;

  const selected = checkpoints.find((checkpoint) => checkpoint.checkpointId === picked) ?? checkpoints[checkpoints.length - 1];
  const buttons = canCollect ? (
    <CollectButtons
      transports={transports}
      hasStack={Boolean(selected)}
      collecting={Boolean(collecting)}
      onCollect={(transport) => (transport.destructive ? setConfirming(transport) : void onCollectStack?.(node.key, transport.transport))}
    />
  ) : null;
  const confirmingSpec = confirming ? transportSpec(confirming.transport) : null;

  return (
    <Section title="Stack">
      {collectError && (
        <div className="mb-2 whitespace-pre-wrap text-xs text-red-700 dark:text-red-400" role="alert">
          {collectError}
        </div>
      )}
      {selected ? (
        <div className="space-y-density-1">
          {checkpoints.length > 1 && (
            <div className="max-w-md">
              <Select
                aria-label="Stack checkpoint"
                value={selected.checkpointId}
                onChange={(event) => setPicked(event.target.value)}
                options={[...checkpoints].reverse().map((checkpoint) => ({
                  value: checkpoint.checkpointId,
                  label: [
                    formatProcessTimestamp(checkpoint.takenAt),
                    checkpoint.reason,
                    checkpoint.transport,
                    checkpoint.failed ? "failed" : "",
                  ]
                    .filter(Boolean)
                    .join(" · "),
                }))}
              />
            </div>
          )}
          <StackDumpView
            key={`${node.key}:${selected.checkpointId}`}
            records={selected.records}
            {...(buttons ? { headerActions: buttons } : {})}
          />
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            {collecting ? "Collecting stack trace..." : "No stack trace collected yet."}
          </div>
          {buttons}
        </div>
      )}
      <ConfirmDialog
        open={confirming !== null}
        title={`${confirmingSpec?.label(false) ?? ""}?`}
        warning={
          confirmingSpec?.warning?.(node.pid) ??
          `Collecting this stack over ${confirming?.transport ?? ""} terminates pid ${node.pid}.`
        }
        message="The stack is shown here once the dump arrives. Use a non-destructive transport to look without killing."
        confirmLabel={confirmingSpec?.label(false) ?? "Collect"}
        variant="destructive"
        onCancel={() => setConfirming(null)}
        onConfirm={() => {
          const transport = confirming;
          setConfirming(null);
          if (transport) void onCollectStack?.(node.key, transport.transport);
        }}
      />
    </Section>
  );
}

function Overview({
  node,
  samples,
  links,
  ...stack
}: Pick<ProcessTraceDetailProps, "samples" | "links" | "onCollectStack" | "collecting" | "collectError"> & {
  node: ProcessNodeRow;
  stacks: StackRecord[];
}) {
  const exited = isProcessExited(node);
  const series = processSeries(samples, node.key);
  const disk = diskSeries(samples, node.key);
  const lastDisk = { read: disk.read[disk.read.length - 1], write: disk.write[disk.write.length - 1] };
  return (
    <div className="space-y-density-3">
      {links}

      <Section title="Command">
        <pre className="whitespace-pre-wrap break-all rounded bg-blue-50 p-2 font-mono text-xs text-foreground dark:bg-blue-500/10">
          {node.command}
        </pre>
      </Section>

      <Section title="Process">
        <div className="grid grid-cols-2 gap-density-2 text-sm">
          <InfoTile label="Cwd" value={node.cwd || "Unavailable"} wide />
          <InfoTile label="Started" value={formatProcessTimestamp(node.startedAt)} />
          <InfoTile
            label="Exited"
            value={exited ? formatProcessTimestamp(node.exitedAt ?? node.lastSeenAt) : "running"}
          />
          <InfoTile
            label="Lifetime"
            value={`${formatDuration(processLifetimeMs(node))}${exited ? "" : " so far"}`}
          />
        </div>
      </Section>

      <Section title="Resources">
        <div className="grid grid-cols-2 gap-density-1 sm:grid-cols-4">
          <MetricTile
            label="CPU"
            value={formatCpuPercent(node.cpuPercent)}
            barPct={Math.min(100, node.cpuPercent ?? 0)}
            tone={cpuTone(node.cpuPercent ?? 0)}
          />
          <MetricTile label="RSS" value={formatBytes(node.rssBytes)} />
          <MetricTile
            label="Peak CPU"
            value={formatCpuPercent(node.peakCpuPercent)}
            tone={cpuTone(node.peakCpuPercent ?? 0)}
          />
          <MetricTile label="Peak RSS" value={formatBytes(node.peakRssBytes)} />
          {lastDisk.read !== undefined && <MetricTile label="Disk read" value={formatBytes(lastDisk.read)} />}
          {lastDisk.write !== undefined && <MetricTile label="Disk write" value={formatBytes(lastDisk.write)} />}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-density-2">
          <LabeledSparkline label="CPU %" values={series.cpu} format={(value) => `${value.toFixed(1)}%`} />
          <LabeledSparkline label="RSS" values={series.rss} format={formatBytes} />
          {disk.read.length > 0 && <LabeledSparkline label="Disk read" values={disk.read} format={formatBytes} />}
          {disk.write.length > 0 && <LabeledSparkline label="Disk write" values={disk.write} format={formatBytes} />}
        </div>
      </Section>

      <StackSection key={node.key} node={node} {...stack} />
    </div>
  );
}

function FacetTab({
  node,
  samples,
  facet,
}: {
  node: ProcessNodeRow;
  samples: ProcessSampleRow[];
  facet: ProcessSampleFacet;
}) {
  const { label } = SAMPLE_FACETS[facet];
  return (
    <div className="space-y-density-3">
      <LabeledSparkline label={label} values={facetCountSeries(samples, node.key, facet)} format={String} />
      <ProcessFacetTable facet={facet} reading={latestFacetReading(samples, node.key, facet)} />
    </div>
  );
}

/**
 * Everything the trace knows about one process: its command and lifetime,
 * resource usage (CPU, RSS, disk IO) and sparklines, and its stack with a
 * chooser across the checkpoints that dumped it and collect buttons for the
 * transports it offers. Tabs for open files, sockets, ports and connections
 * appear when the samples carry that facet, showing the latest stored list and
 * a count sparkline, and one for the environment when the node recorded it.
 * Props-only: the host supplies the selected row and the trace records.
 */
export function ProcessTraceDetail({
  node,
  samples,
  stacks = NO_STACKS,
  links,
  onCollectStack,
  collecting,
  collectError,
  className,
}: ProcessTraceDetailProps) {
  const [tab, setTab] = useState<DetailTab>("overview");

  if (!node) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        <div className="text-center">
          <Icon icon={UiServerProcess} className="mb-2 block text-4xl" />
          Select a process to view its trace
        </div>
      </div>
    );
  }

  const hasEnvironment = Boolean(node.environment || node.environmentError);
  const tabs: Array<TabItem & { id: DetailTab }> = [
    { id: "overview", label: "Overview" },
    ...(hasEnvironment ? [{ id: "env" as const, label: "Environment" }] : []),
    ...armedFacets(samples).map((facet) => ({ id: facet, label: SAMPLE_FACETS[facet].label })),
  ];
  const active = tabs.some((item) => item.id === tab) ? tab : "overview";

  return (
    <div className={cn("h-full space-y-density-3 overflow-y-auto p-density-4", className)} data-process-detail={node.key}>
      <Header node={node} />
      {tabs.length > 1 && <Tabs tabs={tabs} value={active} onChange={(id) => setTab(id as DetailTab)} />}
      {active === "overview" ? (
        <Overview
          node={node}
          samples={samples}
          stacks={stacks}
          links={links}
          {...(onCollectStack ? { onCollectStack } : {})}
          {...(collecting !== undefined ? { collecting } : {})}
          {...(collectError ? { collectError } : {})}
        />
      ) : active === "env" ? (
        <ProcessFacetTable
          facet="env"
          {...(node.environment ? { environment: node.environment } : {})}
          {...(node.environmentError ? { error: node.environmentError } : {})}
        />
      ) : (
        <FacetTab key={`${node.key}:${active}`} node={node} samples={samples} facet={active} />
      )}
    </div>
  );
}
