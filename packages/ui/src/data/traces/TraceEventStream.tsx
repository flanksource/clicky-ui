import { useEffect, useRef } from "react";
import { Button } from "../../components/button";
import { AnsiHtml } from "../AnsiHtml";
import { traceFeedKey, type TraceFeedRecord } from "./trace-feed";

export function TraceEventStream({ rows, presentation, following, onSelect }: {
  rows: TraceFeedRecord[];
  presentation: "text" | "ansi";
  following: boolean;
  onSelect: (record: TraceFeedRecord) => void;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const atTail = useRef(true);
  useEffect(() => {
    if (following && atTail.current && viewport.current) viewport.current.scrollTop = viewport.current.scrollHeight;
  }, [rows, following]);
  return <div ref={viewport} role="log" aria-label="Trace events" aria-live="off" className="min-h-0 flex-1 overflow-auto rounded-md border border-border bg-sidebar p-2 text-sidebar-foreground" onScroll={event => {
    const node = event.currentTarget;
    atTail.current = node.scrollHeight - node.scrollTop - node.clientHeight < 32;
  }}>
    {!rows.length && <p className="p-2 text-sm text-muted-foreground">Waiting for records from the armed captures</p>}
    {rows.map(row => {
      if (presentation === "ansi" && typeof row.ansi !== "string") throw new Error("ANSI trace feed record is missing its presentation");
      return <Button key={traceFeedKey(row)} variant="ghost" className="h-auto w-full justify-start px-2 py-1 text-left font-mono text-xs" onClick={() => onSelect(row)}>
        {presentation === "ansi" ? <AnsiHtml as="span" text={row.ansi!} className="min-w-0 whitespace-pre-wrap break-words" /> : <span className="whitespace-pre-wrap break-words">{row.summary}</span>}
      </Button>;
    })}
  </div>;
}
