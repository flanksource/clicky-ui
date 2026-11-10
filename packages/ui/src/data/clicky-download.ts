import type { StaticIconComponent } from "./Icon";
import {
  UiComment,
  UiEye,
  UiFileCode,
  UiFileSpreadsheet,
  UiFileText,
  UiJson,
  UiMarkdown,
  UiTable,
} from "../icons";
import type { DataTablePagination } from "./DataTable";
import type {
  ClickyExportFormatOption,
  ClickyExportScopeOption,
} from "./clicky-export/ClickyExportDialog";
import { stripSurroundingChars } from "../lib/string";

// Remote format and download helpers shared by the Clicky viewer and
// useClickyTableMenu. Kept out of Clicky.tsx so the hook can be exported without
// breaking fast refresh (react/only-export-components).

export const CLICKY_PRIMARY_VIEW_FORMATS = ["clicky", "json"] as const;
export const CLICKY_OVERFLOW_VIEW_FORMATS = [
  "pdf",
  "html",
  "markdown",
  "yaml",
  "csv",
  "pretty",
  "excel",
  "slack",
] as const;
const CLICKY_DOWNLOAD_FORMATS = [
  "yaml",
  "json",
  "csv",
  "pdf",
  "markdown",
] as const;

export type ClickyPrimaryViewFormat =
  (typeof CLICKY_PRIMARY_VIEW_FORMATS)[number];
export type ClickyOverflowViewFormat =
  (typeof CLICKY_OVERFLOW_VIEW_FORMATS)[number];
export type ClickyRemoteFormat =
  | ClickyPrimaryViewFormat
  | ClickyOverflowViewFormat
  | "ndjson";

export type ClickyDownloadOptions = {
  /** Show all advertised download formats in the overflow menu. */
  all?: boolean;
  /** Override the download menu label. */
  label?: string;
  /** Formats advertised by the endpoint. Defaults to Clicky's legacy set. */
  formats?: ClickyRemoteFormat[];
  /** Result ranges advertised by the endpoint. Legacy endpoints omit this. */
  scopes?: ClickyDownloadScope[];
  /** Whether all-row export streams or uses a compatibility buffer. */
  allRowsMode?: "streaming" | "buffered";
  /** Per-format server row caps, for example `{ pdf: 1000 }`. */
  formatMaxRows?: Partial<Record<ClickyRemoteFormat, number>>;
  /** Prepare an export-specific resource before the native download starts. */
  prepare?: (request: {
    format: ClickyRemoteFormat;
    scope?: ClickyDownloadScope;
  }) => Promise<{ url: string; label?: string }>;
};

export type ClickyDownloadScope = "page" | "all";

export function getDownloadFormats({
  url,
  download,
}: {
  url?: string | undefined;
  download?: ClickyDownloadOptions | undefined;
}): ClickyRemoteFormat[] {
  const enabled = download ? (download.all ?? true) : !!url;

  if (!enabled || !url) {
    return [];
  }

  return download?.formats?.length
    ? [...download.formats]
    : [...CLICKY_DOWNLOAD_FORMATS];
}

function getDownloadScopes(
  download?: ClickyDownloadOptions,
): Array<ClickyDownloadScope | undefined> {
  return download?.scopes?.length ? download.scopes : [undefined];
}

function downloadDescription(
  format: ClickyRemoteFormat,
  scope: ClickyDownloadScope | undefined,
  download?: ClickyDownloadOptions,
) {
  const maxRows = download?.formatMaxRows?.[format];
  if (maxRows) {
    return `Limited to ${maxRows.toLocaleString()} rows`;
  }
  if (scope === "all" && download?.allRowsMode === "buffered") {
    return "Compatibility mode buffers the complete result";
  }
  if (scope === "all" && download?.allRowsMode === "streaming") {
    return "Streams rows as they are read";
  }
  return undefined;
}

// exportFormatOptions describes the advertised formats for the export dialog.
// The dialog is presentational and knows nothing about Clicky's formats, so the
// labels, icons and blurbs are resolved here, from the same metadata the view
// switcher reads.
export function exportFormatOptions({
  url,
  download,
}: {
  url?: string | undefined;
  download?: ClickyDownloadOptions | undefined;
}): ClickyExportFormatOption[] {
  if (!url) return [];
  return getDownloadFormats({ url, download }).map((format) => {
    const meta = getRemoteFormatMeta(format);
    return {
      format,
      label: meta.label,
      description: meta.description,
      icon: meta.icon,
      ...(meta.iconClassName ? { iconClassName: meta.iconClassName } : {}),
    };
  });
}

// exportScopeOptions describes the ranges the endpoint serves. The per-format
// note is a function rather than a string because a ceiling belongs to a format
// and a range together: a PDF stops at 1,000 rows, the CSV beside it does not.
//
// The all-rows label carries the count the table was told, because "all" is the
// one number a person needs before starting an export and the only one the page
// in front of them does not show.
export function exportScopeOptions(
  download?: ClickyDownloadOptions,
  pagination?: DataTablePagination,
): ClickyExportScopeOption[] {
  return getDownloadScopes(download).map((scope) => ({
    scope,
    label:
      scope === "all" || scope === undefined
        ? allRowsLabel(pagination)
        : "Current page",
    note: (format: string) =>
      downloadDescription(format as ClickyRemoteFormat, scope, download),
  }));
}

// allRowsLabel states the total when the backend gave one. A "gte" total is a
// lower bound a backend stopped counting at, so it is rendered as one rather
// than as a count nobody promised.
function allRowsLabel(pagination?: DataTablePagination): string {
  const total = pagination?.total;
  if (total === undefined) return "All rows";
  const count = total.toLocaleString();
  return pagination?.totalRelation === "gte"
    ? `All ${count}+ rows`
    : `All ${count} rows`;
}

// runClickyDownload is prepareDownload for a caller that awaits it. The export
// dialog reports its own failure and stays open on one, so the reason has to
// come back as a rejection rather than through a callback.
export async function runClickyDownload({
  url,
  format,
  scope,
  download,
}: {
  url: string;
  format: ClickyRemoteFormat;
  scope?: ClickyDownloadScope | undefined;
  download?: ClickyDownloadOptions | undefined;
}): Promise<void> {
  let failure = "";
  await prepareDownload({
    url,
    format,
    ...(scope ? { scope } : {}),
    ...(download ? { download } : {}),
    onError: (message) => {
      failure = message;
    },
  });
  if (failure) throw new Error(failure);
}

async function prepareDownload({
  url,
  format,
  scope,
  download,
  onPending,
  onError,
}: {
  url: string;
  format: ClickyRemoteFormat;
  scope?: ClickyDownloadScope | undefined;
  download?: ClickyDownloadOptions | undefined;
  onPending?: ((pending: boolean) => void) | undefined;
  onError?: ((message: string) => void) | undefined;
}) {
  onError?.("");
  onPending?.(true);
  try {
    const prepared = download?.prepare
      ? await download.prepare({ format, ...(scope ? { scope } : {}) })
      : { url, ...(download?.label ? { label: download.label } : {}) };
    if (!prepared.url.trim()) {
      throw new Error("The prepared download URL is empty");
    }
    triggerDownload(
      buildDownloadUrl(
        prepared.url,
        format,
        prepared.label ?? download?.label,
        scope,
      ),
    );
  } catch (error) {
    onError?.(
      error instanceof Error ? error.message : "Preparing the download failed",
    );
  } finally {
    onPending?.(false);
  }
}

export function getRemoteFormatMeta(format: ClickyRemoteFormat): {
  label: string;
  description: string;
  icon: StaticIconComponent;
  iconClassName?: string;
  accept: string;
} {
  switch (format) {
    case "clicky":
      return {
        label: "Clicky",
        description: "Rendered Clicky JSON with the rich Clicky viewer",
        icon: UiEye,
        accept:
          "application/json+clicky, application/clicky+json;q=0.9, application/json;q=0.8,*/*;q=0.7",
      };
    case "json":
      return {
        label: "JSON",
        description: "Plain JSON for inspecting the raw response body",
        icon: UiJson,
        accept: "application/json, text/plain;q=0.8,*/*;q=0.7",
      };
    case "ndjson":
      return {
        label: "NDJSON",
        description: "Newline-delimited JSON for streaming data pipelines",
        icon: UiJson,
        accept: "application/x-ndjson, application/ndjson;q=0.9,*/*;q=0.7",
      };
    case "pdf":
      return {
        label: "PDF",
        description: "Portable document for sharing and printing",
        icon: UiFileText,
        iconClassName: "text-rose-600 dark:text-rose-400",
        accept: "application/pdf, */*;q=0.7",
      };
    case "html":
      return {
        label: "HTML",
        description: "Browser-ready HTML preview of the formatted output",
        icon: UiFileCode,
        accept: "text/html, */*;q=0.7",
      };
    case "markdown":
      return {
        label: "Markdown",
        description: "Markdown formatted for docs, comments, and chat",
        icon: UiMarkdown,
        accept: "text/markdown, text/plain;q=0.8,*/*;q=0.7",
      };
    case "yaml":
      return {
        label: "YAML",
        description: "YAML for config-friendly inspection and export",
        icon: UiFileCode,
        iconClassName: "text-violet-600 dark:text-violet-400",
        accept: "application/yaml, text/yaml;q=0.9, text/plain;q=0.8,*/*;q=0.7",
      };
    case "csv":
      return {
        label: "CSV",
        description: "Comma-separated values for spreadsheets and imports",
        icon: UiFileSpreadsheet,
        iconClassName: "text-emerald-600 dark:text-emerald-400",
        accept: "text/csv, text/plain;q=0.8,*/*;q=0.7",
      };
    case "pretty":
      return {
        label: "Pretty",
        description: "Human-readable plain text output from the formatter",
        icon: UiFileCode,
        accept: "text/plain, */*;q=0.7",
      };
    case "excel":
      return {
        label: "Excel",
        description: "Spreadsheet workbook for offline analysis",
        icon: UiTable,
        accept:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, */*;q=0.7",
      };
    case "slack":
      return {
        label: "Slack",
        description: "Slack Block Kit JSON for chat-native output",
        icon: UiComment,
        accept:
          "application/vnd.slack.block-kit+json, application/json;q=0.8,*/*;q=0.7",
      };
  }
}

export function buildFormatUrl(url: string, format: ClickyRemoteFormat) {
  const base =
    typeof window === "undefined" ? "http://localhost" : window.location.origin;
  const resolved = new URL(url, base);
  resolved.searchParams.set(
    "format",
    format === "clicky" ? "clicky-json" : format,
  );

  if (isAbsoluteUrl(url)) {
    return resolved.toString();
  }

  return `${resolved.pathname}${resolved.search}${resolved.hash}`;
}

function buildDownloadUrl(
  url: string,
  format: ClickyRemoteFormat,
  label?: string | undefined,
  scope?: ClickyDownloadScope | undefined,
) {
  const formatted = buildFormatUrl(url, format);
  const base =
    typeof window === "undefined" ? "http://localhost" : window.location.origin;
  const resolved = new URL(formatted, base);
  resolved.searchParams.set("filename", downloadFilename(url, format, label));
  resolved.searchParams.set("_download", Date.now().toString());
  if (scope) {
    resolved.searchParams.set("scope", scope);
  }
  if (scope === "all") {
    resolved.searchParams.delete("limit");
    resolved.searchParams.delete("offset");
    resolved.searchParams.delete("page");
  }

  if (isAbsoluteUrl(formatted)) {
    return resolved.toString();
  }

  return `${resolved.pathname}${resolved.search}${resolved.hash}`;
}

function downloadFilename(
  url: string,
  format: ClickyRemoteFormat,
  label?: string | undefined,
) {
  const stem = sanitizeFilenameStem(
    label || filenameStemFromUrl(url) || "clicky-output",
  );
  return `${stem}${downloadExtension(format)}`;
}

function filenameStemFromUrl(url: string) {
  const base =
    typeof window === "undefined" ? "http://localhost" : window.location.origin;
  const resolved = new URL(url, base);
  const segment = resolved.pathname.split("/").filter(Boolean).at(-1);
  return segment ?? "";
}

function sanitizeFilenameStem(value: string) {
  const cleaned = stripSurroundingChars(
    value
      .trim()
      .replace(/\.[a-z0-9]+$/i, "")
      .replace(/[^a-z0-9._-]+/gi, "-")
      .replace(/-+/g, "-"),
    "._-",
  );

  return cleaned || "clicky-output";
}

function downloadExtension(format: ClickyRemoteFormat) {
  switch (format) {
    case "clicky":
      return ".clicky.json";
    case "json":
      return ".json";
    case "ndjson":
      return ".ndjson";
    case "pdf":
      return ".pdf";
    case "html":
      return ".html";
    case "markdown":
      return ".md";
    case "yaml":
      return ".yaml";
    case "csv":
      return ".csv";
    case "pretty":
      return ".txt";
    case "excel":
      return ".xlsx";
    case "slack":
      return ".slack.json";
  }
}

const CLICKY_DOWNLOAD_FRAME_ID = "clicky-download-frame";

function triggerDownload(url: string) {
  if (typeof document === "undefined") return;

  let frame = document.getElementById(
    CLICKY_DOWNLOAD_FRAME_ID,
  ) as HTMLIFrameElement | null;
  if (!frame) {
    frame = document.createElement("iframe");
    frame.id = CLICKY_DOWNLOAD_FRAME_ID;
    frame.name = CLICKY_DOWNLOAD_FRAME_ID;
    frame.title = "Clicky download target";
    frame.setAttribute("aria-hidden", "true");
    frame.tabIndex = -1;
    frame.style.display = "none";
    document.body.appendChild(frame);
  }

  frame.src = url;
}

function isAbsoluteUrl(url: string) {
  return /^[a-z][a-z\d+\-.]*:/i.test(url) || url.startsWith("//");
}
