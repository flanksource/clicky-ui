import { useEffect, useRef } from "react";
import { Button } from "../../components/button";
import { AnsiHtml } from "../AnsiHtml";
import { traceFeedKey, type TraceFeedRecord } from "./trace-feed";

const sgr = String.raw`(?:\x1b\[[0-9;]*m)*`;
const recordPrefix = new RegExp(String.raw`^${sgr}([a-z0-9_.\/-]+) #(\d+)${sgr}[^\S\r\n]+`, "i");
const clockPrefix = new RegExp(String.raw`^${sgr}(\d{2}:\d{2}:\d{2}\.\d{3})${sgr}[^\S\r\n]+`);

function streamAnsi({ ansi, kind, seq, timestamp }: TraceFeedRecord, utcTime: string | undefined): string {
  if (typeof ansi !== "string") throw new Error("ANSI trace feed record is missing its presentation");
  const prefix = recordPrefix.exec(ansi);
  const prefixKind = prefix?.[1];
  if (!prefix || !(prefixKind === kind || prefixKind?.startsWith(`${kind}/`)) || prefix[2] !== String(seq)) return ansi;

  const message = ansi.slice(prefix[0].length);
  const clock = clockPrefix.exec(message);
  if (!clock || !timestamp) return message;
  const recordedClock = /T(\d{2}:\d{2}:\d{2})(?:\.(\d+))?/.exec(timestamp);
  const sourceTime = recordedClock && `${recordedClock[1]}.${(recordedClock[2] ?? "").padEnd(3, "0").slice(0, 3)}`;
  return clock[1] === utcTime || clock[1] === sourceTime ? message.slice(clock[0].length) : message;
}

const timestampClass = "w-[16ch] shrink-0 whitespace-nowrap tabular-nums text-muted-foreground";

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
      const utcTime = row.timestamp === null ? undefined : new Date(row.timestamp).toISOString().slice(11, 23);
      return <Button key={traceFeedKey(row)} variant="ghost" className="h-auto w-full items-start justify-start px-2 py-1 text-left font-mono text-xs" onClick={() => onSelect(row)}>
        {utcTime && row.timestamp
          ? <time className={timestampClass} dateTime={row.timestamp} title={row.timestamp}>{utcTime} UTC</time>
          : <span className={timestampClass} aria-label="Timestamp unavailable">—</span>}
        {presentation === "ansi"
          ? <AnsiHtml as="span" text={streamAnsi(row, utcTime)} className="min-w-0 whitespace-pre-wrap break-words" />
          : <span className="min-w-0 whitespace-pre-wrap break-words">{row.summary}</span>}
      </Button>;
    })}
  </div>;
}
