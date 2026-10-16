import { useEffect, useMemo, useState, type ReactNode } from "react";
import { UiSearch } from "../../icons";
import { Icon } from "../Icon";
import type { StackRecord } from "../traces/types";
import { GoroutineCard } from "./GoroutineCard";
import type { JvmFrameSourceResolver } from "./JvmStackTrace";
import type { StackFrameActions } from "./StackFrameRow";
import { goroutineStateDot, threadStateDot } from "./state-styles";
import { countStackByState, goroutinesFromRecords, parseStackDump, type ParsedStack } from "./stacktrace";
import { ThreadCard } from "./ThreadCard";

const STACK_MIN_LINES = 10;
const STACK_LINE_HEIGHT_REM = 1;
const STACK_MIN_HEIGHT = `${STACK_MIN_LINES * STACK_LINE_HEIGHT_REM}rem`;

/**
 * What the view shows: a raw dump as text (Go goroutines, a JVM thread dump, or
 * any text, shown as is), or the `stacks` records of one dump, which are rendered
 * as they are without parsing any text. Pass exactly one.
 */
type StackDumpSource =
  | { text: string; records?: never }
  | {
      /**
       * The records of one checkpoint of one process: Go goroutine records, a native
       * dump record (its raw text is shown), or a failed dump's record (its error is
       * shown). Keep the array referentially stable while the checkpoint is shown.
       */
      records: StackRecord[];
      text?: never;
    };

export type StackDumpViewProps = StackDumpSource & {
  /** Capture error, shown above the dump. Overrides the error of a failed record. */
  error?: string;
  /** Capture status, drawn as a badge in the meta row. */
  status?: "ready" | "unsupported" | "error" | (string & {});
  /** When the dump was collected (ISO timestamp), shown in the meta row. Defaults to the records' `takenAt`. */
  collectedAt?: string;
  /** Why it was collected (for example a watchdog checkpoint), shown beside the time. Defaults to the records' `reason`. */
  reason?: string;
  /**
   * The dump holds one, already-selected item. Suppresses the per-item filter
   * UI (search, state chips, hide-runtime, count) and the meta row.
   */
  singleItem?: boolean;
  /** Trailing actions on each JVM stack frame, revealed on hover. */
  frameActions?: StackFrameActions;
  /** Supplies inline source under each JVM frame; a missing class must resolve to undefined. */
  resolveSource?: JvmFrameSourceResolver;
  /** Right-aligned actions in the meta row (for example a Collect / Refresh button). */
  headerActions?: ReactNode;
};

type ResolvedDump = { parsed: ParsedStack; text: string; error?: string; collectedAt?: string; reason?: string };

const NO_ITEMS: ParsedStack = { format: "unknown", goroutines: [], threads: [] };

function resolveRecords(records: StackRecord[]): ResolvedDump {
  const failed = records.filter((record) => record.error);
  const live = records.filter((record) => !record.error);
  const go = live.filter((record) => record.format === "go");
  const native = live.filter((record) => record.format === "native");
  if (go.length + native.length !== live.length) {
    const odd = live.find((record) => record.format !== "go" && record.format !== "native");
    throw new Error(`stack record ${odd?.checkpointId} has unknown format "${odd?.format}"; expected "go" or "native"`);
  }
  if (go.length > 0 && native.length > 0) {
    throw new Error("a stack dump cannot mix Go and native records; pass the records of one checkpoint and one process");
  }
  const first = records[0];
  return {
    parsed: go.length > 0 ? { format: "go", goroutines: goroutinesFromRecords(go) } : NO_ITEMS,
    text: native.map((record) => record.raw).join("\n"),
    ...(failed.length > 0 ? { error: failed.map((record) => record.error).join("\n") } : {}),
    ...(first ? { collectedAt: first.takenAt, reason: first.reason } : {}),
  };
}

function resolveDump(text: string | undefined, records: StackRecord[] | undefined): ResolvedDump {
  if (records) return resolveRecords(records);
  if (text === undefined) throw new Error("StackDumpView needs either text or records");
  return { parsed: parseStackDump(text), text };
}

type StackFilterItem = {
  state: string;
  userFrameCount: number;
  searchText: string;
};

function stackItems(parsed: ParsedStack): StackFilterItem[] {
  if (parsed.format === "jvm") return parsed.threads;
  if (parsed.format === "go") return parsed.goroutines;
  return [];
}

function stackItemLabel(parsed: ParsedStack): string {
  if (parsed.format === "jvm") return "threads";
  if (parsed.format === "go") return "goroutines";
  return "frames";
}

function stackStateDot(parsed: ParsedStack, state: string): string {
  return parsed.format === "jvm" ? threadStateDot(state) : goroutineStateDot(state);
}

function StackStatusBadge({ status }: { status: string }) {
  const cls =
    status === "ready"
      ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300"
      : status === "unsupported"
        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300"
        : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300";
  return <span className={`rounded-full px-2 py-0.5 ${cls}`}>{status}</span>;
}

/**
 * A captured stack dump: Go goroutines or JVM threads as searchable cards with
 * state chips and a hide-runtime-only toggle, or the raw text when the format
 * is not recognised. Takes either the raw `text` of a dump, which it parses, or
 * the `stacks` `records` of one dump, which it renders directly (Go goroutine
 * records as cards, a native dump's raw text, a failed dump's error). Filter
 * state resets whenever the text or the records' checkpoint changes.
 */
export function StackDumpView({
  text,
  records,
  error: errorProp,
  status,
  collectedAt: collectedAtProp,
  reason: reasonProp,
  singleItem = false,
  frameActions,
  resolveSource,
  headerActions,
}: StackDumpViewProps) {
  const [search, setSearch] = useState("");
  const [selectedStates, setSelectedStates] = useState<Set<string>>(new Set());
  const [hideRuntimeOnly, setHideRuntimeOnly] = useState(true);
  const resolved = useMemo(() => resolveDump(text, records), [text, records]);
  const { parsed, text: dumpText } = resolved;
  const error = errorProp ?? resolved.error;
  const collectedAt = collectedAtProp ?? resolved.collectedAt;
  const reason = reasonProp ?? resolved.reason;
  const resetKey = records ? `${records[0]?.checkpointId}|${records.length}` : text;
  const stateCounts = useMemo(() => countStackByState(parsed), [parsed]);
  const items = useMemo(() => stackItems(parsed), [parsed]);
  const filtered = useMemo(() => {
    if (singleItem) return items;
    const needle = search.trim().toLowerCase();
    return items.filter((item) => {
      if (selectedStates.size > 0 && !selectedStates.has(item.state)) return false;
      if (hideRuntimeOnly && item.userFrameCount === 0) return false;
      if (needle && !item.searchText.includes(needle)) return false;
      return true;
    });
  }, [items, search, selectedStates, hideRuntimeOnly, singleItem]);

  useEffect(() => {
    setSearch("");
    setSelectedStates(new Set());
    setHideRuntimeOnly(true);
  }, [resetKey]);

  const itemCount = items.length;
  const label = stackItemLabel(parsed);

  return (
    <div className="flex h-full min-h-0 flex-col" data-stack-format={parsed.format}>
      {!singleItem && (
        <div className="space-y-density-2 px-1 py-1.5">
          <div className="flex flex-wrap items-center justify-between gap-density-2 text-[11px] text-muted-foreground">
            <div className="flex flex-wrap items-center gap-density-2">
              {status ? <StackStatusBadge status={status} /> : null}
              {collectedAt ? <span>{new Date(collectedAt).toLocaleString()}</span> : null}
              {reason ? <span data-stack-reason="">{reason}</span> : null}
              {itemCount > 0 && (
                <span>
                  {filtered.length} / {itemCount} {label}
                </span>
              )}
            </div>
            {headerActions}
          </div>
          {itemCount > 0 && (
            <>
              <div className="flex flex-wrap items-center gap-1.5">
                <div className="relative min-w-[14rem] flex-1">
                  <Icon
                    icon={UiSearch}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground"
                  />
                  <input
                    className="w-full rounded-md border border-border bg-muted/50 py-1 pl-7 pr-2 text-xs outline-none focus:border-primary focus:bg-background"
                    aria-label={`Filter ${label}`}
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
                    type="button"
                    className="text-[11px] text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setSearch("");
                      setSelectedStates(new Set());
                      setHideRuntimeOnly(true);
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {Array.from(stateCounts.entries())
                  .sort((a, b) => b[1] - a[1])
                  .map(([state, count]) => {
                    const active = selectedStates.has(state);
                    return (
                      <button
                        type="button"
                        key={state}
                        aria-pressed={active}
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
      )}
      {singleItem && headerActions ? (
        <div className="flex justify-end px-1 py-1.5">{headerActions}</div>
      ) : null}
      {error && <div className="mt-density-2 whitespace-pre-wrap text-xs text-red-600">{error}</div>}
      {itemCount === 0 ? (
        dumpText ? (
          <pre
            className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap py-1 font-mono text-[11px] leading-4 text-foreground"
            style={{ minHeight: STACK_MIN_HEIGHT }}
          >
            {dumpText}
          </pre>
        ) : null
      ) : (
        <div className="min-h-0 flex-1 space-y-1 overflow-auto py-1" style={{ minHeight: STACK_MIN_HEIGHT }}>
          {filtered.length === 0 && (
            <div className="py-density-3 text-center text-xs text-muted-foreground">
              No {label} match the current filters.
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
                  {...(resolveSource ? { resolveSource } : {})}
                  {...(frameActions ? { frameActions } : {})}
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
