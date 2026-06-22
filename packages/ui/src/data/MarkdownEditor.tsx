import {
  useEffect,
  useId,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Button } from "../components/button";
import { IconButton } from "../components/IconButton";
import {
  SegmentedControl,
  type SegmentedOption,
} from "../components/SegmentedControl";
import { cn } from "../lib/utils";
import {
  UiCopy,
  UiEdit,
  UiEye,
  UiFileCode,
  UiFileSpreadsheet,
  UiFileText,
  UiJson,
  UiMarkdown,
  UiRefresh,
} from "../icons";
import { Clicky, type ClickyProps } from "./Clicky";
import { Icon, type StaticIconComponent } from "./Icon";
import { JsonView } from "./JsonView";
import { Markdown } from "./Markdown";
import {
  buildMarkdownPreviewUrl,
  MARKDOWN_EDITOR_PREVIEW_FORMATS,
  type MarkdownEditorPreviewFormat,
  type MarkdownEditorPreviewHeaders,
  type MarkdownEditorPreviewRequest,
  type MarkdownEditorPreviewResult,
} from "./MarkdownEditor.model";

export type MarkdownEditorProps = {
  /** Controlled markdown source. */
  value?: string;
  /** Initial markdown source for uncontrolled usage. */
  defaultValue?: string;
  /** Called whenever the editor source changes. */
  onChange?: (value: string) => void;
  /** Editor label. */
  label?: ReactNode;
  /** Textarea placeholder. */
  placeholder?: string;
  /** Preview formats to expose in the toolbar. */
  previewFormats?: readonly MarkdownEditorPreviewFormat[];
  /** Controlled active preview format. */
  previewFormat?: MarkdownEditorPreviewFormat;
  /** Initial active preview format for uncontrolled usage. */
  defaultPreviewFormat?: MarkdownEditorPreviewFormat;
  /** Called when the active preview format changes. */
  onPreviewFormatChange?: (format: MarkdownEditorPreviewFormat) => void;
  /** Clicky endpoint that accepts markdown and a `format=` query parameter. */
  previewEndpoint?: string;
  /** HTTP method for `previewEndpoint`; POST sends the markdown body. */
  previewMethod?: "GET" | "POST" | "PUT";
  /** Extra headers for remote previews. */
  previewHeaders?: MarkdownEditorPreviewHeaders;
  /** Build a URL for remote preview requests instead of `previewEndpoint`. */
  buildPreviewUrl?: (request: {
    markdown: string;
    format: MarkdownEditorPreviewFormat;
  }) => string | undefined;
  /** Custom loader for host-specific markdown conversion. */
  loadPreview?: (
    request: MarkdownEditorPreviewRequest,
  ) => Promise<MarkdownEditorPreviewResult> | MarkdownEditorPreviewResult;
  /** Local Clicky document for the React preview, or a mapper from markdown. */
  clickyData?: ClickyProps["data"] | ((markdown: string) => ClickyProps["data"] | undefined);
  /** Debounce interval for remote preview requests. */
  previewDebounceMs?: number;
  /** Minimum height for both editor and preview panes. */
  minHeight?: number | string;
  /** Disable editing and preview refresh. */
  disabled?: boolean;
  /** Render the source as read-only. */
  readOnly?: boolean;
  /** Classes applied to the component root. */
  className?: string;
  /** Classes applied to the textarea. */
  editorClassName?: string;
  /** Classes applied to the preview body. */
  previewClassName?: string;
  /** Extra toolbar content rendered after the built-in actions. */
  toolbar?: ReactNode;
};

type PreviewState =
  | { status: "idle" }
  | { status: "loading"; result?: MarkdownEditorPreviewResult }
  | { status: "success"; result: MarkdownEditorPreviewResult }
  | { status: "error"; error: string; result?: MarkdownEditorPreviewResult };

type FormatMeta = {
  label: string;
  icon: StaticIconComponent;
  iconClassName?: string;
};

const FORMAT_META: Record<MarkdownEditorPreviewFormat, FormatMeta> = {
  react: {
    label: "React",
    icon: UiEye,
  },
  html: {
    label: "HTML",
    icon: UiFileCode,
  },
  markdown: {
    label: "Markdown",
    icon: UiMarkdown,
  },
  pdf: {
    label: "PDF",
    icon: UiFileText,
    iconClassName: "text-rose-600 dark:text-rose-400",
  },
  json: {
    label: "JSON",
    icon: UiJson,
  },
  csv: {
    label: "CSV",
    icon: UiFileSpreadsheet,
    iconClassName: "text-emerald-600 dark:text-emerald-400",
  },
  excel: {
    label: "Excel",
    icon: UiFileSpreadsheet,
    iconClassName: "text-emerald-700 dark:text-emerald-300",
  },
};

/**
 * Split-pane markdown editor with local Markdown/React preview and optional
 * Clicky-backed format previews. Hosts can pass `previewEndpoint` for the
 * standard Clicky `format=` contract or `loadPreview` for custom conversion.
 */
export function MarkdownEditor({
  value,
  defaultValue = "",
  onChange,
  label = "Markdown",
  placeholder = "Write markdown...",
  previewFormats,
  previewFormat,
  defaultPreviewFormat,
  onPreviewFormatChange,
  previewEndpoint,
  previewMethod = "POST",
  previewHeaders,
  buildPreviewUrl,
  loadPreview,
  clickyData,
  previewDebounceMs = 350,
  minHeight = 420,
  disabled = false,
  readOnly = false,
  className,
  editorClassName,
  previewClassName,
  toolbar,
}: MarkdownEditorProps) {
  const editorId = useId();
  const formats = useMemo(
    () => normalizePreviewFormats(previewFormats),
    [previewFormats],
  );
  const firstFormat = formats[0] ?? "react";
  const [draft, setDraft] = useState(defaultValue);
  const markdown = value ?? draft;
  const [internalFormat, setInternalFormat] = useState<MarkdownEditorPreviewFormat>(
    () =>
      normalizeInitialFormat(defaultPreviewFormat, formats) ??
      firstFormat,
  );
  const activeFormat = formats.includes(previewFormat ?? internalFormat)
    ? previewFormat ?? internalFormat
    : firstFormat;
  const [refreshKey, setRefreshKey] = useState(0);
  const [previewState, setPreviewState] = useState<PreviewState>({
    status: "idle",
  });
  const contentStyle = useMemo<CSSProperties>(
    () => ({ minHeight: cssSize(minHeight) }),
    [minHeight],
  );
  const remoteEnabled = Boolean(loadPreview || previewEndpoint || buildPreviewUrl);
  const currentMeta = FORMAT_META[activeFormat];
  const segmentOptions = useMemo<SegmentedOption<MarkdownEditorPreviewFormat>[]>(
    () =>
      formats.map((format) => {
        const meta = FORMAT_META[format];
        return {
          id: format,
          label: meta.label,
          icon: meta.icon,
          title: `${meta.label} preview`,
        };
      }),
    [formats],
  );

  useEffect(() => {
    if (formats.includes(activeFormat)) return;
    setInternalFormat(firstFormat);
  }, [activeFormat, firstFormat, formats]);

  useEffect(() => {
    if (!remoteEnabled) {
      setPreviewState({ status: "idle" });
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setPreviewState((current) =>
        current.status === "success"
          ? { status: "loading", result: current.result }
          : { status: "loading" },
      );

      resolvePreview({
        markdown,
        format: activeFormat,
        signal: controller.signal,
        previewEndpoint,
        previewMethod,
        previewHeaders,
        buildPreviewUrl,
        loadPreview,
      })
        .then((result) => {
          if (!controller.signal.aborted) {
            setPreviewState({ status: "success", result });
          }
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) return;
          setPreviewState((current) => ({
            status: "error",
            error: error instanceof Error ? error.message : "Preview failed",
            ...(current.status === "loading" && current.result
              ? { result: current.result }
              : {}),
          }));
        });
    }, Math.max(0, previewDebounceMs));

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [
    activeFormat,
    buildPreviewUrl,
    loadPreview,
    markdown,
    previewDebounceMs,
    previewEndpoint,
    previewHeaders,
    previewMethod,
    refreshKey,
    remoteEnabled,
  ]);

  const updateMarkdown = (next: string) => {
    if (value === undefined) setDraft(next);
    onChange?.(next);
  };

  const updateFormat = (next: MarkdownEditorPreviewFormat) => {
    if (previewFormat === undefined) setInternalFormat(next);
    onPreviewFormatChange?.(next);
  };

  const copySource = () => {
    const clipboard = globalThis.navigator?.clipboard;
    if (clipboard?.writeText) {
      void clipboard.writeText(markdown).catch(() => undefined);
    }
  };

  return (
    <div className={cn("rounded-md border border-border bg-card", className)}>
      <div className="flex flex-wrap items-center gap-density-2 border-b border-border px-density-3 py-density-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Icon icon={UiEdit} className="text-base text-muted-foreground" />
          <label
            htmlFor={editorId}
            className="truncate text-sm font-medium text-card-foreground"
          >
            {label}
          </label>
          {previewState.status === "loading" && (
            <span className="text-xs text-muted-foreground">Refreshing...</span>
          )}
        </div>
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
          <SegmentedControl
            value={activeFormat}
            options={segmentOptions}
            onChange={updateFormat}
            size="sm"
            aria-label="Markdown preview format"
            className="max-w-full flex-wrap"
          />
          {remoteEnabled && (
            <IconButton
              icon={UiRefresh}
              label="Refresh preview"
              disabled={disabled}
              onClick={() => setRefreshKey((current) => current + 1)}
            />
          )}
          <IconButton icon={UiCopy} label="Copy markdown" onClick={copySource} />
          {toolbar}
        </div>
      </div>

      <div className="grid gap-density-3 p-density-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-w-0 overflow-hidden rounded-md border border-border bg-background">
          <div className="border-b border-border px-density-3 py-density-2 text-xs font-medium text-muted-foreground">
            Source
          </div>
          <textarea
            id={editorId}
            value={markdown}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            spellCheck
            onChange={(event) => updateMarkdown(event.currentTarget.value)}
            className={cn(
              "block w-full resize-y border-0 bg-transparent px-density-3 py-density-3 font-mono text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60",
              editorClassName,
            )}
            style={contentStyle}
          />
        </div>

        <div className="min-w-0 overflow-hidden rounded-md border border-border bg-background">
          <div className="flex items-center gap-2 border-b border-border px-density-3 py-density-2 text-xs font-medium text-muted-foreground">
            <Icon
              icon={currentMeta.icon}
              className={cn("text-sm", currentMeta.iconClassName)}
            />
            <span>{currentMeta.label}</span>
          </div>
          <div
            className={cn(
              "overflow-auto px-density-3 py-density-3",
              previewClassName,
            )}
            style={contentStyle}
          >
            <MarkdownEditorPreview
              format={activeFormat}
              markdown={markdown}
              state={previewState}
              clickyData={clickyData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MarkdownEditorPreview({
  format,
  markdown,
  state,
  clickyData,
}: {
  format: MarkdownEditorPreviewFormat;
  markdown: string;
  state: PreviewState;
  clickyData?: MarkdownEditorProps["clickyData"];
}) {
  const result =
    state.status === "success" || state.status === "loading" || state.status === "error"
      ? state.result
      : undefined;

  return (
    <div className="space-y-density-3">
      {state.status === "error" && (
        <PreviewNotice title="Preview failed" message={state.error} tone="danger" />
      )}
      {result ? (
        <PreviewResult format={format} result={result} />
      ) : (
        <LocalPreview
          format={format}
          markdown={markdown}
          clickyData={clickyData}
        />
      )}
    </div>
  );
}

function LocalPreview({
  format,
  markdown,
  clickyData,
}: {
  format: MarkdownEditorPreviewFormat;
  markdown: string;
  clickyData?: MarkdownEditorProps["clickyData"];
}) {
  if (format === "react") {
    const data =
      typeof clickyData === "function" ? clickyData(markdown) : clickyData;
    return data === undefined ? <Markdown text={markdown} /> : <Clicky data={data} />;
  }

  if (format === "markdown") {
    return <TextPreview label="Markdown source" text={markdown} />;
  }

  return (
    <PreviewNotice
      title={`${FORMAT_META[format].label} preview not configured`}
      message="Pass previewEndpoint or loadPreview to render this format from Clicky."
    />
  );
}

function PreviewResult({
  format,
  result,
}: {
  format: MarkdownEditorPreviewFormat;
  result: MarkdownEditorPreviewResult;
}) {
  switch (result.kind) {
    case "clicky":
      return <Clicky data={result.data} />;
    case "html":
      return <HtmlPreview html={result.html} />;
    case "json":
      return <JsonView data={result.data} />;
    case "url":
      return <UrlPreview format={format} url={result.url} />;
    case "blob":
      return <BlobPreview format={format} result={result} />;
    case "text":
      return <TextResult format={format} result={result} />;
  }
}

function TextResult({
  format,
  result,
}: {
  format: MarkdownEditorPreviewFormat;
  result: Extract<MarkdownEditorPreviewResult, { kind: "text" }>;
}) {
  if (format === "react") {
    return <Clicky data={result.text} />;
  }

  if (format === "html" || isHtmlContent(result.contentType)) {
    return <HtmlPreview html={result.text} />;
  }

  if (format === "json" || isJsonContent(result.contentType)) {
    const parsed = parseJson(result.text);
    return parsed.ok ? (
      <JsonView data={parsed.value} />
    ) : (
      <TextPreview label="JSON output" text={result.text} />
    );
  }

  return (
    <TextPreview
      label={`${FORMAT_META[format].label} output`}
      text={result.text}
    />
  );
}

function UrlPreview({
  format,
  url,
}: {
  format: MarkdownEditorPreviewFormat;
  url: string;
}) {
  if (format === "react") {
    return <Clicky url={url} view={["clicky"]} download={{ all: false }} />;
  }

  if (format === "html") {
    return <HtmlPreview src={url} />;
  }

  if (format === "pdf") {
    return <FramePreview title="PDF preview" src={url} />;
  }

  if (format === "excel") {
    return <DownloadPreview label="Open Excel workbook" href={url} />;
  }

  return <TextPreview label={`${FORMAT_META[format].label} URL`} text={url} />;
}

function BlobPreview({
  format,
  result,
}: {
  format: MarkdownEditorPreviewFormat;
  result: Extract<MarkdownEditorPreviewResult, { kind: "blob" }>;
}) {
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    const next = URL.createObjectURL(result.blob);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [result.blob]);

  if (!url) {
    return <PreviewNotice title="Preparing preview" message="Creating object URL." />;
  }

  if (format === "pdf") {
    return <FramePreview title="PDF preview" src={url} />;
  }

  return (
    <DownloadPreview
      label={`Open ${FORMAT_META[format].label}`}
      href={url}
      {...(result.filename ? { download: result.filename } : {})}
    />
  );
}

function HtmlPreview({
  html,
  src,
}: {
  html?: string;
  src?: string;
}) {
  return (
    <FramePreview
      title="HTML preview"
      {...(src ? { src } : {})}
      {...(html ? { srcDoc: html } : {})}
      sandbox="allow-same-origin"
    />
  );
}

function FramePreview({
  title,
  src,
  srcDoc,
  sandbox,
}: {
  title: string;
  src?: string;
  srcDoc?: string;
  sandbox?: string;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-background">
      <iframe
        title={title}
        {...(src ? { src } : {})}
        {...(srcDoc ? { srcDoc } : {})}
        {...(sandbox ? { sandbox } : {})}
        className="h-[720px] w-full bg-background"
      />
    </div>
  );
}

function DownloadPreview({
  label,
  href,
  download,
}: {
  label: string;
  href: string;
  download?: string;
}) {
  return (
    <PreviewNotice
      title="Inline preview unavailable"
      message={
        <Button asChild variant="outline" size="sm">
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            {...(download ? { download } : {})}
          >
            {label}
          </a>
        </Button>
      }
    />
  );
}

function TextPreview({ label, text }: { label: string; text: string }) {
  return (
    <pre
      aria-label={label}
      className="overflow-auto whitespace-pre-wrap break-words rounded-md border border-border bg-muted/30 px-density-3 py-density-3 font-mono text-xs text-foreground"
    >
      {text || "No content"}
    </pre>
  );
}

function PreviewNotice({
  title,
  message,
  tone = "default",
}: {
  title: string;
  message: ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <div
      className={cn(
        "rounded-md border p-density-3",
        tone === "danger"
          ? "border-destructive/30 bg-destructive/5"
          : "border-border bg-muted/30",
      )}
    >
      <div
        className={cn(
          "text-sm font-medium",
          tone === "danger" && "text-destructive",
        )}
      >
        {title}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{message}</div>
    </div>
  );
}

function normalizePreviewFormats(
  formats: readonly MarkdownEditorPreviewFormat[] | undefined,
): MarkdownEditorPreviewFormat[] {
  const seen = new Set<MarkdownEditorPreviewFormat>();
  const source = formats && formats.length > 0 ? formats : MARKDOWN_EDITOR_PREVIEW_FORMATS;
  for (const format of source) {
    seen.add(format);
  }
  return [...seen];
}

function normalizeInitialFormat(
  format: MarkdownEditorPreviewFormat | undefined,
  formats: readonly MarkdownEditorPreviewFormat[],
) {
  return format && formats.includes(format) ? format : undefined;
}

function cssSize(size: number | string) {
  return typeof size === "number" ? `${size}px` : size;
}

async function resolvePreview({
  markdown,
  format,
  signal,
  previewEndpoint,
  previewMethod,
  previewHeaders,
  buildPreviewUrl,
  loadPreview,
}: MarkdownEditorPreviewRequest & {
  previewEndpoint: string | undefined;
  previewMethod: "GET" | "POST" | "PUT";
  previewHeaders: MarkdownEditorPreviewHeaders | undefined;
  buildPreviewUrl: MarkdownEditorProps["buildPreviewUrl"] | undefined;
  loadPreview: MarkdownEditorProps["loadPreview"] | undefined;
}): Promise<MarkdownEditorPreviewResult> {
  if (loadPreview) {
    return loadPreview({ markdown, format, signal });
  }

  const url =
    buildPreviewUrl?.({ markdown, format }) ??
    (previewEndpoint
      ? buildMarkdownPreviewUrl(previewEndpoint, format)
      : undefined);

  if (!url) {
    throw new Error("No preview endpoint configured");
  }

  const headers = new Headers(
    typeof previewHeaders === "function"
      ? previewHeaders({ markdown, format })
      : previewHeaders,
  );
  headers.set("Accept", previewAccept(format));

  const init: RequestInit = {
    method: previewMethod,
    headers,
    signal,
  };

  if (previewMethod !== "GET") {
    headers.set("Content-Type", "text/markdown; charset=utf-8");
    init.body = markdown;
  }

  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(
      `Preview failed with ${response.status} ${response.statusText}`.trim(),
    );
  }

  const contentType = response.headers.get("Content-Type") ?? "";
  if (format === "pdf" || format === "excel" || isBinaryContent(contentType)) {
    return {
      kind: "blob",
      blob: await response.blob(),
      contentType,
      filename: previewFilename(format),
    };
  }

  const text = await response.text();
  if (format === "react") {
    return { kind: "clicky", data: text };
  }
  if (format === "html" || isHtmlContent(contentType)) {
    return { kind: "html", html: text };
  }
  if (format === "json" || isJsonContent(contentType)) {
    const parsed = parseJson(text);
    return parsed.ok
      ? { kind: "json", data: parsed.value }
      : { kind: "text", text, contentType };
  }
  return { kind: "text", text, contentType };
}

function previewAccept(format: MarkdownEditorPreviewFormat) {
  switch (format) {
    case "react":
      return "application/json+clicky, application/clicky+json;q=0.9, application/json;q=0.8,*/*;q=0.7";
    case "html":
      return "text/html, */*;q=0.7";
    case "markdown":
      return "text/markdown, text/plain;q=0.8,*/*;q=0.7";
    case "pdf":
      return "application/pdf, */*;q=0.7";
    case "json":
      return "application/json, text/plain;q=0.8,*/*;q=0.7";
    case "csv":
      return "text/csv, text/plain;q=0.8,*/*;q=0.7";
    case "excel":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, */*;q=0.7";
  }
}

function previewFilename(format: MarkdownEditorPreviewFormat) {
  switch (format) {
    case "react":
      return "preview.clicky.json";
    case "html":
      return "preview.html";
    case "markdown":
      return "preview.md";
    case "pdf":
      return "preview.pdf";
    case "json":
      return "preview.json";
    case "csv":
      return "preview.csv";
    case "excel":
      return "preview.xlsx";
  }
}

function parseJson(text: string): { ok: true; value: unknown } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return { ok: false };
  }
}

function isJsonContent(contentType: string | undefined) {
  return contentType?.toLowerCase().includes("json") ?? false;
}

function isHtmlContent(contentType: string | undefined) {
  return contentType?.toLowerCase().includes("html") ?? false;
}

function isBinaryContent(contentType: string | undefined) {
  const normalized = contentType?.toLowerCase() ?? "";
  return (
    normalized.includes("application/pdf") ||
    normalized.includes("spreadsheetml") ||
    normalized.includes("application/vnd.ms-excel")
  );
}
