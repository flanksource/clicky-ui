import { useEffect, useMemo, useState } from "react";
import {
  parseJavaStackTrace,
  type ParsedStackFrame,
  type ParsedStackTrace,
} from "./stacktrace-parse";
import { highlightCode, loadShikiTransformers } from "../code-highlight";
import { Icon } from "../Icon";

// SourceResolver matches the Go clicky.SourceResolver interface: given a
// frame, return surrounding source lines so the renderer can display inline
// context. Failures must be silent (return undefined) so a missing class
// never blocks the rest of the trace.
export type StackTraceSourceResolver = (
  frame: ParsedStackFrame,
  contextLines: number,
) =>
  | {
      lines: string[];
      startLine: number;
      language?: string;
    }
  | undefined;

export interface StackTraceProps {
  // Either a raw Java stack-trace string OR a pre-parsed ParsedStackTrace
  // (e.g. one received from a Go backend that already ran the parser there).
  input: string | ParsedStackTrace;
  language?: "java";
  resolver?: StackTraceSourceResolver;
  contextLines?: number;
  hideRuntimeOnly?: boolean;
  include?: string[];
  exclude?: string[];
  className?: string;
}

// StackTrace is the React counterpart to Go's clicky.StackTrace builder. Pass
// a raw exception dump and it parses + renders frames; pass a SourceResolver
// to get inline source context (±N lines) under each frame, with the focal
// line highlighted.
export function StackTrace({
  input,
  language = "java",
  resolver,
  contextLines = 3,
  hideRuntimeOnly = false,
  include,
  exclude,
  className,
}: StackTraceProps) {
  const parsed = useMemo<ParsedStackTrace>(() => {
    if (typeof input === "string") {
      return parseJavaStackTrace(input);
    }
    return input;
  }, [input, language]);

  const enrichedFrames = useMemo<ParsedStackFrame[]>(() => {
    if (!resolver) return parsed.frames;
    return parsed.frames.map((frame): ParsedStackFrame => {
      if (frame.sourceLines && frame.sourceLines.length > 0) return frame;
      const resolved = resolver(frame, contextLines);
      if (!resolved) return frame;
      const next: ParsedStackFrame = {
        ...frame,
        sourceLines: resolved.lines,
        sourceStartLine: resolved.startLine,
      };
      if (resolved.language !== undefined) next.sourceLanguage = resolved.language;
      return next;
    });
  }, [parsed.frames, resolver, contextLines]);

  const visibleFrames = useMemo(() => {
    return enrichedFrames.filter((frame) => {
      if (hideRuntimeOnly && frame.runtime) return false;
      if (exclude && exclude.some((p) => frame.class?.startsWith(p))) return false;
      if (include && include.length > 0) {
        return include.some((p) => frame.class?.startsWith(p));
      }
      return true;
    });
  }, [enrichedFrames, hideRuntimeOnly, include, exclude]);

  if (visibleFrames.length === 0 && !parsed.exceptionClass) return null;

  const hasFilteredFrames = visibleFrames.length !== enrichedFrames.length;

  return (
    <div
      className={[
        "overflow-hidden rounded-md border border-border bg-background text-foreground",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {(parsed.exceptionClass || parsed.message) && (
        <div className="border-b border-border bg-red-500/5 px-3 py-2">
          <div className="flex min-w-0 items-start gap-2">
            <Icon
              name="codicon:error"
              className="mt-0.5 shrink-0 text-sm text-red-600 dark:text-red-400"
            />
            <div className="min-w-0 flex-1">
              {parsed.exceptionClass && (
                <div className="break-all font-mono text-xs font-semibold text-red-700 dark:text-red-300">
                  {parsed.exceptionClass}
                </div>
              )}
              {parsed.message && (
                <div className="mt-0.5 whitespace-pre-wrap break-words text-xs text-foreground">
                  {parsed.message}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {parsed.causedBy.length > 0 && (
        <div className="space-y-1 border-b border-border bg-orange-500/5 px-3 py-2">
          {parsed.causedBy.map((cause, i) => (
            <div
              key={i}
              className="flex min-w-0 items-start gap-2 font-mono text-[11px] text-orange-700 dark:text-orange-300"
            >
              <Icon name="codicon:debug-stackframe-dot" className="mt-0.5 shrink-0 text-xs" />
              <span className="shrink-0 opacity-75">Caused by</span>
              <span className="min-w-0 break-all">{cause}</span>
            </div>
          ))}
        </div>
      )}
      <div className="divide-y divide-border/60">
        {visibleFrames.map((frame, idx) => (
          <FrameWithSource key={`${frame.functionName}-${idx}`} frame={frame} index={idx} />
        ))}
      </div>
      {hasFilteredFrames && (
        <div className="border-t border-border bg-muted/30 px-3 py-1.5 text-[11px] text-muted-foreground">
          Showing {visibleFrames.length} of {enrichedFrames.length} frames
        </div>
      )}
    </div>
  );
}

function FrameWithSource({ frame, index }: { frame: ParsedStackFrame; index: number }) {
  const hasSource = frame.sourceLines && frame.sourceLines.length > 0;

  return (
    <div className={hasSource ? "bg-amber-500/[0.03]" : undefined}>
      <StackFrameRow frame={frame} index={index} />
      {hasSource ? <SourceWindow frame={frame} /> : null}
    </div>
  );
}

function StackFrameRow({ frame, index }: { frame: ParsedStackFrame; index: number }) {
  const iconName = frame.nativeMethod
    ? "codicon:chip"
    : frame.runtime
      ? "codicon:debug-step-over"
      : "codicon:symbol-method";
  const className = frame.class;
  const methodName = frame.displayName || frame.method || frame.functionName;

  return (
    <div
      className={[
        "grid grid-cols-[2rem_minmax(0,1fr)] gap-2 px-3 py-1.5 text-xs",
        frame.runtime ? "text-muted-foreground" : "text-foreground",
      ].join(" ")}
    >
      <div className="flex items-start justify-end gap-1 pt-0.5 font-mono text-[10px] text-muted-foreground">
        <span>{index + 1}</span>
        <Icon name={iconName} className="mt-px shrink-0 text-[11px]" />
      </div>
      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="min-w-0 break-all font-mono font-semibold leading-4">{methodName}</span>
          {className && (
            <span className="min-w-0 break-all font-mono text-[11px] text-muted-foreground">
              {className}
            </span>
          )}
          {frame.location && (
            <span className="rounded border border-border bg-muted/40 px-1.5 py-px font-mono text-[10px] text-muted-foreground">
              {frame.location}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Picks the language-appropriate inline comment prefix for the
// `[!code error]` marker that Shiki's transformerNotationErrorLevel
// recognises (https://shiki.style/packages/transformers#transformernotationerrorlevel).
// We deliberately stick to single-line markers — block comments would
// confuse the transformer's per-line scan.
function inlineCommentPrefix(language: string): string {
  switch (language) {
    case "python":
    case "py":
    case "bash":
    case "sh":
    case "shell":
    case "ruby":
    case "rb":
    case "yaml":
    case "yml":
    case "toml":
      return "#";
    default:
      // Java, Go, TS/JS, C/C++, C#, Rust, Kotlin, Swift, Scala, Groovy…
      return "//";
  }
}

function buildAnnotatedSource(
  lines: string[],
  startLine: number,
  focalLine: number,
  language: string,
): string {
  const focalIdx = focalLine - startLine;
  if (focalIdx < 0 || focalIdx >= lines.length) {
    return lines.join("\n");
  }
  const prefix = inlineCommentPrefix(language);
  return lines
    .map((src, i) => (i === focalIdx ? `${src} ${prefix} [!code error]` : src))
    .join("\n");
}

function SourceWindow({ frame }: { frame: ParsedStackFrame }) {
  const start = frame.sourceStartLine ?? 0;
  const focal = frame.line ?? -1;
  const lines = frame.sourceLines ?? [];
  const lineNumbers = frame.sourceLineNumbers;
  const language = frame.sourceLanguage ?? "java";

  const rows = useMemo(
    () =>
      lines.map((src, i) => ({
        source: src,
        lineNumber: lineNumbers?.[i] ?? start + i,
      })),
    [lineNumbers, lines, start],
  );

  const hasExplicitLineNumbers = lineNumbers != null && lineNumbers.length > 0;

  const annotatedSource = useMemo(
    () => buildAnnotatedSource(lines, start, focal, language),
    [lines, start, focal, language],
  );

  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    if (!annotatedSource || hasExplicitLineNumbers) {
      setHtml(null);
      return;
    }
    let cancelled = false;
    loadShikiTransformers()
      .then(({ transformerNotationErrorLevel }) =>
        highlightCode(annotatedSource, {
          lang: language,
          transformers: [transformerNotationErrorLevel()],
        }),
      )
      .then((out) => {
        if (!cancelled) setHtml(out);
      });
    return () => {
      cancelled = true;
    };
  }, [annotatedSource, hasExplicitLineNumbers, language]);

  // CSS-counter-driven line-number gutter: the wrapping <div> seeds a
  // counter that each rendered `.line` increments. `--shiki-start` lets
  // us start counting from the absolute frame line number rather than 1.
  // Without `start` we'd need a server-rendered `<ol start="...">` which
  // would fight Shiki's own `<span class="line">` markup.
  const counterStart = start - 1;

  if (!html || hasExplicitLineNumbers) {
    return <SourceRows rows={rows} focal={focal} />;
  }

  return (
    <div
      className="stacktrace-source ml-6 overflow-x-auto rounded border border-border/50 bg-muted/30 p-2 text-[11px] leading-relaxed"
      style={{ ["--shiki-start" as string]: counterStart }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function SourceRows({
  rows,
  focal,
}: {
  rows: Array<{ source: string; lineNumber: number }>;
  focal: number;
}) {
  return (
    <div className="mx-3 mb-2 ml-12 overflow-x-auto rounded border border-border/60 bg-muted/30 py-1 font-mono text-[11px] leading-relaxed">
      {rows.map((row, i) => {
        const isFocal = row.lineNumber === focal;
        return (
          <div
            key={`${row.lineNumber}-${i}`}
            className={[
              "grid min-w-max grid-cols-[3.5rem_minmax(24rem,1fr)] gap-3 px-2",
              isFocal
                ? "bg-red-500/10 font-semibold text-red-800 dark:text-red-300"
                : "text-foreground",
            ].join(" ")}
          >
            <span className="select-none text-right text-muted-foreground">
              {isFocal ? ">" : ""}
              {row.lineNumber}
            </span>
            <code className="whitespace-pre">{row.source || " "}</code>
          </div>
        );
      })}
    </div>
  );
}
