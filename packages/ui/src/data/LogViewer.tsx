import { useMemo, useState, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { AnsiHtml } from "./AnsiHtml";
import { countLogRows, parseLogSections, takeLogRows, type LogSection, type ParsedLog } from "./log-sections";
import { ProgressBar } from "./ProgressBar";

function renderSections(sections: LogSection[]): ReactNode[] {
  return sections.map((section, i) =>
    section.kind === "text" ? (
      <AnsiHtml key={i} as="span" text={section.text} />
    ) : (
      <details key={i} open={!section.closed} className="block" data-log-group={section.name}>
        <summary className="cursor-pointer select-none opacity-80 hover:opacity-100">
          {section.name || "group"}
          <span className="ml-1 opacity-60">({section.lines} {section.lines === 1 ? "line" : "lines"})</span>
        </summary>
        <div className="border-l border-current/20 pl-2">{renderSections(section.children)}</div>
      </details>
    ),
  );
}

export type LogViewerProps = {
  /**
   * Raw log text separated by newlines, both streams interleaved. ANSI SGR
   * escapes are styled and workflow commands are read: `::group::` markers
   * render as collapsible sections, a `::status::` as a line unless it repeats,
   * and the latest description, status and progress below the log. A Raw toggle
   * shows the text as it was printed.
   */
  logs: string;
  /** Number of rows shown before the viewer is expanded. Ignored when `maxHeight` is set. */
  collapsedLines?: number;
  /** Shows only the last rows, e.g. as a preview of a longer log. */
  tailLines?: number;
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

/** What the log last reported about the work it is of. */
function LogStatus({ log, className }: { log: ParsedLog; className: string }) {
  const { description, status, progress } = log;
  return (
    <div className={cn("flex items-center gap-2 rounded-b border border-t-0 px-1.5 py-1 text-[11px]", className)} data-log-status="">
      {description && <span className="shrink-0 font-medium">{description}</span>}
      {status && <span className="min-w-0 flex-1 truncate" title={status}>{status}</span>}
      {progress && (
        <span className="ml-auto flex shrink-0 items-center gap-1.5 tabular-nums">
          <ProgressBar
            label="Progress"
            segments={[{ count: progress.done, color: "bg-blue-500", label: "done" }]}
            total={progress.total}
            height="h-1.5"
            className="w-24"
          />
          {progress.done}/{progress.total}
        </span>
      )}
    </div>
  );
}

export function LogViewer({
  logs,
  collapsedLines = 5,
  tailLines,
  maxHeight,
  maxExpandedVh = 70,
  variant = "muted",
  bgClass,
  borderClass,
  className,
}: LogViewerProps) {
  const [expanded, setExpanded] = useState(false);
  const [raw, setRaw] = useState(false);
  const parsed = useMemo(() => parseLogSections(logs), [logs]);
  const all = useMemo<LogSection[]>(
    () => (raw ? [{ kind: "text", text: logs }] : parsed.sections),
    [raw, logs, parsed],
  );
  const sections = useMemo(() => {
    if (tailLines !== undefined) return takeLogRows(all, tailLines, "tail");
    return expanded || maxHeight ? all : takeLogRows(all, collapsedLines, "head");
  }, [all, tailLines, expanded, maxHeight, collapsedLines]);
  const rows = useMemo(() => countLogRows(all), [all]);
  const hasMore = tailLines === undefined && rows > collapsedLines;
  const tone = VARIANTS[variant];
  const showStatus = !raw && !!(parsed.description || parsed.status || parsed.progress);

  const collapsedHeight = maxHeight ?? `${collapsedLines * 1.4}em`;
  const bg = bgClass ?? tone.bg;
  const border = borderClass ?? tone.border;

  return (
    <div className={cn("relative", className)}>
      <pre
        className={cn(
          "mt-0.5 text-[11px] rounded p-1.5 whitespace-pre-wrap overflow-y-auto border transition-all duration-200",
          showStatus && "rounded-b-none",
          tone.text,
          bg,
          border,
        )}
        style={{ maxHeight: expanded ? `${maxExpandedVh}vh` : collapsedHeight }}
        data-log-variant={variant}
      >
        {renderSections(sections)}
      </pre>
      {parsed.hasCommands && (
        <button
          type="button"
          aria-pressed={raw}
          title="Show the log exactly as it was printed"
          className={cn(
            "absolute right-1 top-1.5 rounded border px-1 text-[10px] hover:opacity-100",
            raw ? "opacity-100" : "opacity-60",
            tone.text,
            bg,
            border,
          )}
          onClick={() => setRaw((value) => !value)}
        >
          Raw
        </button>
      )}
      {showStatus && <LogStatus log={parsed} className={cn(tone.text, bg, border)} />}
      {hasMore && (
        <button
          type="button"
          className={cn(
            "text-[10px] mt-0.5",
            expanded ? "text-muted-foreground" : "text-primary hover:opacity-80",
          )}
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? `▲ Collapse (${rows} lines)` : `▼ Show more (${rows} lines)`}
        </button>
      )}
    </div>
  );
}
