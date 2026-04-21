import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import { cn } from "../lib/utils";
import { DataTable, type DataTableColumn } from "./DataTable";
import { Tree } from "./Tree";
import { Icon } from "./Icon";

export type ClickyStyle = {
  className?: string;
  color?: string;
  backgroundColor?: string;
  bold?: boolean;
  faint?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  textTransform?: string;
  maxWidth?: number;
  maxLines?: number;
  truncateMode?: "suffix" | "prefix" | "headtail";
  monospace?: boolean;
};

export type ClickyField = {
  name: string;
  label?: string;
  value: ClickyNode;
};

export type ClickyColumn = {
  name: string;
  label?: string;
  header?: ClickyNode;
  align?: "left" | "right" | "center";
  sortable?: boolean;
  filterable?: boolean;
  grow?: boolean;
  shrink?: boolean;
};

export type ClickyRow = {
  cells: Record<string, ClickyNode>;
  detail?: ClickyNode;
};

export type ClickyTreeItem = {
  id: string;
  label: ClickyNode;
  children?: ClickyTreeItem[];
};

export type ClickyNode = {
  kind:
    | "text"
    | "icon"
    | "list"
    | "map"
    | "table"
    | "tree"
    | "code"
    | "collapsed"
    | "button"
    | "button-group"
    | "html"
    | "comment";
  plain?: string;
  style?: ClickyStyle;
  text?: string;
  children?: ClickyNode[];
  tooltip?: ClickyNode;
  html?: string;
  inline?: boolean;
  ordered?: boolean;
  unstyled?: boolean;
  bullet?: ClickyNode;
  items?: ClickyNode[];
  fields?: ClickyField[];
  columns?: ClickyColumn[];
  rows?: ClickyRow[];
  autoFilter?: boolean;
  roots?: ClickyTreeItem[];
  label?: ClickyNode;
  content?: ClickyNode;
  href?: string;
  id?: string;
  payload?: string;
  variant?: string;
  iconify?: string;
  unicode?: string;
  language?: string;
  source?: string;
  highlightedHtml?: string;
};

export type ClickyDocument = {
  version: 1;
  node: ClickyNode;
};

export type ClickyRemoteFormat = "json" | "pdf";

export type ClickyViewOptions = {
  json?: boolean;
  pdf?: boolean;
};

export type ClickyViewConfig = ClickyViewOptions | ClickyRemoteFormat[];

export type ClickyDownloadOptions = {
  all?: boolean;
  label?: string;
};

export type ClickyProps = {
  data?: ClickyDocument | ClickyNode | string;
  url?: string;
  view?: ClickyViewConfig;
  download?: ClickyDownloadOptions;
  className?: string;
};

type ParsedClicky =
  | { ok: true; document: ClickyDocument }
  | { ok: false; message: string; raw: string };

export function Clicky(props: ClickyProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
          },
        },
      }),
  );

  if (props.url) {
    return (
      <QueryClientProvider client={queryClient}>
        <ClickyRemoteRenderer {...props} url={props.url} />
      </QueryClientProvider>
    );
  }

  return <ClickyContent data={props.data} className={props.className} />;
}

function ClickyContent({
  data,
  className,
}: {
  data: ClickyProps["data"];
  className?: string;
}) {
  if (data === undefined) {
    return (
      <ClickyNotice
        className={className}
        title="No Clicky data"
        message="Provide either a local data payload or a URL."
      />
    );
  }

  const parsed = parseClickyData(data);

  if (!parsed.ok) {
    return <ClickyInvalidPayload parsed={parsed} className={className} />;
  }

  return (
    <div className={className}>
      <ClickyNodeRenderer node={parsed.document.node} />
    </div>
  );
}

function ClickyRemoteRenderer({
  data,
  url,
  view,
  download,
  className,
}: ClickyProps & { url: string }) {
  const availableViews = useMemo(
    () => getAvailableViews({ data, url, view }),
    [data, url, view],
  );
  const downloadFormats = useMemo(
    () => getDownloadFormats({ url, download, availableViews }),
    [availableViews, download, url],
  );
  const [activeView, setActiveView] = useState<ClickyRemoteFormat>(() => availableViews[0] ?? "json");

  useEffect(() => {
    if (!availableViews.includes(activeView)) {
      setActiveView(availableViews[0] ?? "json");
    }
  }, [activeView, availableViews]);

  const formattedUrl = buildFormatUrl(url, activeView);
  const jsonQuery = useQuery({
    queryKey: ["clicky", formattedUrl],
    enabled: activeView === "json",
    queryFn: async () => fetchClickyPayload(formattedUrl),
  });

  const effectiveData = activeView === "json" ? (jsonQuery.data ?? data) : undefined;
  const canDownload = downloadFormats.length > 0;

  return (
    <div className={cn("space-y-density-3", className)}>
      <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-muted/30 px-density-3 py-density-2">
        {availableViews.length > 1 && (
          <div
            role="radiogroup"
            aria-label="Clicky view mode"
            className="inline-flex items-center rounded-md border border-input bg-background p-1"
          >
            {availableViews.map((mode) => (
              <button
                key={mode}
                type="button"
                role="radio"
                aria-checked={activeView === mode}
                onClick={() => setActiveView(mode)}
                className={cn(
                  "rounded-sm px-2 py-1 text-xs font-medium transition-colors",
                  activeView === mode
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {formatViewLabel(mode)}
              </button>
            ))}
          </div>
        )}

        <code className="min-w-0 flex-1 truncate rounded bg-background px-2 py-1 text-xs text-muted-foreground">
          {formattedUrl}
        </code>

        {activeView === "json" && jsonQuery.isFetching && (
          <span className="text-xs text-muted-foreground">Refreshing…</span>
        )}

        {canDownload && (
          <ClickyDownloadSplitButton
            className="ml-auto"
            activeFormat={activeView}
            url={url}
            formats={downloadFormats}
            label={download?.label}
          />
        )}
      </div>

      {activeView === "pdf" ? (
        <ClickyPdfPreview src={formattedUrl} />
      ) : jsonQuery.isPending && effectiveData === undefined ? (
        <ClickyNotice title="Loading Clicky" message={`Fetching ${formattedUrl}`} />
      ) : jsonQuery.isError && effectiveData === undefined ? (
        <ClickyNotice
          title="Clicky request failed"
          message={jsonQuery.error instanceof Error ? jsonQuery.error.message : "Request failed"}
          tone="destructive"
        />
      ) : (
        <>
          {jsonQuery.isError && data !== undefined && (
            <ClickyNotice
              title="Remote refresh failed"
              message="Showing the local fallback payload instead."
              tone="warning"
            />
          )}
          <ClickyContent data={effectiveData} />
        </>
      )}
    </div>
  );
}

function ClickyDownloadSplitButton({
  activeFormat,
  url,
  formats,
  label,
  className,
}: {
  activeFormat: ClickyRemoteFormat;
  url: string;
  formats: ClickyRemoteFormat[];
  label?: string;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  useDismissablePopup(open, rootRef, triggerRef, () => setOpen(false));

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <div className="inline-flex overflow-hidden rounded-md border border-input bg-background shadow-sm">
        <button
          type="button"
          aria-label={label ? `Download ${label}` : "Download"}
          className="inline-flex h-8 items-center gap-2 border-r border-input px-3 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onClick={() => submitDownloadRequest(buildFormatUrl(url, activeFormat))}
        >
          <Icon name="codicon:cloud-download" className="text-sm" />
          <span>Download</span>
        </button>
        <button
          ref={triggerRef}
          type="button"
          aria-label="Open download menu"
          aria-haspopup="menu"
          aria-expanded={open}
          className="inline-flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onClick={() => setOpen((current) => !current)}
        >
          <Icon name={open ? "codicon:chevron-up" : "codicon:chevron-down"} className="text-sm" />
        </button>
      </div>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.375rem)] z-50 min-w-[11rem] rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg shadow-black/5"
        >
          {formats.map((format) => {
            const active = format === activeFormat;
            return (
              <button
                key={format}
                type="button"
                role="menuitem"
                className={cn(
                  "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent focus:bg-accent focus:outline-none",
                  active && "bg-accent font-medium",
                )}
                onClick={() => {
                  submitDownloadRequest(buildFormatUrl(url, format));
                  setOpen(false);
                }}
              >
                <span className="flex items-center gap-2">
                  <Icon name={getFormatIconName(format)} className="text-sm" />
                  <span>{formatViewLabel(format)}</span>
                </span>
                {active && <Icon name="codicon:check" className="text-xs text-muted-foreground" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function useDismissablePopup(
  open: boolean,
  rootRef: RefObject<HTMLElement | null>,
  triggerRef: RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        onClose();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open, rootRef, triggerRef]);
}

function parseClickyData(data: ClickyProps["data"]): ParsedClicky {
  if (typeof data === "string") {
    try {
      return normalizeClickyDocument(JSON.parse(data) as unknown);
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : "Failed to parse JSON",
        raw: data,
      };
    }
  }

  return normalizeClickyDocument(data);
}

function fetchClickyPayload(url: string) {
  return fetch(url, {
    headers: {
      Accept: "application/json, text/plain;q=0.9,*/*;q=0.8",
    },
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error(`Request failed with ${response.status} ${response.statusText}`.trim());
    }
    return response.text();
  });
}

function ClickyInvalidPayload({
  parsed,
  className,
}: {
  parsed: Extract<ParsedClicky, { ok: false }>;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-destructive/30 bg-destructive/5 p-density-3",
        className,
      )}
    >
      <div className="text-sm font-medium text-destructive">Invalid Clicky payload</div>
      <pre className="mt-2 whitespace-pre-wrap break-all text-xs text-muted-foreground">
        {parsed.message}
        {parsed.raw ? `\n\n${parsed.raw}` : ""}
      </pre>
    </div>
  );
}

function ClickyNotice({
  title,
  message,
  tone = "default",
  className,
}: {
  title: string;
  message: string;
  tone?: "default" | "warning" | "destructive";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-md border p-density-3",
        tone === "destructive" && "border-destructive/30 bg-destructive/5",
        tone === "warning" && "border-yellow-500/30 bg-yellow-500/5",
        tone === "default" && "border-border bg-muted/30",
        className,
      )}
    >
      <div
        className={cn(
          "text-sm font-medium",
          tone === "destructive" && "text-destructive",
          tone === "warning" && "text-yellow-700 dark:text-yellow-400",
        )}
      >
        {title}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{message}</div>
    </div>
  );
}

function ClickyPdfPreview({ src }: { src: string }) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-background">
      <div className="flex items-center justify-between border-b border-border px-3 py-2 text-xs text-muted-foreground">
        <span>PDF preview</span>
        <a href={src} target="_blank" rel="noreferrer" className="text-primary hover:underline">
          Open in new tab
        </a>
      </div>
      <iframe title="Clicky PDF preview" src={src} className="h-[720px] w-full bg-white" />
    </div>
  );
}

function getAvailableViews({
  data,
  url,
  view,
}: Pick<ClickyProps, "data" | "url" | "view">): ClickyRemoteFormat[] {
  const allowJson = Array.isArray(view) ? view.includes("json") : (view?.json ?? true);
  const allowPdf = Array.isArray(view) ? view.includes("pdf") : (view?.pdf ?? false);
  const next: ClickyRemoteFormat[] = [];

  if (allowJson && (url || data !== undefined)) {
    next.push("json");
  }

  if (allowPdf && url) {
    next.push("pdf");
  }

  if (next.length === 0 && (url || data !== undefined)) {
    next.push("json");
  }

  return next;
}

function getDownloadFormats({
  url,
  download,
  availableViews,
}: {
  url?: string;
  download?: ClickyDownloadOptions;
  availableViews: ClickyRemoteFormat[];
}): ClickyRemoteFormat[] {
  if (!download?.all) {
    return [];
  }

  if (!url) {
    return availableViews;
  }

  return ["json", "pdf"];
}

function getFormatIconName(format: ClickyRemoteFormat) {
  if (format === "pdf") {
    return "vscode-icons:file-type-pdf2";
  }

  return "vscode-icons:file-type-json";
}

function formatViewLabel(mode: ClickyRemoteFormat) {
  return mode.toUpperCase();
}

function buildFormatUrl(url: string, format: ClickyRemoteFormat) {
  const base = typeof window === "undefined" ? "http://localhost" : window.location.origin;
  const resolved = new URL(url, base);
  resolved.searchParams.set("format", format);

  if (isAbsoluteUrl(url)) {
    return resolved.toString();
  }

  return `${resolved.pathname}${resolved.search}${resolved.hash}`;
}

function submitDownloadRequest(url: string) {
  if (typeof document === "undefined") return;

  const form = document.createElement("form");
  form.method = "GET";
  form.action = url;
  form.style.display = "none";
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

function isAbsoluteUrl(url: string) {
  return /^[a-z][a-z\d+\-.]*:/i.test(url) || url.startsWith("//");
}

function normalizeClickyDocument(data: unknown): ParsedClicky {
  if (!data || typeof data !== "object") {
    return { ok: false, message: "Payload must be an object", raw: String(data ?? "") };
  }

  const candidate = data as Partial<ClickyDocument> & Partial<ClickyNode>;
  if (
    "version" in candidate &&
    candidate.version === 1 &&
    candidate.node &&
    isClickyNode(candidate.node)
  ) {
    return { ok: true, document: candidate as ClickyDocument };
  }

  if (isClickyNode(candidate)) {
    return { ok: true, document: { version: 1, node: candidate } };
  }

  return {
    ok: false,
    message: "Payload is neither a Clicky document nor a Clicky node",
    raw: JSON.stringify(data, null, 2),
  };
}

function isClickyNode(value: unknown): value is ClickyNode {
  return (
    !!value && typeof value === "object" && typeof (value as { kind?: unknown }).kind === "string"
  );
}

function ClickyNodeRenderer({ node }: { node: ClickyNode | null | undefined }) {
  if (!node) return null;

  switch (node.kind) {
    case "text":
      return <ClickyText node={node} />;
    case "icon":
      return <ClickyIconNode node={node} />;
    case "list":
      return <ClickyList node={node} />;
    case "map":
      return <ClickyMap node={node} />;
    case "table":
      return <ClickyTable node={node} />;
    case "tree":
      return <ClickyTreeNode node={node} />;
    case "code":
      return <ClickyCodeBlock node={node} />;
    case "collapsed":
      return <ClickyCollapsed node={node} />;
    case "button":
      return <ClickyButtonNode node={node} />;
    case "button-group":
      return <ClickyButtonGroup node={node} />;
    case "html":
      return <ClickyHtmlNode node={node} />;
    case "comment":
      return null;
    default:
      return (
        <pre className="rounded-md border border-border bg-muted p-density-3 text-xs">
          {JSON.stringify(node, null, 2)}
        </pre>
      );
  }
}

function ClickyText({ node }: { node: ClickyNode }) {
  const inlineStyle = toInlineStyle(node.style, node.text ?? node.plain);
  const content = (
    <>
      {node.text}
      {node.children?.map((child, index) => (
        <Fragment key={index}>
          <ClickyNodeRenderer node={child} />
        </Fragment>
      ))}
    </>
  );

  if (!node.style && !node.tooltip) {
    return <>{content}</>;
  }

  return (
    <span
      style={inlineStyle}
      title={node.tooltip?.plain}
      className={cn(
        node.style?.className,
        (node.text ?? "").includes("\n") && "whitespace-pre-wrap",
      )}
    >
      {content}
    </span>
  );
}

function ClickyIconNode({ node }: { node: ClickyNode }) {
  const inlineStyle = toInlineStyle(node.style, node.plain ?? node.unicode);

  return (
    <span style={inlineStyle} title={node.tooltip?.plain} className="inline-flex items-center">
      {node.iconify ? <Icon name={node.iconify} /> : <span>{node.unicode ?? node.plain}</span>}
    </span>
  );
}

function ClickyList({ node }: { node: ClickyNode }) {
  const items = node.items ?? [];
  if (items.length === 0) return null;

  if (node.inline) {
    return (
      <span className="inline-flex flex-wrap items-start gap-1">
        {items.map((item, index) => (
          <Fragment key={index}>
            {index > 0 && <span className="text-muted-foreground">,</span>}
            <span className="inline-flex items-center gap-1">
              {!node.ordered && node.bullet && <ClickyNodeRenderer node={node.bullet} />}
              {node.ordered && <span className="text-muted-foreground">{index + 1}.</span>}
              <ClickyNodeRenderer node={item} />
            </span>
          </Fragment>
        ))}
      </span>
    );
  }

  if (node.unstyled) {
    return (
      <div className="space-y-1">
        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-2">
            {!node.ordered && node.bullet && <ClickyNodeRenderer node={node.bullet} />}
            {node.ordered && <span className="text-muted-foreground">{index + 1}.</span>}
            <div className="min-w-0 flex-1">
              <ClickyNodeRenderer node={item} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const Tag = node.ordered ? "ol" : "ul";
  const listClass = node.ordered ? "list-decimal" : "list-disc";

  return (
    <Tag className={cn("ml-5 space-y-1 text-sm", listClass)}>
      {items.map((item, index) => (
        <li key={index}>
          <ClickyNodeRenderer node={item} />
        </li>
      ))}
    </Tag>
  );
}

function ClickyMap({ node }: { node: ClickyNode }) {
  const fields = node.fields ?? [];
  if (fields.length === 0) return null;

  const inlineFields = fields.filter((field) => isInlineNode(field.value));
  const blockFields = fields.filter((field) => !isInlineNode(field.value));

  return (
    <div className="space-y-density-4">
      {inlineFields.length > 0 && (
        <dl className="grid gap-density-3 md:grid-cols-2">
          {inlineFields.map((field) => (
            <div key={field.name}>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {field.label || prettifyName(field.name)}
              </dt>
              <dd className="mt-1 text-sm text-foreground">
                <ClickyNodeRenderer node={field.value} />
              </dd>
            </div>
          ))}
        </dl>
      )}

      {blockFields.map((field) => (
        <section key={field.name} className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {field.label || prettifyName(field.name)}
          </div>
          <div className="rounded-md border border-border bg-background p-density-3">
            <ClickyNodeRenderer node={field.value} />
          </div>
        </section>
      ))}
    </div>
  );
}

function ClickyTable({ node }: { node: ClickyNode }) {
  const columns = node.columns ?? [];
  const rows = node.rows ?? [];

  if (columns.length === 0 || rows.length === 0) {
    return <div className="text-sm text-muted-foreground">No data</div>;
  }

  const tableColumns: DataTableColumn<ClickyRow>[] = columns.map((column) => ({
    key: `cells.${column.name}`,
    label: column.header ? <ClickyNodeRenderer node={column.header} /> : column.label || prettifyName(column.name),
    align: column.align,
    sortable: column.sortable,
    filterable: column.filterable,
    grow: column.grow,
    shrink: column.shrink,
    render: (value) => <ClickyNodeRenderer node={value as ClickyNode} />,
    sortValue: (value) => clickyNodeText(value as ClickyNode),
    filterValue: (value) => clickyNodeText(value as ClickyNode),
  }));

  const defaultSortColumn = columns.find((column) => column.sortable !== false) ?? columns[0];

  return (
    <DataTable
      data={rows}
      columns={tableColumns}
      autoFilter={node.autoFilter}
      defaultSort={
        defaultSortColumn ? { key: `cells.${defaultSortColumn.name}`, dir: "asc" } : undefined
      }
      getRowId={(row, index) =>
        `${index}-${columns
          .map((column) => clickyNodeText(row.cells[column.name]))
          .filter(Boolean)
          .join("|")}`
      }
      renderExpandedRow={(row) =>
        row.detail ? <ClickyNodeRenderer node={row.detail} /> : null
      }
    />
  );
}

function ClickyTreeNode({ node }: { node: ClickyNode }) {
  const roots = node.roots ?? [];
  if (roots.length === 0) return null;

  return (
    <Tree<ClickyTreeItem>
      roots={roots}
      getChildren={(item) => item.children}
      getKey={(item) => item.id}
      defaultOpen={(_, depth) => depth < 1}
      renderRow={({ node: item }) => (
        <div className="min-w-0 flex-1 truncate">
          <ClickyNodeRenderer node={item.label} />
        </div>
      )}
    />
  );
}

function ClickyCodeBlock({ node }: { node: ClickyNode }) {
  const html = node.highlightedHtml ? sanitizeHtml(node.highlightedHtml) : "";

  return (
    <div className="overflow-hidden rounded-md border border-border bg-muted/40">
      <div className="border-b border-border px-3 py-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
        {node.language || "text"}
      </div>
      {html ? (
        <div
          className="overflow-auto p-3 text-xs font-mono [&_.chroma]:bg-transparent [&_pre]:m-0 [&_pre]:whitespace-pre-wrap [&_pre]:bg-transparent"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="overflow-auto whitespace-pre-wrap break-words p-3 text-xs font-mono text-foreground">
          {node.source ?? node.plain}
        </pre>
      )}
    </div>
  );
}

function ClickyCollapsed({ node }: { node: ClickyNode }) {
  return (
    <details className="rounded-md border border-border bg-background">
      <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-foreground">
        <ClickyNodeRenderer node={node.label} />
      </summary>
      {node.content && (
        <div className="border-t border-border px-3 py-3">
          <ClickyNodeRenderer node={node.content} />
        </div>
      )}
    </details>
  );
}

function ClickyButtonNode({ node }: { node: ClickyNode }) {
  const title = [node.id, node.payload].filter(Boolean).join("\n") || undefined;
  const content = node.label ? <ClickyNodeRenderer node={node.label} /> : node.text;

  if (node.href) {
    return (
      <a
        href={node.href}
        target="_blank"
        rel="noopener noreferrer"
        title={title}
        className="inline-flex items-center rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent"
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      title={title}
      className="inline-flex items-center rounded-md border border-border bg-muted px-3 py-1.5 text-sm font-medium text-foreground"
    >
      {content}
    </button>
  );
}

function ClickyButtonGroup({ node }: { node: ClickyNode }) {
  const items = node.items ?? [];
  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <ClickyNodeRenderer key={index} node={item} />
      ))}
    </div>
  );
}

function ClickyHtmlNode({ node }: { node: ClickyNode }) {
  const sanitized = sanitizeHtml(node.html ?? "");
  if (!sanitized) return null;

  const Tag = isBlockHtml(sanitized) ? "div" : "span";
  return <Tag dangerouslySetInnerHTML={{ __html: sanitized }} />;
}

function toInlineStyle(style?: ClickyStyle, text?: string): CSSProperties | undefined {
  if (!style) return text?.includes("\n") ? { whiteSpace: "pre-wrap" } : undefined;

  const inlineStyle: CSSProperties = {};

  if (style.color) inlineStyle.color = style.color;
  if (style.backgroundColor) inlineStyle.backgroundColor = style.backgroundColor;
  if (style.bold) inlineStyle.fontWeight = 700;
  if (style.faint) inlineStyle.opacity = 0.7;
  if (style.italic) inlineStyle.fontStyle = "italic";

  const decorations: string[] = [];
  if (style.underline) decorations.push("underline");
  if (style.strikethrough) decorations.push("line-through");
  if (decorations.length > 0) inlineStyle.textDecoration = decorations.join(" ");

  if (
    style.textTransform === "uppercase" ||
    style.textTransform === "lowercase" ||
    style.textTransform === "capitalize"
  ) {
    inlineStyle.textTransform = style.textTransform;
  }

  if (style.maxWidth && style.maxWidth > 0) {
    inlineStyle.maxWidth = `${style.maxWidth}ch`;
  }

  if (style.maxLines && style.maxLines > 0) {
    inlineStyle.display = "-webkit-box";
    inlineStyle.overflow = "hidden";
    inlineStyle.WebkitLineClamp = style.maxLines;
    inlineStyle.WebkitBoxOrient = "vertical";
    inlineStyle.whiteSpace = "pre-wrap";
  }

  if (
    style.truncateMode === "suffix" &&
    style.maxWidth &&
    (!style.maxLines || style.maxLines <= 1)
  ) {
    inlineStyle.overflow = "hidden";
    inlineStyle.textOverflow = "ellipsis";
    inlineStyle.whiteSpace = "nowrap";
    inlineStyle.display = "inline-block";
    inlineStyle.verticalAlign = "bottom";
  }

  if (style.monospace) {
    inlineStyle.fontFamily =
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
  }

  if (!inlineStyle.whiteSpace && text?.includes("\n")) {
    inlineStyle.whiteSpace = "pre-wrap";
  }

  return Object.keys(inlineStyle).length > 0 ? inlineStyle : undefined;
}

function sanitizeHtml(raw: string): string {
  if (!raw) return "";

  if (typeof DOMParser === "undefined") {
    return raw
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
      .replace(/\son\w+="[^"]*"/gi, "")
      .replace(/\son\w+='[^']*'/gi, "");
  }

  const doc = new DOMParser().parseFromString(raw, "text/html");

  doc.querySelectorAll("script,iframe,object,embed,form").forEach((element) => element.remove());

  doc.querySelectorAll("*").forEach((element) => {
    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim().toLowerCase();

      if (name.startsWith("on") || name === "srcdoc") {
        element.removeAttribute(attribute.name);
      }

      if ((name === "href" || name === "src") && value.startsWith("javascript:")) {
        element.removeAttribute(attribute.name);
      }
    });
  });

  return doc.body.innerHTML;
}

function prettifyName(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (value) => value.toUpperCase());
}

function clickyNodeText(node: ClickyNode | null | undefined): string {
  if (!node) return "";
  if (node.plain) return node.plain;
  if (node.text) return node.text;
  if (node.kind === "html") return sanitizeHtml(node.html ?? "").replace(/<[^>]+>/g, " ").trim();
  if (node.kind === "code") return node.source ?? "";
  if (node.kind === "button" && node.label) return clickyNodeText(node.label);
  if (node.kind === "button-group") {
    return (node.items ?? []).map((item) => clickyNodeText(item)).join(" ");
  }
  if (node.kind === "text" && node.children?.length) {
    return [node.text, ...node.children.map((child) => clickyNodeText(child))].join("");
  }
  return "";
}

function isInlineNode(node: ClickyNode): boolean {
  return (
    node.kind === "text" ||
    node.kind === "icon" ||
    node.kind === "html" ||
    node.kind === "button" ||
    node.kind === "button-group"
  );
}

function isBlockHtml(html: string): boolean {
  return /<(div|p|pre|table|ul|ol|li|details|blockquote|h[1-6])/i.test(html);
}
