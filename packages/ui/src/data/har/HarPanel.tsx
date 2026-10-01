import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useResourceClock } from "../../hooks/use-resource-clock";
import { UiLoader } from "../../icons";
import { formatDuration } from "../../lib/format";
import { DataTable, type DataTableColumn, type DataTableFooterContext } from "../DataTable";
import { Icon } from "../Icon";
import { JsonView } from "../JsonView";
import type { HAREntry } from "./types";

const ERROR_PREVIEW_CHARS = 80;

/** Wall-clock ms shared by every in-flight row, ticking only while one exists. */
const HarClockContext = createContext<number | undefined>(undefined);

export type HarPanelProps = {
  /** HAR entries to render. */
  entries: HAREntry[];
  /** Optional external search term. When omitted, the internal DataTable search is shown. */
  search?: string;
  /** Empty-state label for no entries or no matches. */
  emptyLabel?: string;
  /** Classes applied to the panel root. */
  className?: string;
  /** Optional private body store used only when an expanded row needs a preview. */
  bodySource?: HarPanelBodySource;
};

export type HarPanelBodySource = {
  hasBody: (entry: HAREntry, part: "request" | "response") => boolean;
  preview: (requestId: string, part: "request" | "response") => Promise<string>;
  downloadHref: (entry: HAREntry, part: "request" | "response") => string;
};

export type HarEntryDetailsProps = { entry: HAREntry; bodySource?: HarPanelBodySource | undefined };

const COLS: DataTableColumn<HAREntry>[] = [
  {
    key: "request.method",
    label: "Method",
    shrink: true,
  },
  {
    key: "request.url",
    label: "URL",
    grow: true,
    render: (value, entry) => (
      <span className="inline-flex min-w-0 items-baseline gap-density-2">
        <span title={String(value ?? "")}>{String(value ?? "")}</span>
        {entry._error ? (
          <span className="text-destructive text-xs" title={entry._error}>
            {previewError(entry._error)}
          </span>
        ) : null}
      </span>
    ),
  },
  {
    key: "response.status",
    label: "Status",
    shrink: true,
    render: (value, entry) => <HarStatus status={Number(value ?? 0)} entry={entry} />,
    sortValue: (value) => Number(value ?? 0),
    filterValue: (value, entry) => harStatusLabel(Number(value ?? 0), entry),
  },
  {
    key: "time",
    label: "Time",
    align: "right",
    shrink: true,
    render: (value, entry) =>
      entry._pending ? <PendingElapsed entry={entry} /> : `${Number(value ?? 0).toFixed(0)}ms`,
    sortValue: (value, entry) =>
      entry._pending ? pendingElapsedMs(entry, Date.now()) : Number(value ?? 0),
  },
  {
    key: "response.bodySize",
    label: "Size",
    align: "right",
    shrink: true,
    render: (value) => formatBytes(Number(value ?? 0)),
    sortValue: (value) => Number(value ?? 0),
  },
  {
    key: "response.content.mimeType",
    label: "Type",
    shrink: true,
  },
];

export function HarPanel({
  entries,
  search,
  emptyLabel = "No HTTP traffic captured",
  className,
  bodySource,
}: HarPanelProps) {
  const filteredEntries = useMemo(() => {
    if (search === undefined || search.trim() === "") return entries;
    return entries.filter((entry) => matchesSearch(search.trim().toLowerCase(), entry));
  }, [entries, search]);
  const runningCount = useMemo(() => entries.filter((entry) => entry._pending).length, [entries]);
  const now = useResourceClock(runningCount > 0);

  if (!entries || entries.length === 0) {
    return (
      <div className="p-density-6 text-center text-muted-foreground text-sm">{emptyLabel}</div>
    );
  }

  return (
    // A flex column, not a plain block: DataTable sizes itself as `flex-1
    // min-h-0` so its own scroll region can be bounded, and in a block parent
    // that resolves to content height — the table grows past the panel and
    // nothing scrolls.
    <div className={`flex h-full min-h-0 flex-col ${className ?? ""}`}>
      <HarClockContext.Provider value={now}>
        <DataTable
          data={filteredEntries}
          columns={COLS}
          autoFilter
          showGlobalFilter={search === undefined}
          globalFilterPlaceholder="Filter URL, method, or body…"
          defaultSort={{ key: "time", dir: "asc" }}
          emptyMessage={emptyLabel}
          {...(runningCount > 0
            ? {
                footer: ({ visibleRowCount, totalRowCount }: DataTableFooterContext) =>
                  `${visibleRowCount} of ${totalRowCount} row${totalRowCount === 1 ? "" : "s"} · ${runningCount} running`,
              }
            : {})}
          getRowId={(entry, index) =>
            // `_id` is the same on a request's pending and completed snapshots,
            // so an expanded row survives the transition. Without it, leave out
            // an in-flight entry's `time`, which grows with every snapshot.
            entry._id ??
            `${entry.startedDateTime ?? index}-${entry.request.method}-${entry.request.url}${entry._pending ? "-pending" : `-${entry.time}`}`
          }
          renderExpandedRow={(entry) => <HarEntryDetails entry={entry} bodySource={bodySource} />}
        />
      </HarClockContext.Provider>
    </div>
  );
}

function HarStatus({ status, entry }: { status: number; entry: HAREntry }) {
  if (entry._pending) {
    return (
      <span className="inline-flex items-center gap-1 text-muted-foreground">
        <Icon icon={UiLoader} className="animate-spin" />
        running
      </span>
    );
  }
  if (entry._error) return <span className="font-semibold text-destructive">ERR</span>;
  return <span className={statusColor(status)}>{String(status)}</span>;
}

function PendingElapsed({ entry }: { entry: HAREntry }) {
  const now = useContext(HarClockContext);
  if (now === undefined) throw new Error("PendingElapsed must render inside HarPanel's clock");
  return <span className="tabular-nums">{formatDuration(pendingElapsedMs(entry, now))}</span>;
}

/**
 * Elapsed time of an in-flight request, measured from `startedDateTime` so it
 * keeps ticking between snapshots. The snapshot's `time` is only used when the
 * start timestamp cannot be parsed.
 */
function pendingElapsedMs(entry: HAREntry, now: number): number {
  const started = Date.parse(entry.startedDateTime ?? "");
  if (Number.isNaN(started)) return entry.time;
  // Server and browser clocks can disagree by a little; a negative elapsed is noise.
  return Math.max(0, now - started);
}

function harStatusLabel(status: number, entry: HAREntry): string {
  if (entry._pending) return "running";
  if (entry._error) return "ERR";
  return String(status);
}

function previewError(error: string): string {
  return error.length > ERROR_PREVIEW_CHARS ? `${error.slice(0, ERROR_PREVIEW_CHARS)}…` : error;
}

export function HarEntryDetails({ entry, bodySource }: HarEntryDetailsProps) {
  const parentNow = useContext(HarClockContext);
  const ownNow = useResourceClock(Boolean(entry._pending) && parentNow === undefined);
  return <HarClockContext.Provider value={parentNow ?? ownNow}><HarRowDetails entry={entry} bodySource={bodySource} /></HarClockContext.Provider>;
}

function HarRowDetails({ entry, bodySource }: HarEntryDetailsProps) {
  return (
    <>
      {entry._error && (
        <div className="mb-density-3">
          <div className="font-semibold text-foreground mb-1">Transport Error</div>
          <pre className="whitespace-pre-wrap break-all text-destructive">{entry._error}</pre>
        </div>
      )}
      {entry._pending && (
        <div className="mb-density-3 text-muted-foreground">
          Waiting for response — in flight for <PendingElapsed entry={entry} />
        </div>
      )}
      <div className="grid grid-cols-2 gap-density-4">
        <div>
          <HeaderList
            title="Request Headers"
            {...(entry.request.headers ? { headers: entry.request.headers } : {})}
          />
          {(entry.request.postData?.text || bodySource?.hasBody(entry, "request")) && (
            <BodySection entry={entry} part="request" text={entry.request.postData?.text}
              mimeType={entry.request.postData?.mimeType} bodySource={bodySource} />
          )}
        </div>
        <div>
          <HeaderList
            title="Response Headers"
            {...(entry.response.headers ? { headers: entry.response.headers } : {})}
          />
        </div>
      </div>
      {(entry.response.content?.text || bodySource?.hasBody(entry, "response")) && (
        <BodySection entry={entry} part="response" text={entry.response.content?.text}
          mimeType={entry.response.content?.mimeType} bodySource={bodySource} />
      )}
    </>
  );
}

function BodySection({ entry, part, text, mimeType, bodySource }: {
  entry: HAREntry;
  part: "request" | "response";
  text?: string | undefined;
  mimeType?: string | undefined;
  bodySource?: HarPanelBodySource | undefined;
}) {
  const remote = !text && bodySource?.hasBody(entry, part);
  const requestId = entry._id;
  if (remote && !requestId) throw new Error("Private HAR body requires a request ID");
  const [preview, setPreview] = useState<string | undefined>();
  const [error, setError] = useState<Error | undefined>();
  useEffect(() => {
    if (!remote || !bodySource || !requestId) return;
    let active = true;
    setPreview(undefined);
    setError(undefined);
    bodySource.preview(requestId, part).then(
      (value) => { if (active) setPreview(value); },
      (reason: unknown) => { if (active) setError(reason instanceof Error ? reason : new Error(String(reason))); },
    );
    return () => { active = false; };
  }, [bodySource, requestId, part, remote]);
  return (
    <div className="mt-density-3">
      <div className="mb-1 flex items-center gap-2 font-semibold text-foreground">
        {part === "request" ? "Request Body" : "Response Body"}
        {remote && bodySource && <a className="text-sm font-normal text-primary underline" href={bodySource.downloadHref(entry, part)} download>Download full body</a>}
      </div>
      <div className="bg-background p-density-2 rounded border border-border overflow-auto max-h-64">
        {error ? <span role="alert" className="text-destructive">{error.message}</span>
          : remote && preview === undefined ? <span className="text-muted-foreground">Loading preview…</span>
          : <BodyView text={text || preview || ""} {...(mimeType ? { mimeType } : {})} />}
      </div>
      {remote && <p className="mt-1 text-xs text-muted-foreground">Preview shows at most the first 64 KiB.</p>}
    </div>
  );
}

function HeaderList({
  title,
  headers,
}: {
  title: string;
  headers?: { name: string; value: string }[];
}) {
  return (
    <>
      <div className="font-semibold text-foreground mb-1">{title}</div>
      <div className="space-y-0.5">
        {headers?.map((h, i) => (
          <div key={i} className="whitespace-nowrap">
            <span className="text-purple-600 dark:text-purple-400">{h.name}:</span> {h.value}
          </div>
        ))}
      </div>
    </>
  );
}

function BodyView({ text, mimeType }: { text: string; mimeType?: string }) {
  if (isJsonType(mimeType)) {
    const parsed = tryParseJson(text);
    if (parsed !== null) return <JsonView data={parsed} />;
  }
  return <pre className="whitespace-pre-wrap break-all">{text}</pre>;
}

function tryParseJson(text: string): unknown | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function isJsonType(mime?: string): boolean {
  return !!mime && (mime.includes("json") || mime.includes("javascript"));
}

function matchesSearch(needle: string, entry: HAREntry): boolean {
  return [
    entry.request.method,
    entry.request.url,
    entry.request.postData?.text,
    entry.response.content?.text,
    entry._error,
  ].some((value) => !!value && value.toLowerCase().includes(needle));
}

function formatBytes(bytes: number): string {
  if (bytes < 0) return "";
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

function statusColor(status: number): string {
  if (status >= 500) return "text-red-600";
  if (status >= 400) return "text-amber-600";
  if (status >= 300) return "text-blue-600";
  if (status >= 200) return "text-green-600";
  return "text-muted-foreground";
}
