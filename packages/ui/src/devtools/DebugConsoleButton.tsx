import { useSyncExternalStore } from "react";
import {
  debugConsoleOpen,
  revealDebugConsole,
  subscribeToDebugConsole,
} from "../data/debugConsoleSignal";
import { UiDebug } from "../icons";
import { cn } from "../lib/utils";
import { debugStore, type DebugStore } from "./debugStore";

/**
 * The console's trigger, styled as navbar chrome for AppShell's actions slot.
 *
 * It replaced a collapsed status bar pinned under the page. The bar cost a
 * strip of every screen to say something only a developer wants, and it sat
 * where a page's own footer belongs; the navbar is where an app's other global
 * affordances already are, beside the chat trigger.
 *
 * The badge is what the bar was actually for. A trigger that says nothing gives
 * no reason to press it — "3 errors" does.
 */

export type DebugConsoleButtonProps = {
  label?: string | undefined;
  className?: string | undefined;
  /** The capture store to count. Defaults to the shared one the dock streams into. */
  store?: DebugStore | undefined;
};

export function DebugConsoleButton({
  label = "Debug console",
  className,
  store = debugStore,
}: DebugConsoleButtonProps) {
  const open = useSyncExternalStore(subscribeToDebugConsole, debugConsoleOpen, () => false);
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const failures = state.records.filter(hasFailed).length;
  const badge = failures > 0 ? failures : state.records.length;

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={open}
      title={triggerTitle(state.records.length, failures, open)}
      onClick={() => revealDebugConsole({ toggle: true })}
      className={cn(
        "relative inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-transparent text-foreground transition-colors hover:bg-accent",
        open && "bg-accent",
        className,
      )}
    >
      <UiDebug className="size-5" aria-hidden />
      {badge > 0 ? (
        <span
          aria-hidden
          className={cn(
            "-right-0.5 -top-0.5 absolute min-w-4 rounded-full px-1 text-[10px] leading-4 tabular-nums",
            failures > 0
              ? "bg-destructive text-destructive-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      ) : null}
    </button>
  );
}

/**
 * A failed capture is either one the transport reported an error for or one
 * whose status came back 4xx/5xx — a record can carry the second without the
 * first when the handler wrote the status itself.
 */
function hasFailed(record: { error?: string | undefined; status?: number | undefined }): boolean {
  return Boolean(record.error) || (record.status !== undefined && record.status >= 400);
}

function triggerTitle(records: number, failures: number, open: boolean): string {
  const action = open ? "Hide" : "Show";
  if (records === 0) return `${action} the debug console`;
  const captures = `${records} capture${records === 1 ? "" : "s"}`;
  if (failures === 0) return `${action} the debug console — ${captures}`;
  return `${action} the debug console — ${captures}, ${failures} failed`;
}
