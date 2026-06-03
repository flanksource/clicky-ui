// FrameSourceWindow renders a decompiled / resolved source window beneath a
// stack frame: a gutter of absolute line numbers with the focal line (the one
// the frame points at) highlighted. It is the plain (non-Shiki) renderer shared
// by the JVM thread-dump frames and the exception stack-trace frames so both
// surfaces show inline source the same way.

export interface FrameSource {
  /** Source lines around the focal line. */
  sourceLines?: string[];
  /** Absolute line number for each entry in sourceLines (preferred gutter). */
  sourceLineNumbers?: number[];
  /** Line number of sourceLines[0] when sourceLineNumbers is absent. */
  sourceStartLine?: number;
  /** The frame's focal line, highlighted when it falls inside the window. */
  line?: number;
}

export function frameHasSource(frame: FrameSource): boolean {
  return !!frame.sourceLines && frame.sourceLines.length > 0;
}

export function FrameSourceWindow({ frame }: { frame: FrameSource }) {
  const lines = frame.sourceLines ?? [];
  if (lines.length === 0) return null;
  const start = frame.sourceStartLine ?? 0;
  const numbers = frame.sourceLineNumbers;
  const focal = frame.line ?? -1;

  return (
    <div className="mx-3 mb-2 ml-12 overflow-x-auto rounded border border-border/60 bg-muted/30 py-1 font-mono text-[11px] leading-relaxed">
      {lines.map((source, i) => {
        const lineNumber = numbers?.[i] ?? start + i;
        const isFocal = lineNumber === focal;
        return (
          <div
            key={`${lineNumber}-${i}`}
            className={[
              "grid min-w-max grid-cols-[3.5rem_minmax(24rem,1fr)] gap-3 px-2",
              isFocal
                ? "bg-red-500/10 font-semibold text-red-800 dark:text-red-300"
                : "text-foreground",
            ].join(" ")}
          >
            <span className="select-none text-right text-muted-foreground">
              {isFocal ? ">" : ""}
              {lineNumber}
            </span>
            <code className="whitespace-pre">{source || " "}</code>
          </div>
        );
      })}
    </div>
  );
}
