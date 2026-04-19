import { useMemo, useState } from "react";
import { cn } from "../lib/utils";

export type LogViewerProps = {
  logs: string;
  collapsedLines?: number;
  maxExpandedVh?: number;
  bgClass?: string;
  borderClass?: string;
  className?: string;
};

export function LogViewer({
  logs,
  collapsedLines = 5,
  maxExpandedVh = 70,
  bgClass = "bg-muted",
  borderClass = "border-border",
  className,
}: LogViewerProps) {
  const [expanded, setExpanded] = useState(false);
  const lines = useMemo(() => logs.split("\n"), [logs]);
  const hasMore = lines.length > collapsedLines;

  const maxHeight = expanded ? `${maxExpandedVh}vh` : `${collapsedLines * 1.4}em`;

  return (
    <div className={cn("relative", className)}>
      <pre
        className={cn(
          "mt-0.5 text-[11px] text-muted-foreground rounded p-1.5 whitespace-pre-wrap overflow-y-auto border transition-all duration-200",
          bgClass,
          borderClass,
        )}
        style={{ maxHeight }}
      >
        {expanded ? logs : lines.slice(0, collapsedLines).join("\n")}
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
