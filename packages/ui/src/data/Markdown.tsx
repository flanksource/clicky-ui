import { useEffect, useState, type ComponentType } from "react";
import { cn } from "../lib/utils";

export type MarkdownProps = {
  /** Markdown source text. */
  text: string;
  /** Classes applied to the rendered markdown wrapper. */
  className?: string;
};

type StreamdownComponent = ComponentType<{
  children: string;
  className?: string;
  parseIncompleteMarkdown?: boolean;
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

/** Renders markdown with Streamdown, which is purpose-built for streaming LLM
 *  output (it gracefully handles incomplete markdown mid-stream). Falls back to
 *  preformatted text until Streamdown loads or when it is not installed. */
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
      <Streamdown parseIncompleteMarkdown>{text}</Streamdown>
    </div>
  );
}
