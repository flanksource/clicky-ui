import { useMemo, useState } from "react";
import { cn } from "../lib/utils";
import { AnsiHtml } from "./AnsiHtml";

export type LogViewerProps = {
  /** Raw log text separated by newlines; ANSI SGR escapes are styled. */
  logs: string;
  /** Number of lines shown before the viewer is expanded. Ignored when `maxHeight` is set. */
  collapsedLines?: number;
  /**
   * Collapsed height as a CSS length (e.g. `25cqh` for a quarter of the
   * enclosing size container). Every line is rendered and the block scrolls,
   * instead of cutting the text at `collapsedLines`.
   */
  maxHeight?: string;
  /** Maximum expanded height in viewport-height units. */
  maxExpandedVh?: number;
  /** `terminal` renders light text on black, like the console it came from. */
  variant?: "muted" | "terminal";
  /** Background utility class for the log container. */
  bgClass?: string;
  /** Border utility class for the log container. */
  borderClass?: string;
  /** Classes applied to the root wrapper. */
  className?: string;
};

const VARIANTS = {
  muted: {
    bg: "bg-muted",
    border: "border-border",
    text: "text-muted-foreground",
  },
  terminal: {
    bg: "bg-zinc-950",
    border: "border-zinc-800",
    text: "text-zinc-100",
  },
};

export function LogViewer({
  logs,
  collapsedLines = 5,
  maxHeight,
  maxExpandedVh = 70,
  variant = "muted",
  bgClass,
  borderClass,
  className,
}: LogViewerProps) {
  const [expanded, setExpanded] = useState(false);
  const lines = useMemo(() => logs.split("\n"), [logs]);
  const hasMore = lines.length > collapsedLines;
  const tone = VARIANTS[variant];

  const collapsedHeight = maxHeight ?? `${collapsedLines * 1.4}em`;
  const shown = expanded || maxHeight ? logs : lines.slice(0, collapsedLines).join("\n");

  return (
    <div className={cn("relative", className)}>
      <pre
        className={cn(
          "mt-0.5 text-[11px] rounded p-1.5 whitespace-pre-wrap overflow-y-auto border transition-all duration-200",
          tone.text,
          bgClass ?? tone.bg,
          borderClass ?? tone.border,
        )}
        style={{ maxHeight: expanded ? `${maxExpandedVh}vh` : collapsedHeight }}
        data-log-variant={variant}
      >
        <AnsiHtml as="span" text={shown} />
      </pre>
      {hasMore && (
        <button
          type="button"
          className={cn(
            "text-[10px] mt-0.5",
            expanded ? "text-muted-foreground" : "text-primary hover:opacity-80",
          )}
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? `▲ Collapse (${lines.length} lines)` : `▼ Show more (${lines.length} lines)`}
        </button>
      )}
    </div>
  );
}
