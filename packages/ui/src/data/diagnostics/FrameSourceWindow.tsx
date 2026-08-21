import { useEffect, useMemo, useState } from "react";
import { highlightToLines, type HighlightedLine } from "../code-highlight";
import { HighlightedTokens } from "../HighlightedTokens";
import type { FrameSource } from "./FrameSourceWindow.utils";

// FrameSourceWindow renders a decompiled / resolved source window beneath a
// stack frame: a gutter of absolute line numbers with the focal line (the one
// the frame points at) highlighted. It is the single source-window renderer,
// shared by the JVM thread-dump frames, the exception stack-trace frames, and
// frameless callers that have source but no stack (a template error, a single
// decompiled class).
//
// The gutter is painted explicitly rather than by embedding Shiki's own `<pre>`,
// because `sourceLineNumbers` is frequently NOT a contiguous run: arthas `jad`
// returns bytecode-keyed line numbers with gaps. A CSS-counter gutter would
// silently renumber those. Tokenizing via `highlightToLines` keeps the
// highlighting while letting us own the numbering — the same trade CodeDiff makes.
export function FrameSourceWindow({
  frame,
  className,
}: {
  frame: FrameSource;
  className?: string;
}) {
  const lines = useMemo(() => frame.sourceLines ?? [], [frame.sourceLines]);
  const start = frame.sourceStartLine ?? 0;
  const numbers = frame.sourceLineNumbers;
  const focal = frame.line ?? -1;
  const language = frame.sourceLanguage ?? "java";

  const [tokens, setTokens] = useState<HighlightedLine[] | null>(null);

  useEffect(() => {
    if (lines.length === 0) {
      setTokens(null);
      return;
    }
    let cancelled = false;
    highlightToLines(lines.join("\n"), { lang: language }).then((out) => {
      if (!cancelled) setTokens(out);
    });
    return () => {
      cancelled = true;
    };
  }, [lines, language]);

  if (lines.length === 0) return null;

  return (
    <div
      className={[
        "mx-3 mb-2 ml-12 overflow-x-auto rounded border border-border/60 bg-muted/30 py-1 font-mono text-[11px] leading-relaxed",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {lines.map((source, i) => {
        const lineNumber = numbers?.[i] ?? start + i;
        const isFocal = lineNumber === focal;
        return (
          <div
            key={`${lineNumber}-${i}`}
            className={[
              "grid min-w-max grid-cols-[3.5rem_minmax(24rem,1fr)] gap-3 px-2",
              isFocal ? "bg-red-500/10 font-semibold text-red-800 dark:text-red-300" : "text-foreground",
            ].join(" ")}
          >
            <span className="select-none text-right text-muted-foreground">
              {isFocal ? ">" : ""}
              {lineNumber}
            </span>
            <code className="whitespace-pre">
              {source ? <HighlightedTokens tokens={tokens?.[i]} content={source} /> : " "}
            </code>
          </div>
        );
      })}
    </div>
  );
}
