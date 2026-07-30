import {
  isValidElement,
  useEffect,
  useState,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "../lib/utils";
import { CodeBlock } from "./CodeBlock";

export type MarkdownProps = {
  /** Markdown source text. */
  text: string;
  /** Classes applied to the rendered markdown wrapper. */
  className?: string;
};

// Streamdown routes a fenced code block to the `code` override with a `data-block`
// marker (injected by its default `pre` handler); inline code arrives without it.
type MarkdownCodeProps = {
  className?: string;
  children?: ReactNode;
  "data-block"?: string;
};

// Every override also receives the source `node`, which is not a DOM attribute —
// each one drops it rather than spreading it onto the element. `style` carries
// the per-column alignment GFM puts on table cells.
type MarkdownElementProps = {
  className?: string;
  children?: ReactNode;
  style?: CSSProperties;
  node?: unknown;
};

type StreamdownComponent = ComponentType<{
  children: string;
  className?: string;
  parseIncompleteMarkdown?: boolean;
  components?: {
    code?: ComponentType<MarkdownCodeProps>;
    ul?: ComponentType<MarkdownElementProps>;
    ol?: ComponentType<MarkdownElementProps>;
    table?: ComponentType<MarkdownElementProps>;
    thead?: ComponentType<MarkdownElementProps>;
    tbody?: ComponentType<MarkdownElementProps>;
    th?: ComponentType<MarkdownElementProps>;
    td?: ComponentType<MarkdownElementProps>;
  };
}>;

let loadPromise: Promise<StreamdownComponent | null> | null = null;

// Streamdown is an optional peer dependency (like marked/shiki). It is loaded on
// demand so the core library does not force it on consumers; while it loads (or
// if it is absent) we fall back to preformatted text.
function loadStreamdown(): Promise<StreamdownComponent | null> {
  if (!loadPromise) {
    loadPromise = import("streamdown")
      .then((m) => m.Streamdown as unknown as StreamdownComponent)
      .catch((err) => {
        console.warn("clicky-ui: streamdown not available; rendering markdown as plain text", err);
        return null;
      });
  }
  return loadPromise;
}

function nodeText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join("");
  if (isValidElement(node)) return nodeText((node.props as { children?: ReactNode }).children);
  return "";
}

// Render fenced code blocks with the library's theme-aware CodeBlock instead of
// Streamdown's built-in block, whose Shiki `<pre>` keeps a light background that
// clashes with the app theme (a white code body inside the dark block chrome).
// Inline code keeps Streamdown's default inline styling.
function MarkdownCode({ className, children, ...rest }: MarkdownCodeProps) {
  if (!("data-block" in rest)) {
    return (
      <code className={cn("rounded bg-muted px-1.5 py-0.5 font-mono text-sm", className)}>
        {children}
      </code>
    );
  }
  const language = /language-([\w-]+)/.exec(className ?? "")?.[1];
  const source = nodeText(children).replace(/\n$/, "");
  return (
    <CodeBlock
      source={source}
      language={language}
      className="not-prose my-4"
      copyable
      downloadable
      themeToggle
    />
  );
}

// Streamdown indents nested lists with `[li_&]:pl-6`, an arbitrary-variant class
// that only compiles if the consumer's Tailwind happens to scan streamdown's
// dist — otherwise every level renders flush left. Own the list styling here so
// the marker and the indent ship from this library's own source. Markers sit
// outside the padding so each level steps in cleanly. Task lists drop both: the
// checkbox is the marker.
function MarkdownList({ className, children }: MarkdownElementProps) {
  const isTaskList = className?.includes("contains-task-list");
  return (
    <ul
      className={cn("whitespace-normal", isTaskList ? "list-none pl-0" : "list-disc pl-6", className)}
    >
      {children}
    </ul>
  );
}

function MarkdownOrderedList({ className, children }: MarkdownElementProps) {
  return <ol className={cn("list-decimal whitespace-normal pl-6", className)}>{children}</ol>;
}

// Streamdown wraps tables in a `bg-sidebar` card with its own copy/download/
// fullscreen chrome — a dark navy box around a light table under this library's
// tokens — and puts the header shading behind `bg-muted/80`, an opacity-modifier
// class the consumer's Tailwind never sees. Own the whole table instead, styled
// like DataTable: a bordered scroll container so wide tables scroll rather than
// overflow the page.
function MarkdownTable({ className, children }: MarkdownElementProps) {
  return (
    <div className="not-prose my-4 max-w-full overflow-x-auto rounded-md border border-border">
      <table className={cn("w-max min-w-full table-auto text-left text-sm", className)}>
        {children}
      </table>
    </div>
  );
}

function MarkdownTableHead({ className, children }: MarkdownElementProps) {
  return <thead className={cn("border-b border-border bg-muted", className)}>{children}</thead>;
}

function MarkdownTableBody({ className, children }: MarkdownElementProps) {
  return <tbody className={cn("divide-y divide-border", className)}>{children}</tbody>;
}

// `style` holds the column alignment from the delimiter row, so it must survive.
function MarkdownTableHeaderCell({ className, style, children }: MarkdownElementProps) {
  return (
    <th
      className={cn("whitespace-nowrap px-density-3 py-density-2 font-semibold", className)}
      style={style}
    >
      {children}
    </th>
  );
}

function MarkdownTableCell({ className, style, children }: MarkdownElementProps) {
  return (
    <td className={cn("px-density-3 py-density-2 align-top", className)} style={style}>
      {children}
    </td>
  );
}

const markdownComponents = {
  code: MarkdownCode,
  ul: MarkdownList,
  ol: MarkdownOrderedList,
  table: MarkdownTable,
  thead: MarkdownTableHead,
  tbody: MarkdownTableBody,
  th: MarkdownTableHeaderCell,
  td: MarkdownTableCell,
};

/** Renders markdown with Streamdown, which is purpose-built for streaming LLM
 *  output (it gracefully handles incomplete markdown mid-stream). Fenced code
 *  blocks render via the library CodeBlock, and lists and tables are styled
 *  here rather than by Streamdown. Falls back to preformatted text until
 *  Streamdown loads or when it is not installed. */
export function Markdown({ text, className }: MarkdownProps) {
  const [Streamdown, setStreamdown] = useState<StreamdownComponent | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadStreamdown().then((comp) => {
      if (!cancelled) setStreamdown(() => comp);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!Streamdown) {
    return <pre className={cn("whitespace-pre-wrap text-sm", className)}>{text}</pre>;
  }

  return (
    <div className={cn("prose prose-sm max-w-none dark:prose-invert", className)}>
      <Streamdown parseIncompleteMarkdown components={markdownComponents}>
        {text}
      </Streamdown>
    </div>
  );
}
