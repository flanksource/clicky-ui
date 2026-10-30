import { useMemo, useState } from "react";
import { Icon } from "../../data/Icon";
import { cn } from "../../lib/utils";
import { UiChevronDown, UiChevronRight } from "../../icons";
import type { FileFinding } from "../types";
import { SEVERITY_MARK, bySeverityThenLine, severityOf, squiggleUnder } from "./marks";

/** Source lines shown above and below a finding's line when its Problems row is expanded. */
const PROBLEM_CONTEXT_LINES = 3;

/** One Problems row: the finding, its source line truncated to one line, and on expand the lines around it. */
function ProblemRow({ finding, lines, onOpen, openLabel }: { finding: FileFinding; lines: readonly string[]; onOpen: (finding: FileFinding) => void; openLabel: string }) {
  const [expanded, setExpanded] = useState(false);
  const mark = SEVERITY_MARK[severityOf(finding.severity)];
  const first = Math.max(1, finding.line - PROBLEM_CONTEXT_LINES);
  const last = Math.min(lines.length, finding.line + PROBLEM_CONTEXT_LINES);
  const context = expanded ? lines.slice(first - 1, last).map((text, i) => ({ line: first + i, text })) : [];
  return (
    <li data-problem-line={finding.line}>
      <div className="flex items-start gap-1 px-1.5 py-1.5 text-xs hover:bg-muted/50">
        <button
          type="button"
          aria-expanded={expanded}
          aria-label={expanded ? "Hide context" : "Show context"}
          onClick={() => setExpanded((v) => !v)}
          className="flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Icon icon={expanded ? UiChevronDown : UiChevronRight} className="text-sm" />
        </button>
        <button
          type="button"
          onClick={() => onOpen(finding)}
          className="grid min-w-0 flex-1 grid-cols-[auto_2rem_minmax(0,1fr)_auto] items-center gap-x-2 gap-y-0.5 text-left"
          title={openLabel}
        >
          <Icon icon={mark.icon} className={cn("text-sm", mark.tone)} />
          <span data-problem-ln className="text-right font-mono text-[11px] tabular-nums text-muted-foreground">{finding.line}</span>
          <span className="truncate">{finding.message}</span>
          <span className="font-mono text-[11px] text-muted-foreground">{finding.source} {finding.rule}</span>
          {!expanded && (
            <span data-problem-context="line" className="col-span-2 col-start-3 truncate font-mono text-[11px] text-muted-foreground">
              {lines[finding.line - 1]?.trim() || " "}
            </span>
          )}
        </button>
      </div>
      {expanded && (
        <ol data-problem-context="block" className="mb-2 ml-8 mr-3 overflow-x-auto rounded border border-border bg-muted/30 py-1 font-mono text-[11px] leading-5">
          {context.map(({ line, text }) => (
            <li key={line} className="grid grid-cols-[2.5rem_1fr] pr-2">
              <span className="select-none pr-2 text-right tabular-nums text-muted-foreground">{line}</span>
              <span className="whitespace-pre">
                <span style={line === finding.line ? squiggleUnder(mark.stroke) : undefined}>{text || " "}</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </li>
  );
}

/** Every finding, worst first, as a VS Code-style Problems list; picking one opens it (`openLabel` names where). */
export function ProblemsList({ source, findings, onOpen, openLabel }: { source: string; findings: readonly FileFinding[]; onOpen: (finding: FileFinding) => void; openLabel: string }) {
  const lines = useMemo(() => source.split("\n"), [source]);
  if (findings.length === 0) return <p className="p-6 text-center text-xs text-muted-foreground">No problems in this file.</p>;
  return (
    <ul className="divide-y divide-border">
      {[...findings].sort(bySeverityThenLine).map((f) => (
        <ProblemRow key={`${f.line}:${f.rule}:${f.message}`} finding={f} lines={lines} onOpen={onOpen} openLabel={openLabel} />
      ))}
    </ul>
  );
}
