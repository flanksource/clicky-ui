import { Icon } from "../Icon";
import type { ParsedGoroutine, ParsedGoroutineFrame } from "./stacktrace";

export function goroutineStateBadge(state: string): string {
  if (state.includes("running"))
    return "bg-green-50 text-green-700 dark:bg-green-500/20 dark:text-green-300";
  if (state.includes("chan") || state.includes("wait"))
    return "bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300";
  if (state.includes("sleep"))
    return "bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300";
  if (state.includes("select"))
    return "bg-violet-50 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300";
  return "bg-muted text-muted-foreground";
}

export function goroutineStateDot(state: string): string {
  if (state.includes("running")) return "bg-green-500";
  if (state.includes("chan") || state.includes("wait")) return "bg-blue-500";
  if (state.includes("sleep")) return "bg-amber-500";
  if (state.includes("select")) return "bg-violet-500";
  return "bg-muted-foreground/40";
}

export type GoroutineCardProps = {
  goroutine: ParsedGoroutine;
  search: string;
  hideRuntimeOnly: boolean;
};

export function GoroutineCard({ goroutine, search, hideRuntimeOnly }: GoroutineCardProps) {
  const frames = hideRuntimeOnly
    ? goroutine.frames.filter((frame) => !frame.runtime || frame.kind === "created_by")
    : goroutine.frames;
  const defaultOpen = goroutine.state === "running" || !!search;

  return (
    <details className="border-0 bg-transparent" open={defaultOpen}>
      <summary className="cursor-pointer list-none px-0 py-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs font-semibold text-foreground">g{goroutine.id}</span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${goroutineStateBadge(
              goroutine.state,
            )}`}
          >
            <span className={`h-2 w-2 rounded-full ${goroutineStateDot(goroutine.state)}`} />
            {goroutine.rawState}
          </span>
          <span className="text-[11px] text-muted-foreground">{frames.length}f</span>
          {goroutine.userFrameCount > 0 && (
            <span className="text-[11px] text-muted-foreground">{goroutine.userFrameCount}u</span>
          )}
          {goroutine.topFunction && (
            <span className="truncate text-[11px] text-muted-foreground">
              {goroutine.topFunction}
            </span>
          )}
        </div>
      </summary>
      <div className="pl-3 py-1 space-y-0.5">
        {frames.map((frame, index) => (
          <FrameRow key={`${goroutine.id}-${index}`} frame={frame} />
        ))}
      </div>
    </details>
  );
}

function FrameRow({ frame }: { frame: ParsedGoroutineFrame }) {
  return (
    <div className={frame.runtime ? "text-muted-foreground" : "text-foreground"}>
      <div className="flex items-start gap-1.5">
        <Icon
          name={
            frame.kind === "created_by"
              ? "codicon:debug-restart"
              : frame.runtime
                ? "codicon:debug-step-over"
                : "codicon:symbol-method"
          }
          className="shrink-0 mt-0.5 text-[11px]"
        />
        <div className="min-w-0">
          <div className="break-all font-mono text-[11px] font-semibold leading-4">
            {frame.displayName}
            {frame.location && (
              <span className="ml-2 text-[10px] font-normal opacity-80">{frame.location}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
