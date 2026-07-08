import { isValidElement, useEffect, useState, type ComponentType, type ReactNode } from "react";
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

type StreamdownComponent = ComponentType<{
  children: string;
  className?: string;
  parseIncompleteMarkdown?: boolean;
  components?: { code?: ComponentType<MarkdownCodeProps> };
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

const markdownComponents = { code: MarkdownCode };

/** Renders markdown with Streamdown, which is purpose-built for streaming LLM
 *  output (it gracefully handles incomplete markdown mid-stream). Fenced code
 *  blocks render via the library CodeBlock. Falls back to preformatted text
 *  until Streamdown loads or when it is not installed. */
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
