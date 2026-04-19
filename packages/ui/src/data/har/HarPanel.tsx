import { useMemo, useState } from "react";
import { useSort } from "../../hooks/use-sort";
import { SortableHeader } from "../SortableHeader";
import { JsonView } from "../JsonView";
import type { HAREntry } from "./types";

export type HarPanelProps = {
  entries: HAREntry[];
  search?: string;
  emptyLabel?: string;
  className?: string;
};

const COLS: { key: string; label: string; cls: string; align?: "left" | "right" }[] = [
  { key: "request.method", label: "Method", cls: "px-2 py-2 w-16" },
  { key: "request.url", label: "URL", cls: "px-2 py-2" },
  { key: "response.status", label: "Status", cls: "px-2 py-2 w-20" },
  { key: "time", label: "Time", cls: "px-2 py-2 w-16 text-right", align: "right" },
  { key: "response.bodySize", label: "Size", cls: "px-2 py-2 w-16 text-right", align: "right" },
  { key: "response.content.mimeType", label: "Type", cls: "px-2 py-2 w-40" },
];

export function HarPanel({
  entries,
  search,
  emptyLabel = "No HTTP traffic captured",
  className,
}: HarPanelProps) {
  const filtered = useMemo(() => {
    if (!search) return entries;
    const needle = search.toLowerCase();
    return entries.filter((e) => matchesSearch(needle, e));
  }, [entries, search]);
  const { sorted, sort, toggle } = useSort(filtered, { defaultKey: "time" });

  if (!entries || entries.length === 0) {
    return (
      <div className="p-density-6 text-center text-muted-foreground text-sm">{emptyLabel}</div>
    );
  }

  return (
    <div className={`overflow-auto h-full ${className ?? ""}`}>
      <table className="w-full text-left table-fixed">
        <thead className="bg-muted/50 sticky top-0">
          <tr className="text-xs text-muted-foreground border-b border-border">
            {COLS.map((c) => (
              <th
                key={c.key}
                className={`${c.cls} cursor-pointer select-none whitespace-nowrap font-medium`}
              >
                <SortableHeader
                  active={sort?.key === c.key}
                  dir={sort?.dir}
                  onClick={() => toggle(c.key)}
                  align={c.align}
                >
                  {c.label}
                </SortableHeader>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((entry, i) => (
            <HarRow key={i} entry={entry} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HarRow({ entry }: { entry: HAREntry }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <tr
        className="hover:bg-accent cursor-pointer text-xs border-b border-border"
        onClick={() => setOpen(!open)}
      >
        <td className="px-2 py-1.5 font-mono font-medium whitespace-nowrap">
          {entry.request.method}
        </td>
        <td className="px-2 py-1.5 font-mono truncate max-w-0" title={entry.request.url}>
          {entry.request.url}
        </td>
        <td
          className={`px-2 py-1.5 font-medium whitespace-nowrap ${statusColor(entry.response.status)}`}
        >
          {entry.response.status}
        </td>
        <td className="px-2 py-1.5 text-right text-muted-foreground whitespace-nowrap tabular-nums">
          {entry.time.toFixed(0)}ms
        </td>
        <td className="px-2 py-1.5 text-right text-muted-foreground whitespace-nowrap tabular-nums">
          {formatBytes(entry.response.bodySize)}
        </td>
        <td className="px-2 py-1.5 text-muted-foreground whitespace-nowrap">
          {entry.response.content?.mimeType || ""}
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={COLS.length} className="bg-muted/50 p-density-3 text-xs">
            <HarRowDetails entry={entry} />
          </td>
        </tr>
      )}
    </>
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

function matchesSearch(needle: string, e: HAREntry): boolean {
  const haystacks = [
    e.request.url,
    e.request.method,
    e.request.postData?.text,
    e.response.content?.text,
  ];
  return haystacks.some((h) => !!h && h.toLowerCase().includes(needle));
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
