import type { ReactNode } from "react";
import { Icon } from "../Icon";
import { UiDebug, UiDebugSmall, UiRefresh, UiServerProcess, UiLoader } from "../../icons";
import type { ProcessNode, RunMeta } from "./types";
import { formatBytes, processLabel, processStateColor, processStateIcon } from "./utils";
import type { StackFrameActions } from "./StackFrameRow";
import type { JvmFrameSourceResolver } from "./JvmStackTrace";
import { MetricTile } from "./MetricTile";
import { cpuTone, memoryTone } from "./metric-tone";
import { StackDumpView } from "./StackDumpView";

export type DiagnosticsDetailPanelProps = {
  /** Selected process; null renders the empty selection state. */
  process: ProcessNode | null;
  /** Shows loading state while stack capture is being collected. */
  collectBusy?: boolean;
  /** Called when the user requests a fresh stack capture. */
  onCollectStack?: (pid: number) => void | Promise<void>;
  /** Optional run metadata rendered above diagnostics. */
  runMeta?: RunMeta;
  /**
   * Optional resolver that supplies inline source under each JVM stack frame,
   * so the rendered thread dump can be augmented in place (e.g. with decompiled
   * source). A missing class must resolve to undefined, never throw.
   */
  resolveSource?: JvmFrameSourceResolver;
  /**
   * Optional trailing actions rendered on each stack frame, revealed on hover.
   * Lets a host app hang per-frame affordances (trace/watch/decompile) off the
   * rendered thread dump.
   */
  frameActions?: StackFrameActions;
  /**
   * Caller-supplied action buttons rendered right-aligned in the header row,
   * next to the title and Refresh. Use for download/decompile-style actions.
   */
  headerActions?: ReactNode;
  /**
   * The capture holds a single, already-selected item (e.g. one thread the
   * caller picked from its own list). Suppresses the redundant per-item filter
   * UI (search box, state chips, hide-runtime, count) and lifts Refresh into
   * the header row so the detail view shows just that item's frames.
   */
  singleItem?: boolean;
};

export function DiagnosticsDetailPanel({
  process,
  collectBusy,
  onCollectStack,
  runMeta,
  resolveSource,
  frameActions,
  headerActions,
  singleItem,
}: DiagnosticsDetailPanelProps) {
  if (!process) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        <div className="text-center">
          <Icon icon={UiServerProcess} className="text-4xl mb-density-2" />
          <div>Select a process to view diagnostics</div>
        </div>
      </div>
    );
  }

  const stack = process.stack_capture;

  return (
    <div className="h-full min-h-0 flex flex-col gap-density-3 p-density-4">
      <Header
        process={process}
        actions={
          <div className="flex items-center gap-density-2">
            {singleItem && onCollectStack && (
              <CollectButton pid={process.pid} busy={collectBusy ?? false} onClick={onCollectStack} />
            )}
            {headerActions}
          </div>
        }
      />
      {runMeta && <RunSection runMeta={runMeta} />}
      {process.command && (
        <PanelSection title="Command">
          <pre className="text-xs text-foreground whitespace-pre-wrap font-mono bg-blue-50 dark:bg-blue-500/10 rounded p-2 break-all">
            {process.command}
          </pre>
        </PanelSection>
      )}

      <PanelSection title="Metrics">
        <ProcessMetrics process={process} />
      </PanelSection>

      <PanelSection title="Stack" grow>
        {stack?.text ? (
          <StackDumpView
            key={process.pid}
            text={stack.text}
            status={stack.status}
            singleItem={singleItem ?? false}
            {...(stack.error ? { error: stack.error } : {})}
            {...(stack.collected_at ? { collectedAt: stack.collected_at } : {})}
            {...(resolveSource ? { resolveSource } : {})}
            {...(frameActions ? { frameActions } : {})}
            {...(onCollectStack && !singleItem
              ? {
                  headerActions: (
                    <CollectButton
                      pid={process.pid}
                      busy={collectBusy ?? false}
                      onClick={onCollectStack}
                    />
                  ),
                }
              : {})}
          />
        ) : (
          <StackPlaceholder
            error={stack?.error}
            busy={collectBusy ?? false}
            pid={process.pid}
            {...(onCollectStack ? { onCollectStack } : {})}
          />
        )}
      </PanelSection>
    </div>
  );
}

function Header({ process, actions }: { process: ProcessNode; actions?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-density-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-density-2 flex-wrap">
          <Icon
            icon={process.is_root ? UiServerProcess : UiDebug}
            className="text-2xl text-blue-600"
          />
          <h2 className="text-lg font-bold text-foreground break-words">{processLabel(process)}</h2>
          {process.status ? (
            <span
              className={`inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs ${processStateColor(
                process.status,
              )}`}
            >
              <Icon icon={processStateIcon(process.status)} />
              {process.status}
            </span>
          ) : null}
        </div>
        <div className="mt-1 flex items-center gap-density-2 flex-wrap text-xs text-muted-foreground">
          <span className="font-mono">pid {process.pid}</span>
          {process.ppid ? <span className="font-mono">ppid {process.ppid}</span> : null}
        </div>
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}

function RunSection({ runMeta }: { runMeta: RunMeta }) {
  return (
    <PanelSection title="Run">
      <div className="grid grid-cols-2 gap-density-2 text-sm">
        <InfoTile
          label={runMeta.kind === "rerun" ? `Rerun #${runMeta.sequence}` : "Initial run"}
          value={runMeta.started ? new Date(runMeta.started).toLocaleString() : "Unavailable"}
        />
        <InfoTile
          label="Finished"
          value={runMeta.ended ? new Date(runMeta.ended).toLocaleString() : "In progress"}
        />
      </div>
    </PanelSection>
  );
}

function StackPlaceholder({
  error,
  busy,
  pid,
  onCollectStack,
}: {
  error: string | undefined;
  busy: boolean;
  pid: number;
  onCollectStack?: (pid: number) => void | Promise<void>;
}) {
  const bar = busy ? "animate-pulse bg-muted" : "bg-muted/70";
  return (
    <div className="h-full min-h-[14rem] flex flex-col justify-center gap-density-3 p-density-3">
      <div className="space-y-1.5">
        <div className={`h-3 w-40 rounded ${bar}`} />
        <div className={`h-3 w-full rounded ${bar}`} />
        <div className={`h-3 w-5/6 rounded ${bar}`} />
      </div>
      <div className="flex items-center justify-between gap-density-3">
        <div className="text-sm text-muted-foreground">
          {error ? error : busy ? "Collecting stack trace..." : "No stack trace collected yet."}
        </div>
        {onCollectStack && <CollectButton pid={pid} busy={busy} onClick={onCollectStack} primary />}
      </div>
    </div>
  );
}

function CollectButton({
  pid,
  busy,
  onClick,
  primary,
}: {
  pid: number;
  busy?: boolean;
  onClick: (pid: number) => void | Promise<void>;
  primary?: boolean;
}) {
  const base =
    "shrink-0 text-[11px] px-2 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1";
  const style = primary
    ? "bg-primary text-primary-foreground hover:bg-primary/90"
    : "border border-border text-muted-foreground hover:bg-accent";
  return (
    <button
      className={`${base} ${style}`}
      onClick={() => onClick(pid)}
      disabled={busy}
      title={primary ? "Collect the latest stack trace" : "Refresh stack trace"}
    >
      <Icon icon={busy ? UiLoader : primary ? UiDebugSmall : UiRefresh} />
      {busy ? "Collecting..." : primary ? "Collect stack trace" : "Refresh"}
    </button>
  );
}

function PanelSection({
  title,
  grow,
  children,
}: {
  title: string;
  grow?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={grow ? "flex min-h-0 flex-1 flex-col" : ""}>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
        {title}
      </div>
      {grow ? <div className="flex-1 min-h-0 overflow-hidden">{children}</div> : children}
    </section>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border rounded-lg bg-muted/50 px-2.5 py-density-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-xs font-medium text-foreground mt-0.5">{value}</div>
    </div>
  );
}

function ProcessMetrics({ process }: { process: ProcessNode }) {
  const cpu = process.cpu_percent || 0;
  const rss = process.rss;
  const vms = process.vms;
  const memRatioPct = rss && vms && vms > 0 ? Math.min(100, Math.round((rss / vms) * 100)) : 0;
  return (
    <div className="grid grid-cols-4 gap-density-1">
      <MetricTile
        label="CPU"
        value={`${cpu.toFixed(1)}%`}
        barPct={Math.min(100, cpu)}
        tone={cpuTone(cpu)}
      />
      <MetricTile
        label="RSS"
        value={rss !== undefined ? formatBytes(rss) : "n/a"}
        barPct={memRatioPct}
        tone={memoryTone(rss, vms)}
      />
      <MetricTile label="VMS" value={vms !== undefined ? formatBytes(vms) : "n/a"} tone="neutral" />
      <MetricTile
        label="Files"
        value={process.open_files !== undefined ? String(process.open_files) : "n/a"}
        barPct={process.open_files ? Math.min(100, (process.open_files / 1024) * 100) : 0}
        tone="info"
      />
    </div>
  );
}
