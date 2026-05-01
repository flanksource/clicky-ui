import { useEffect, useMemo, useState } from "react";
import { JvmStackFrameRow } from "./JvmStackTrace";
import {
  parseJavaStackTrace,
  type ParsedStackFrame,
  type ParsedStackTrace,
} from "./stacktrace-parse";
import { highlightCode, loadShikiTransformers } from "../code-highlight";

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

  return (
    <div className={className}>
      {(parsed.exceptionClass || parsed.message) && (
        <div className="font-mono text-xs font-semibold text-red-600 dark:text-red-400">
          {[parsed.exceptionClass, parsed.message].filter(Boolean).join(": ")}
        </div>
      )}
      {parsed.causedBy.map((cause, i) => (
        <div key={i} className="font-mono text-[11px] text-orange-600 dark:text-orange-400">
          Caused by: {cause}
        </div>
      ))}
      {visibleFrames.map((frame, idx) => (
        <FrameWithSource key={`${frame.functionName}-${idx}`} frame={frame} />
      ))}
    </div>
  );
}

function FrameWithSource({ frame }: { frame: ParsedStackFrame }) {
  return (
    <div className="space-y-0.5">
      <JvmStackFrameRow frame={frame} />
      {frame.sourceLines && frame.sourceLines.length > 0 ? <SourceWindow frame={frame} /> : null}
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
  const language = frame.sourceLanguage ?? "java";

  const annotatedSource = useMemo(
    () => buildAnnotatedSource(lines, start, focal, language),
    [lines, start, focal, language],
  );

  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    if (!annotatedSource) {
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
  }, [annotatedSource, language]);

  // CSS-counter-driven line-number gutter: the wrapping <div> seeds a
  // counter that each rendered `.line` increments. `--shiki-start` lets
  // us start counting from the absolute frame line number rather than 1.
  // Without `start` we'd need a server-rendered `<ol start="...">` which
  // would fight Shiki's own `<span class="line">` markup.
  const counterStart = start - 1;

  if (!html) {
    return (
      <pre className="ml-6 rounded border border-border/50 bg-muted/30 p-2 font-mono text-[11px] leading-relaxed whitespace-pre overflow-x-auto">
        {lines.map((src, i) => {
          const lineNum = start + i;
          const isFocal = lineNum === focal;
          return (
            <div
              key={i}
              className={
                isFocal
                  ? "flex gap-3 bg-red-500/10 font-bold text-red-700 dark:text-red-400"
                  : "flex gap-3"
              }
            >
              <span className="w-12 shrink-0 select-none text-right text-muted-foreground">
                {isFocal ? ">>>" : "   "} {lineNum}
              </span>
              <span className="whitespace-pre">{src}</span>
            </div>
          );
        })}
      </pre>
    );
  }

  return (
    <div
      className="stacktrace-source ml-6 overflow-x-auto rounded border border-border/50 bg-muted/30 p-2 text-[11px] leading-relaxed"
      style={{ ["--shiki-start" as string]: counterStart }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
