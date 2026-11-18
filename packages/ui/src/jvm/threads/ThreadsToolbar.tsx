import type { ReactNode } from "react";
import { Button } from "../../components/button";
import { UiPause, UiPlay, UiRefresh } from "../../icons";

export type ThreadsToolbarProps = {
  threadCount: number;
  /** Window the CPU figures were measured over. */
  sampledMs: number;
  /** When the snapshot arrived (ms since epoch); 0 or absent before the first one. */
  updatedAt?: number;
  paused: boolean;
  onTogglePause: () => void;
  refreshing: boolean;
  onRefresh: () => void;
  /** Host buttons, shown before Pause and Refresh. */
  actions?: ReactNode;
};

/** Snapshot summary with Pause/Resume of the polling and a manual Refresh. */
export function ThreadsToolbar({ threadCount, sampledMs, updatedAt, paused, onTogglePause, refreshing, onRefresh, actions }: ThreadsToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <span>
        {threadCount} threads · CPU sampled over {sampledMs} ms
        {updatedAt ? ` · updated ${new Date(updatedAt).toLocaleTimeString()}` : ""}
      </span>
      <div className="ml-auto flex flex-wrap items-center gap-1">
        {actions}
        <Button type="button" size="xs" variant="outline" onClick={onTogglePause}>
          {paused ? <UiPlay /> : <UiPause />}
          {paused ? "Resume" : "Pause"}
        </Button>
        <Button type="button" size="xs" variant="outline" loading={refreshing} onClick={onRefresh}>
          <UiRefresh /> Refresh
        </Button>
      </div>
    </div>
  );
}
