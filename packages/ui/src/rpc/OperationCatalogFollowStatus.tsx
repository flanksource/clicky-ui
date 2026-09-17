import { Badge, type BadgeStatus } from "../data/Badge";
import type { LogTailError, LogTailStatus } from "../hooks/use-log-tail";
import { cn } from "../lib/utils";
import { InlineError } from "./InlineError";

export type OperationCatalogFollowStatusProps = {
  status: LogTailStatus;
  error: LogTailError | null;
  /** Rows the tail buffer evicted under its cap — non-zero means the live
   *  view no longer holds the whole run, not just the visible page. */
  droppedRows: number;
  /** Live rows folded into the table that were not already on it. */
  addedCount: number;
  className?: string;
};

const STATUS_LABEL: Record<LogTailStatus, string> = {
  idle: "Not following",
  starting: "Starting…",
  streaming: "Live",
  "connection lost — retrying": "Reconnecting…",
  completed: "Ended",
  failed: "Follow failed",
  stopped: "Stopped",
  interrupted: "Interrupted",
};

const STATUS_TONE: Record<LogTailStatus, BadgeStatus> = {
  idle: "info",
  starting: "info",
  streaming: "success",
  "connection lost — retrying": "warning",
  completed: "info",
  failed: "error",
  stopped: "info",
  interrupted: "warning",
};

/**
 * Compact live/streaming/starting/ended indicator for OperationCatalog's
 * `follow` mode — plus whatever the tail could not keep quiet about: rows the
 * buffer cap evicted, and a stream error. Neither is ever swallowed; a
 * follow session that is degraded or broken says so right here rather than
 * leaving the table looking like an ordinary, healthy page.
 */
export function OperationCatalogFollowStatus({
  status,
  error,
  droppedRows,
  addedCount,
  className,
}: OperationCatalogFollowStatusProps) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-2 text-xs", className)}
      data-slot="operation-catalog-follow-status"
    >
      <Badge variant="status" status={STATUS_TONE[status]} size="xs">
        {STATUS_LABEL[status]}
      </Badge>
      {addedCount > 0 && (
        <Badge variant="metric" size="xs" label="Live" value={`+${addedCount}`} />
      )}
      {droppedRows > 0 && (
        <span className="text-amber-700 dark:text-amber-400">
          {droppedRows} row{droppedRows === 1 ? "" : "s"} dropped from the live buffer
        </span>
      )}
      {error && (
        <InlineError
          title={`Live follow error (${error.scope})`}
          error={new Error(error.message)}
          className="w-full"
        />
      )}
    </div>
  );
}
