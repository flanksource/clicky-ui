import { useEffect, useMemo, useState, type ReactNode } from "react";
import type {
  FilterBarFilter,
  FilterBarRangeProps,
  FilterBarSearchProps,
} from "../components/FilterBar";
import { DataTable, type DataTableColumn, type DataTablePagination } from "../data/DataTable";
import {
  Clicky,
  parseClickyData,
  type ClickyCommandRuntime,
  type ClickyDocument,
  type ClickyNode,
  type ClickyTableRowClick,
  type ClickyTableRowHref,
  type ClickyTableRowPredicate,
} from "../data/Clicky";
import { JsonView } from "../data/JsonView";
import { cn } from "../lib/utils";
import type { ExecutionResponse } from "./types";

export type CommandOutputProps = {
  response?: ExecutionResponse | null;
  loading?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  ariaLabel?: string;
  className?: string;
  bare?: boolean;
  commandRuntime?: ClickyCommandRuntime;
  onTableRowClick?: ClickyTableRowClick;
  getTableRowHref?: ClickyTableRowHref;
  isTableRowClickable?: ClickyTableRowPredicate;
  search?: FilterBarSearchProps;
  timeRange?: FilterBarRangeProps;
  externalFilters?: FilterBarFilter[];
  pagination?: DataTablePagination;
};

type LoadingResultRow = {
  result: string;
  status: string;
  updated: string;
  details: string;
};

const LOADING_RESULT_COLUMNS: DataTableColumn<LoadingResultRow>[] = [
  { key: "result", label: "Result", grow: true },
  { key: "status", label: "Status", shrink: true },
  { key: "updated", label: "Updated", shrink: true },
  { key: "details", label: "Details", grow: true },
];

export function CommandOutput({
  response,
  loading = false,
  loadingMessage = "Loading execution results…",
  emptyMessage = "No response yet.",
  ariaLabel,
  className,
  bare = false,
  commandRuntime,
  onTableRowClick,
  getTableRowHref,
  isTableRowClickable,
  search,
  timeRange,
  externalFilters,
  pagination,
}: CommandOutputProps) {
  const text = response?.stdout || response?.output || "";
  const ct = response?.contentType || "application/json";

  const parsed = useMemo(() => {
    if (!response) return null;
    if (response.parsed !== undefined) return response.parsed;
    if (!text.trim()) return null;
    try {
      return JSON.parse(text.trim());
    } catch {
      return null;
    }
  }, [response, text]);

  let output: ReactNode;
  if (response) {
    output = (
      <OutputBody
        text={text}
        parsed={parsed}
        contentType={ct}
        bare={bare}
        {...(response.requestUrl ? { url: response.requestUrl } : {})}
        {...(response.blob ? { blob: response.blob } : {})}
        {...(commandRuntime ? { commandRuntime } : {})}
        {...(onTableRowClick ? { onTableRowClick } : {})}
        {...(getTableRowHref ? { getTableRowHref } : {})}
        {...(isTableRowClickable ? { isTableRowClickable } : {})}
        {...(search ? { search } : {})}
        {...(timeRange ? { timeRange } : {})}
        {...(externalFilters ? { externalFilters } : {})}
        {...(pagination ? { pagination } : {})}
      />
    );
  } else if (loading) {
    output = <LoadingOutput loadingMessage={loadingMessage} />;
  } else {
    output = <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  const pending = loading && response ? (
    <div
      role="status"
      className="rounded-md border border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground"
    >
      {loadingMessage}
    </div>
  ) : null;

  const content = bare || !response ? (
    <div className="space-y-2">
      {pending}
      {output}
    </div>
  ) : (
    <div className="space-y-3">
      {pending}
      <div className="flex items-center gap-2">
        <span
          className={
            response.success
              ? "rounded-md border px-2 py-0.5 text-xs"
              : "rounded-md bg-destructive px-2 py-0.5 text-xs text-destructive-foreground"
          }
        >
          {response.success ? "Success" : "Failed"}
        </span>
        <span className="rounded-md border px-2 py-0.5 font-mono text-xs">
          exit {response.exit_code}
        </span>
        {ct !== "application/json" && (
          <span className="rounded-md bg-secondary px-2 py-0.5 font-mono text-xs text-secondary-foreground">
            {ct.split(";")[0]}
          </span>
        )}
        {response.error && <span className="text-sm text-destructive">{response.error}</span>}
      </div>

      {response.cli && (
        <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">
          $ {response.cli}
        </pre>
      )}

      {output}
    </div>
  );

  if (ariaLabel || className) {
    return (
      <div
        role={ariaLabel ? "region" : undefined}
        aria-label={ariaLabel}
        aria-busy={loading || undefined}
        className={cn("mt-3", className)}
      >
        {content}
      </div>
    );
  }

  return content;
}

function OutputBody({
  text,
  parsed,
  contentType,
  url,
  blob,
  bare,
  commandRuntime,
  onTableRowClick,
  getTableRowHref,
  isTableRowClickable,
  search,
  timeRange,
  externalFilters,
  pagination,
}: {
  text: string;
  parsed: unknown;
  contentType: string;
  url?: string;
  blob?: Blob;
  bare?: boolean;
  commandRuntime?: ClickyCommandRuntime;
  onTableRowClick?: ClickyTableRowClick;
  getTableRowHref?: ClickyTableRowHref;
  isTableRowClickable?: ClickyTableRowPredicate;
  search?: FilterBarSearchProps;
  timeRange?: FilterBarRangeProps;
  externalFilters?: FilterBarFilter[];
  pagination?: DataTablePagination;
}) {
  const ct = (contentType.split(";")[0] ?? "").trim();

  if (ct === "application/pdf" && blob) {
    return <PdfOutput blob={blob} />;
  }

  const clickyPayload: string | ClickyNode | ClickyDocument | undefined =
    typeof parsed === "string" || (parsed != null && typeof parsed === "object")
      ? (parsed as ClickyNode | ClickyDocument)
      : text;
  const parsedClicky = clickyPayload === "" ? null : parseClickyData(clickyPayload);

  if (
    parsedClicky?.ok ||
    ct === "application/clicky+json" ||
    ct === "application/json+clicky"
  ) {
    const clicky = (
      <Clicky
        data={
          parsedClicky?.ok
            ? parsedClicky.document
            : ((parsed as Parameters<typeof Clicky>[0]["data"]) ?? text)
        }
        {...(url ? { url } : {})}
        {...(commandRuntime ? { commandRuntime } : {})}
        {...(onTableRowClick ? { onTableRowClick } : {})}
        {...(getTableRowHref ? { getTableRowHref } : {})}
        {...(isTableRowClickable ? { isTableRowClickable } : {})}
        {...(search ? { search } : {})}
        {...(timeRange ? { timeRange } : {})}
        {...(externalFilters ? { externalFilters } : {})}
        {...(pagination ? { pagination } : {})}
      />
    );

    const detailOutput = <div className="detail-output">{clicky}</div>;
    if (bare) return detailOutput;

    return (
      <Tabs
        defaultValue="rendered"
        tabs={[
          { value: "rendered", label: "Rendered", content: detailOutput },
          { value: "raw", label: "Raw", content: <TextOutput text={text} /> },
        ]}
      />
    );
  }

  if (ct === "text/html") {
    const iframe = (
      <iframe
        srcDoc={text}
        className="h-[600px] w-full rounded-md border bg-background"
        sandbox="allow-same-origin"
      />
    );
    if (bare) return iframe;
    return (
      <Tabs
        defaultValue="preview"
        tabs={[
          { value: "preview", label: "Preview", content: iframe },
          { value: "source", label: "Source", content: <TextOutput text={text} /> },
        ]}
      />
    );
  }

  if (parsed) {
    const json = <JsonViewer data={parsed} />;
    if (bare) return json;
    return (
      <Tabs
        defaultValue="output"
        tabs={[
          { value: "output", label: "Output", content: json },
          { value: "raw", label: "Raw", content: <TextOutput text={text} /> },
        ]}
      />
    );
  }

  if (text) return <TextOutput text={text} />;

  return <p className="py-4 text-sm text-muted-foreground">No output</p>;
}

function LoadingOutput({ loadingMessage }: { loadingMessage: string }) {
  return (
    <DataTable<LoadingResultRow>
      data={[]}
      columns={LOADING_RESULT_COLUMNS}
      loading
      loadingMessage={loadingMessage}
      loadingRowCount={8}
      showGlobalFilter={false}
      showDensityControl={false}
      hideableColumns={false}
      resizableColumns={false}
      persistColumnWidths={false}
      persistColumnVisibility={false}
      persistDensity={false}
    />
  );
}

function PdfOutput({ blob }: { blob: Blob }) {
  const [url, setURL] = useState("");

  useEffect(() => {
    const next = URL.createObjectURL(blob);
    setURL(next);
    return () => URL.revokeObjectURL(next);
  }, [blob]);

  if (!url) return null;
  return (
    <div className="space-y-2">
      <a
        href={url}
        download="output.pdf"
        className="inline-block rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
      >
        Download PDF
      </a>
      <iframe src={url} className="h-[600px] w-full rounded-md border" />
    </div>
  );
}

function JsonViewer({ data }: { data: unknown }) {
  return (
    <div className="overflow-auto rounded-md bg-muted p-4 font-mono text-xs">
      <JsonView data={data as object | unknown[]} defaultOpenDepth={Number.MAX_SAFE_INTEGER} />
    </div>
  );
}

function TextOutput({
  text,
  variant = "default",
}: {
  text: string;
  variant?: "default" | "error";
}) {
  return (
    <pre
      className={`max-h-96 overflow-auto whitespace-pre-wrap rounded-md p-4 font-mono text-sm ${
        variant === "error"
          ? "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200"
          : "bg-muted"
      }`}
    >
      {text}
    </pre>
  );
}

function Tabs({
  defaultValue,
  tabs,
}: {
  defaultValue: string;
  tabs: Array<{ value: string; label: string; content: ReactNode }>;
}) {
  const [value, setValue] = useState(defaultValue);
  const active = tabs.find((tab) => tab.value === value) ?? tabs[0];
  if (!active) return null;
  return (
    <div className="space-y-3">
      <div className="inline-flex rounded-md border bg-muted p-1">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={`rounded px-2 py-1 text-xs ${
              tab.value === active.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
            onClick={() => setValue(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{active.content}</div>
    </div>
  );
}
