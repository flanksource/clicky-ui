import { Fragment, useState, type CSSProperties } from "react";
import { cn } from "../lib/utils";
import { SortableHeader } from "./SortableHeader";
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

export type ClickyProps = {
  data: ClickyDocument | ClickyNode | string;
  className?: string;
};

type ParsedClicky =
  | { ok: true; document: ClickyDocument }
  | { ok: false; message: string; raw: string };

type SortDir = "asc" | "desc";

export function Clicky({ data, className }: ClickyProps) {
  const parsed = parseClickyData(data);

  if (!parsed.ok) {
    return (
      <div className={cn("rounded-md border border-destructive/30 bg-destructive/5 p-density-3", className)}>
        <div className="text-sm font-medium text-destructive">Invalid Clicky payload</div>
        <pre className="mt-2 whitespace-pre-wrap break-all text-xs text-muted-foreground">
          {parsed.message}
          {parsed.raw ? `\n\n${parsed.raw}` : ""}
        </pre>
      </div>
    );
  }

  return (
    <div className={className}>
      <ClickyNodeRenderer node={parsed.document.node} />
    </div>
  );
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

function normalizeClickyDocument(data: unknown): ParsedClicky {
  if (!data || typeof data !== "object") {
    return { ok: false, message: "Payload must be an object", raw: String(data ?? "") };
  }

  const candidate = data as Partial<ClickyDocument> & Partial<ClickyNode>;
  if ("version" in candidate && candidate.version === 1 && candidate.node && isClickyNode(candidate.node)) {
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
  return !!value && typeof value === "object" && typeof (value as { kind?: unknown }).kind === "string";
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
      className={cn(node.style?.className, (node.text ?? "").includes("\n") && "whitespace-pre-wrap")}
    >
      {content}
    </span>
  );
}

function ClickyIconNode({ node }: { node: ClickyNode }) {
  const inlineStyle = toInlineStyle(node.style, node.plain ?? node.unicode);

  return (
    <span style={inlineStyle} title={node.tooltip?.plain} className="inline-flex items-center">
      {node.iconify ? (
        <Icon name={node.iconify} />
      ) : (
        <span>{node.unicode ?? node.plain}</span>
      )}
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
  const hasDetail = rows.some((row) => !!row.detail);
  const [sortKey, setSortKey] = useState(columns[0]?.name ?? "");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  if (columns.length === 0 || rows.length === 0) {
    return <div className="text-sm text-muted-foreground">No data</div>;
  }

  const sortedRows = [...rows].sort((left, right) => {
    if (!sortKey) return 0;
    const leftValue = left.cells[sortKey]?.plain ?? left.cells[sortKey]?.text ?? "";
    const rightValue = right.cells[sortKey]?.plain ?? right.cells[sortKey]?.text ?? "";
    return sortDir === "asc" ? compareClickyValues(leftValue, rightValue) : compareClickyValues(rightValue, leftValue);
  });

  return (
    <div className="overflow-auto rounded-md border border-border">
      <table className="w-full text-left text-sm table-fixed">
        <thead className="sticky top-0 bg-muted/50">
          <tr className="border-b border-border text-xs text-muted-foreground">
            {hasDetail && <th className="w-8 px-2 py-2" />}
            {columns.map((column) => (
              <th key={column.name} className="px-2 py-2 font-medium">
                <SortableHeader
                  active={sortKey === column.name}
                  dir={sortKey === column.name ? sortDir : undefined}
                  align={column.align ?? "left"}
                  onClick={() => {
                    if (sortKey === column.name) {
                      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
                    } else {
                      setSortKey(column.name);
                      setSortDir("asc");
                    }
                  }}
                >
                  {column.header ? (
                    <ClickyNodeRenderer node={column.header} />
                  ) : (
                    column.label || prettifyName(column.name)
                  )}
                </SortableHeader>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row, index) => (
            <ClickyTableRow
              key={`${index}-${row.cells[columns[0]?.name ?? ""]?.plain ?? ""}`}
              row={row}
              columns={columns}
              hasDetail={hasDetail}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ClickyTableRow({
  row,
  columns,
  hasDetail,
}: {
  row: ClickyRow;
  columns: ClickyColumn[];
  hasDetail: boolean;
}) {
  const [open, setOpen] = useState(false);
  const expandable = !!row.detail;

  return (
    <>
      <tr
        className={cn("border-b border-border align-top", expandable && "cursor-pointer hover:bg-accent/50")}
        onClick={expandable ? () => setOpen((current) => !current) : undefined}
      >
        {hasDetail && (
          <td className="px-2 py-2 text-center text-muted-foreground">
            {expandable ? (open ? "▼" : "▶") : ""}
          </td>
        )}
        {columns.map((column) => (
          <td key={column.name} className={cn("px-2 py-2", alignmentClass(column.align))}>
            <ClickyNodeRenderer node={row.cells[column.name]} />
          </td>
        ))}
      </tr>
      {open && row.detail && (
        <tr>
          <td colSpan={columns.length + (hasDetail ? 1 : 0)} className="bg-muted/40 p-density-3">
            <div className="rounded-md border border-border bg-background p-density-3">
              <ClickyNodeRenderer node={row.detail} />
            </div>
          </td>
        </tr>
      )}
    </>
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

  if (style.textTransform === "uppercase" || style.textTransform === "lowercase" || style.textTransform === "capitalize") {
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

  if (style.truncateMode === "suffix" && style.maxWidth && (!style.maxLines || style.maxLines <= 1)) {
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

function compareClickyValues(left: string, right: string): number {
  const leftNumber = Number(left);
  const rightNumber = Number(right);

  if (!Number.isNaN(leftNumber) && !Number.isNaN(rightNumber)) {
    return leftNumber - rightNumber;
  }

  return left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" });
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

function alignmentClass(align?: ClickyColumn["align"]): string | undefined {
  if (align === "right") return "text-right";
  if (align === "center") return "text-center";
  return undefined;
}

function isBlockHtml(html: string): boolean {
  return /<(div|p|pre|table|ul|ol|li|details|blockquote|h[1-6])/i.test(html);
}
