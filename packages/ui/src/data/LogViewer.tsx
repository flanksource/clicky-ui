import { useMemo, useState, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { AnsiHtml } from "./AnsiHtml";
import { parseLogSections, type LogSection } from "./log-sections";

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
   * Raw log text separated by newlines; ANSI SGR escapes are styled and
   * GitHub Actions `::group::`/`::endgroup::` markers render as collapsible
   * sections.
   */
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
  const sections = useMemo(() => parseLogSections(shown), [shown]);
  const grouped = sections.some((section) => section.kind === "group");

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
        {grouped ? renderSections(sections) : <AnsiHtml as="span" text={shown} />}
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
