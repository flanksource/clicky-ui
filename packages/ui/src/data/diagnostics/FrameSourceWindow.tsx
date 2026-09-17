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
  focalTone = "error",
}: {
  frame: FrameSource;
  className?: string;
  /**
   * Styling for the focal line. `"error"` (the default, so existing callers
   * render unchanged) is the red highlight meaning "this line failed".
   * `"neutral"` marks "the line that made this call" — a subtle theme-token
   * highlight with no red.
   */
  focalTone?: "error" | "neutral";
}) {
  const lines = useMemo(() => frame.sourceLines ?? [], [frame.sourceLines]);
  const start = frame.sourceStartLine ?? 0;
  const numbers = frame.sourceLineNumbers;
  const focal = frame.line ?? -1;
  // No default language: this renderer is shared by JVM frames, exception frames
  // and frameless callers, so a Go dump or a template error must not be coloured
  // with Java grammar. `highlightToLines` returns null without a language and
  // `HighlightedTokens` then paints the plain source.
  const language = frame.sourceLanguage;

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

  const focalClassName =
    focalTone === "neutral"
      ? "bg-primary/10 font-semibold text-foreground"
      : "bg-red-500/10 font-semibold text-red-800 dark:text-red-300";

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
        const known = numbers === undefined || lineNumber > 0;
        const isFocal = known && lineNumber === focal;
        return (
          <div
            key={`${lineNumber}-${i}`}
            className={[
              "grid min-w-max grid-cols-[3.5rem_minmax(24rem,1fr)] gap-3 px-2",
              isFocal ? focalClassName : "text-foreground",
            ].join(" ")}
          >
            <span className="select-none text-right text-muted-foreground">
              {isFocal ? ">" : ""}
              {known ? lineNumber : ""}
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
