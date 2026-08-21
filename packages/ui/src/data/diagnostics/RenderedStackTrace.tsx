import { useMemo } from "react";
import {
  parseJavaStackTrace,
  type ParsedStackFrame,
  type ParsedStackTrace,
} from "./stacktrace-parse";
import { Icon } from "../Icon";
import { UiStackFrameDot, UiError } from "../../icons";
import { StackFrameRow, type StackFrameActions } from "./StackFrameRow";
import type { FrameSource } from "./FrameSourceWindow.utils";

// SourceResolver matches the Go clicky.SourceResolver interface: given a
// frame, return surrounding source lines so the renderer can display inline
// context. Failures must be silent (return undefined) so a missing class
// never blocks the rest of the trace.
//
// The return shape is `FrameSource` — the same shape the source window
// consumes and the same one the JVM thread-dump resolver returns, so a caller
// that can resolve source for one surface can resolve it for both.
export type StackTraceSourceResolver = (
  frame: ParsedStackFrame,
  contextLines: number,
) => FrameSource | undefined;

export interface StackTraceProps {
  /**
   * Raw Java stack-trace string or a pre-parsed ParsedStackTrace
   * from a backend/parser.
   */
  input: string | ParsedStackTrace;
  /** Parser language. Currently Java stack traces are supported. */
  language?: "java";
  /** Optional source-line resolver for inline context under frames. */
  resolver?: StackTraceSourceResolver;
  /** Number of source lines to request around each frame. */
  contextLines?: number;
  /** Hide frames known to be runtime/library-only. */
  hideRuntimeOnly?: boolean;
  /** Only show frames whose class starts with one of these prefixes. */
  include?: string[];
  /** Hide frames whose class starts with one of these prefixes. */
  exclude?: string[];
  /** Trailing per-frame actions, revealed on hover/focus. */
  frameActions?: StackFrameActions;
  /** Classes applied to the stack-trace shell. */
  className?: string;
}

// StackTrace is the React counterpart to Go's clicky.StackTrace builder. Pass
// a raw exception dump and it parses + renders frames; pass a SourceResolver
// to get inline source context (±N lines) under each frame, with the focal
// line highlighted. Frames themselves are rendered by the shared StackFrameRow.
export function StackTrace({
  input,
  language = "java",
  resolver,
  contextLines = 3,
  hideRuntimeOnly = false,
  include,
  exclude,
  frameActions,
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
      // `line` stays the frame's own — it is what the window highlights, and a
      // resolver returning one would silently move the focal line off the throw.
      const { line: _ignored, ...source } = resolved;
      return { ...frame, ...source };
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
              icon={UiError}
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
              <Icon icon={UiStackFrameDot} className="mt-0.5 shrink-0 text-xs" />
              <span className="shrink-0 opacity-75">Caused by</span>
              <span className="min-w-0 break-all">{cause}</span>
            </div>
          ))}
        </div>
      )}
      <div className="divide-y divide-border/60">
        {visibleFrames.map((frame, idx) => (
          <StackFrameRow
            key={`${frame.functionName}-${idx}`}
            frame={frame}
            index={idx}
            showIndex
            {...(frameActions ? { frameActions } : {})}
          />
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
