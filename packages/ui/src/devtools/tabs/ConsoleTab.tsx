import { useMemo } from "react";
import { LogsTable } from "../../data/LogsTable";
import type { DebugLogLine } from "../types";

/**
 * The server's own log, live in the browser.
 *
 * Two sources are merged here, and the seam is labelled rather than hidden.
 * A `request` line was captured structurally, with its values intact, at the
 * level the console armed; a `process` line was scraped from the writer the
 * logger was already using and has been rendered to text by the time it
 * arrives. Presenting them as one undifferentiated stream would imply the
 * second is as trustworthy as the first.
 */

export type ConsoleTabProps = {
  lines: DebugLogLine[];
  /** Show only lines belonging to this record. */
  recordId?: string | undefined;
  search?: string | undefined;
};

export function ConsoleTab({ lines, recordId, search }: ConsoleTabProps) {
  const rows = useMemo(() => {
    const scoped = recordId ? lines.filter((line) => line.recordId === recordId) : lines;
    return scoped.map(toLogRecord);
  }, [lines, recordId]);

  if (rows.length === 0) {
    return (
      <div className="p-density-6 text-center text-muted-foreground text-sm">
        {recordId
          ? "This capture logged nothing."
          : "No server log lines yet. The tail starts when the console connects."}
      </div>
    );
  }

  return (
    <LogsTable
      logs={rows}
      {...(search === undefined ? { showGlobalFilter: true } : { globalFilter: search })}
      showRawDetails
    />
  );
}

/**
 * Maps a line onto the canonical log row LogsTable normalizes.
 *
 * `seam` rather than an extra column: the tag list is where a row's provenance
 * already lives, and a column that reads "request" on most rows and "process"
 * on the rest would cost width to say very little.
 */
function toLogRecord(line: DebugLogLine): Record<string, unknown> {
  return {
    timestamp: line.time,
    level: line.level,
    logger: line.logger ?? "",
    message: line.message,
    tags: [line.source, line.event, line.recordId ? `record:${line.recordId.slice(0, 8)}` : ""].filter(
      Boolean,
    ),
    ...line.values,
  };
}
