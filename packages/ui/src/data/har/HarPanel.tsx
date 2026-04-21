import { useMemo } from "react";
import { DataTable, type DataTableColumn } from "../DataTable";
import { JsonView } from "../JsonView";
import type { HAREntry } from "./types";

export type HarPanelProps = {
  entries: HAREntry[];
  search?: string;
  emptyLabel?: string;
  className?: string;
};

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
    render: (value) => <span title={String(value ?? "")}>{String(value ?? "")}</span>,
  },
  {
    key: "response.status",
    label: "Status",
    shrink: true,
    render: (value) => (
      <span className={statusColor(Number(value ?? 0))}>{String(value ?? "")}</span>
    ),
    sortValue: (value) => Number(value ?? 0),
  },
  {
    key: "time",
    label: "Time",
    align: "right",
    shrink: true,
    render: (value) => `${Number(value ?? 0).toFixed(0)}ms`,
    sortValue: (value) => Number(value ?? 0),
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
}: HarPanelProps) {
  const filteredEntries = useMemo(() => {
    if (search === undefined || search.trim() === "") return entries;
    return entries.filter((entry) => matchesSearch(search.trim().toLowerCase(), entry));
  }, [entries, search]);

  if (!entries || entries.length === 0) {
    return (
      <div className="p-density-6 text-center text-muted-foreground text-sm">{emptyLabel}</div>
    );
  }

  return (
    <div className={`h-full ${className ?? ""}`}>
      <DataTable
        data={filteredEntries}
        columns={COLS}
        autoFilter
        showGlobalFilter={search === undefined}
        globalFilterPlaceholder="Filter URL, method, or body…"
        defaultSort={{ key: "time", dir: "asc" }}
        emptyMessage={emptyLabel}
        getRowId={(entry, index) =>
          `${entry.startedDateTime ?? index}-${entry.request.method}-${entry.request.url}-${entry.time}`
        }
        renderExpandedRow={(entry) => <HarRowDetails entry={entry} />}
      />
    </div>
  );
}

function HarRowDetails({ entry }: { entry: HAREntry }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-density-4">
        <div>
          <HeaderList title="Request Headers" headers={entry.request.headers} />
          {entry.request.postData?.text && (
            <div className="mt-density-2">
              <div className="font-semibold text-foreground mb-1">Request Body</div>
              <div className="bg-background p-density-2 rounded border border-border overflow-auto max-h-48">
                <BodyView
                  text={entry.request.postData.text}
                  mimeType={entry.request.postData.mimeType}
                />
              </div>
            </div>
          )}
        </div>
        <div>
          <HeaderList title="Response Headers" headers={entry.response.headers} />
        </div>
      </div>
      {entry.response.content?.text && (
        <div className="mt-density-3">
          <div className="font-semibold text-foreground mb-1">Response Body</div>
          <div className="bg-background p-density-2 rounded border border-border overflow-auto max-h-64">
            <BodyView
              text={entry.response.content.text}
              mimeType={entry.response.content.mimeType}
            />
          </div>
        </div>
      )}
    </>
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
