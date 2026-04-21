import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Icon } from "../Icon";
import type { GaugeTone } from "../Gauge";
import type { ProcessNode, RunMeta } from "./types";
import { formatBytes, processLabel, processStateColor, processStateIcon } from "./utils";
import { countStackByState, parseStackDump, type ParsedStack } from "./stacktrace";
import { GoroutineCard, goroutineStateDot } from "./GoroutineCard";
import { ThreadCard, threadStateDot } from "./ThreadCard";

const STACK_MIN_LINES = 10;
const STACK_LINE_HEIGHT_REM = 1;
const STACK_MIN_HEIGHT = `${STACK_MIN_LINES * STACK_LINE_HEIGHT_REM}rem`;

function cpuTone(pct: number): GaugeTone {
  if (pct >= 90) return "danger";
  if (pct >= 60) return "warning";
  if (pct > 0) return "success";
  return "neutral";
}

function memoryTone(rss: number | undefined, vms: number | undefined): GaugeTone {
  if (!rss || !vms) return "neutral";
  const ratio = rss / vms;
  if (ratio >= 0.9) return "danger";
  if (ratio >= 0.6) return "warning";
  return "info";
}

export type DiagnosticsDetailPanelProps = {
  process: ProcessNode | null;
  collectBusy?: boolean;
  onCollectStack?: (pid: number) => void | Promise<void>;
  runMeta?: RunMeta;
};

export function DiagnosticsDetailPanel({
  process,
  collectBusy,
  onCollectStack,
  runMeta,
}: DiagnosticsDetailPanelProps) {
  const [search, setSearch] = useState("");
  const [selectedStates, setSelectedStates] = useState<Set<string>>(new Set());
  const [hideRuntimeOnly, setHideRuntimeOnly] = useState(true);
  const stack = process?.stack_capture;
  const parsed = useMemo<ParsedStack>(() => parseStackDump(stack?.text || ""), [stack?.text]);
  const stateCounts = useMemo(() => countStackByState(parsed), [parsed]);
  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const items: Array<{
      state: string;
      userFrameCount: number;
      searchText: string;
    }> = parsed.format === "jvm" ? parsed.threads : parsed.format === "go" ? parsed.goroutines : [];
    return items.filter((item) => {
      if (selectedStates.size > 0 && !selectedStates.has(item.state)) return false;
      if (hideRuntimeOnly && item.userFrameCount === 0) return false;
      if (needle && !item.searchText.includes(needle)) return false;
      return true;
    });
  }, [parsed, search, selectedStates, hideRuntimeOnly]);

  useEffect(() => {
    setSearch("");
    setSelectedStates(new Set());
    setHideRuntimeOnly(true);
  }, [stack?.text, process?.pid]);

  if (!process) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        <div className="text-center">
          <Icon name="codicon:server-process" className="text-4xl mb-density-2" />
          <div>Select a process to view diagnostics</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 flex flex-col gap-density-3 p-density-4">
      <Header process={process} />
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
        <StackBlock
          process={process}
          parsed={parsed}
          stateCounts={stateCounts}
          filtered={filtered}
          search={search}
          setSearch={setSearch}
          selectedStates={selectedStates}
          setSelectedStates={setSelectedStates}
          hideRuntimeOnly={hideRuntimeOnly}
          setHideRuntimeOnly={setHideRuntimeOnly}
          collectBusy={collectBusy}
          onCollectStack={onCollectStack}
        />
      </PanelSection>
    </div>
  );
}

function Header({ process }: { process: ProcessNode }) {
  return (
    <div className="flex items-start justify-between gap-density-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-density-2">
          <Icon
            name={process.is_root ? "codicon:server-process" : "codicon:debug-alt"}
            className="text-2xl text-blue-600"
          />
          <h2 className="text-lg font-bold text-foreground break-words">{processLabel(process)}</h2>
        </div>
        <div className="mt-1 flex items-center gap-density-2 flex-wrap text-xs text-muted-foreground">
          <span className="font-mono">pid {process.pid}</span>
          {process.ppid ? <span className="font-mono">ppid {process.ppid}</span> : null}
          {process.status ? (
            <span
              className={`inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 ${processStateColor(
                process.status,
              )}`}
            >
              <Icon name={processStateIcon(process.status)} />
              {process.status}
            </span>
          ) : null}
        </div>
      </div>
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

type StackFilterItem = { state: string; userFrameCount: number; searchText: string };

type StackBlockProps = {
  process: ProcessNode;
  parsed: ParsedStack;
  stateCounts: Map<string, number>;
  filtered: StackFilterItem[];
  search: string;
  setSearch: (v: string) => void;
  selectedStates: Set<string>;
  setSelectedStates: (updater: (prev: Set<string>) => Set<string>) => void;
  hideRuntimeOnly: boolean;
  setHideRuntimeOnly: (v: boolean) => void;
  collectBusy?: boolean;
  onCollectStack?: (pid: number) => void | Promise<void>;
};

function stackItemCount(parsed: ParsedStack): number {
  if (parsed.format === "jvm") return parsed.threads.length;
  if (parsed.format === "go") return parsed.goroutines.length;
  return 0;
}

function stackItemLabel(parsed: ParsedStack): string {
  if (parsed.format === "jvm") return "threads";
  if (parsed.format === "go") return "goroutines";
  return "frames";
}

function stackStateDot(parsed: ParsedStack, state: string): string {
  return parsed.format === "jvm" ? threadStateDot(state) : goroutineStateDot(state);
}

function StackBlock(props: StackBlockProps) {
  const {
    process,
    parsed,
    stateCounts,
    filtered,
    search,
    setSearch,
    selectedStates,
    setSelectedStates,
    hideRuntimeOnly,
    setHideRuntimeOnly,
    collectBusy,
    onCollectStack,
  } = props;
  const stack = process.stack_capture;

  if (!stack?.text) {
    return (
      <div className="h-full min-h-[14rem] flex flex-col justify-center gap-density-3 p-density-3">
        <div className="space-y-1.5">
          <div
            className={`h-3 w-40 rounded ${collectBusy ? "animate-pulse bg-muted" : "bg-muted/70"}`}
          />
          <div
            className={`h-3 w-full rounded ${collectBusy ? "animate-pulse bg-muted" : "bg-muted/70"}`}
          />
          <div
            className={`h-3 w-5/6 rounded ${collectBusy ? "animate-pulse bg-muted" : "bg-muted/70"}`}
          />
        </div>
        <div className="flex items-center justify-between gap-density-3">
          <div className="text-sm text-muted-foreground">
            {stack?.error
              ? stack.error
              : collectBusy
                ? "Collecting stack trace..."
                : "No stack trace collected yet."}
          </div>
          {onCollectStack && (
            <CollectButton pid={process.pid} busy={collectBusy} onClick={onCollectStack} primary />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 flex flex-col">
      <div className="px-1 py-1.5 space-y-density-2">
        <div className="flex items-center justify-between gap-density-2 text-[11px] text-muted-foreground flex-wrap">
          <div className="flex items-center gap-density-2 flex-wrap">
            <StackStatusBadge status={stack.status} />
            {stack.collected_at && <span>{new Date(stack.collected_at).toLocaleString()}</span>}
            {stackItemCount(parsed) > 0 && (
              <span>
                {filtered.length} / {stackItemCount(parsed)} {stackItemLabel(parsed)}
              </span>
            )}
          </div>
          {onCollectStack && (
            <CollectButton pid={process.pid} busy={collectBusy} onClick={onCollectStack} />
          )}
        </div>
        {stackItemCount(parsed) > 0 && (
          <>
            <div className="flex items-center gap-1.5 flex-wrap">
              <div className="relative min-w-[14rem] flex-1">
                <Icon
                  name="codicon:search"
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs"
                />
                <input
                  className="w-full rounded-md border border-border bg-muted/50 py-1 pl-7 pr-2 text-xs outline-none focus:border-primary focus:bg-background"
                  placeholder={
                    parsed.format === "jvm"
                      ? "Filter by thread name, function, or file"
                      : "Filter by goroutine id, function, or file"
                  }
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <label className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2 py-1 text-[11px] text-muted-foreground">
                <input
                  type="checkbox"
                  checked={hideRuntimeOnly}
                  onChange={(e) => setHideRuntimeOnly(e.target.checked)}
                />
                Hide runtime-only
              </label>
              {(search || selectedStates.size > 0 || !hideRuntimeOnly) && (
                <button
                  className="text-[11px] text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setSearch("");
                    setSelectedStates(() => new Set());
                    setHideRuntimeOnly(true);
                  }}
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {Array.from(stateCounts.entries())
                .sort((a, b) => b[1] - a[1])
                .map(([state, count]) => {
                  const active = selectedStates.has(state);
                  return (
                    <button
                      key={state}
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] transition-colors ${
                        active
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-muted/50 text-muted-foreground hover:bg-background"
                      }`}
                      onClick={() => {
                        setSelectedStates((prev) => {
                          const next = new Set(prev);
                          if (next.has(state)) next.delete(state);
                          else next.add(state);
                          return next;
                        });
                      }}
                    >
                      <span className={`h-2 w-2 rounded-full ${stackStateDot(parsed, state)}`} />
                      {state}
                      <span className="text-[10px] opacity-70">{count}</span>
                    </button>
                  );
                })}
            </div>
          </>
        )}
      </div>
      {stack.error && (
        <div className="mt-density-2 text-xs text-red-600 whitespace-pre-wrap">{stack.error}</div>
      )}
      {stackItemCount(parsed) === 0 ? (
        <pre
          className="flex-1 min-h-0 overflow-auto py-1 text-[11px] text-foreground whitespace-pre-wrap font-mono leading-4"
          style={{ minHeight: STACK_MIN_HEIGHT }}
        >
          {stack.text}
        </pre>
      ) : (
        <div
          className="flex-1 min-h-0 overflow-auto py-1 space-y-1"
          style={{ minHeight: STACK_MIN_HEIGHT }}
        >
          {filtered.length === 0 && (
            <div className="py-density-3 text-center text-xs text-muted-foreground">
              No {stackItemLabel(parsed)} match the current filters.
            </div>
          )}
          {parsed.format === "jvm" &&
            parsed.threads
              .filter((t) => filtered.includes(t))
              .map((t) => (
                <ThreadCard
                  key={t.id}
                  thread={t}
                  search={search}
                  hideRuntimeOnly={hideRuntimeOnly}
                />
              ))}
          {parsed.format === "go" &&
            parsed.goroutines
              .filter((g) => filtered.includes(g))
              .map((goroutine) => (
                <GoroutineCard
                  key={goroutine.id}
                  goroutine={goroutine}
                  search={search}
                  hideRuntimeOnly={hideRuntimeOnly}
                />
              ))}
        </div>
      )}
    </div>
  );
}

function StackStatusBadge({ status }: { status: string }) {
  const cls =
    status === "ready"
      ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300"
      : status === "unsupported"
        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300"
        : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300";
  return <span className={`px-2 py-0.5 rounded-full ${cls}`}>{status}</span>;
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
      <Icon
        name={
          busy
            ? "svg-spinners:ring-resize"
            : primary
              ? "codicon:debug-alt-small"
              : "codicon:refresh"
        }
      />
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

function MetricTile({
  label,
  value,
  barPct,
  tone = "neutral",
}: {
  label: string;
  value: string;
  barPct?: number;
  tone?: GaugeTone;
}) {
  const toneBar: Record<GaugeTone, string> = {
    neutral: "bg-muted-foreground/40",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500",
    info: "bg-blue-500",
  };
  const toneText: Record<GaugeTone, string> = {
    neutral: "text-foreground",
    success: "text-green-600 dark:text-green-400",
    warning: "text-yellow-600 dark:text-yellow-400",
    danger: "text-red-600 dark:text-red-400",
    info: "text-blue-600 dark:text-blue-400",
  };
  return (
    <div className="flex flex-col gap-0.5 rounded-md border border-border bg-background px-density-2 py-1 min-w-0">
      <span className="text-[9px] uppercase tracking-wide text-muted-foreground leading-none">
        {label}
      </span>
      <span className={`text-xs font-semibold tabular-nums truncate ${toneText[tone]}`}>
        {value}
      </span>
      {barPct !== undefined && (
        <div className="h-0.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full ${toneBar[tone]} transition-all duration-300`}
            style={{ width: `${barPct}%` }}
          />
        </div>
      )}
    </div>
  );
}
