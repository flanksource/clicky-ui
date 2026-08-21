import type { ReactNode } from "react";
import { Icon } from "../Icon";
import {
  UiChip,
  UiDebugStepOver,
  UiLock,
  UiMethod,
  UiStackFrameDot,
  UiSync,
  UiWatch,
} from "../../icons";
import { FrameSourceWindow } from "./FrameSourceWindow";
import { frameHasSource } from "./FrameSourceWindow.utils";
import type { ParsedThreadFrame } from "./jvm-stacktrace";

// StackFrameActions renders trailing per-frame affordances. It is a slot: the
// shared library never knows what the actions do, only where they go.
export type StackFrameActions = (frame: ParsedThreadFrame, index: number) => ReactNode;

export interface StackFrameRowProps {
  frame: ParsedThreadFrame;
  index: number;
  /** Show the 1-based frame ordinal in the gutter. */
  showIndex?: boolean;
  /** Trailing actions for this frame, revealed on hover/focus. */
  frameActions?: StackFrameActions;
}

// StackFrameRow is THE stack-frame renderer. Both an exception dump (via
// StackTrace) and a JVM thread dump (via JvmStackTrace) render their frames
// through it, so a frame looks and behaves the same wherever it is shown.
//
// Thread dumps carry lock/monitor annotation entries alongside real frames —
// `frame.kind !== "frame"` — which are rendered as their own muted rows with a
// lock/wait icon and no source window. An exception dump simply never produces
// them.
export function StackFrameRow({
  frame,
  index,
  showIndex = false,
  frameActions,
}: StackFrameRowProps) {
  const isAnnotation = frame.kind !== "frame";
  const methodName = frame.displayName || frame.method || frame.functionName;
  const actions = frameActions?.(frame, index);

  return (
    <div
      className={[
        "group grid gap-2 px-3 py-1.5 text-xs",
        showIndex ? "grid-cols-[2rem_minmax(0,1fr)_auto]" : "grid-cols-[1.25rem_minmax(0,1fr)_auto]",
        frame.runtime ? "text-muted-foreground" : "text-foreground",
      ].join(" ")}
    >
      <div className="flex items-start justify-end gap-1 pt-0.5 font-mono text-[10px] text-muted-foreground">
        {showIndex && <span>{index + 1}</span>}
        <Icon icon={frameIcon(frame)} className="mt-px shrink-0 text-[11px]" />
      </div>

      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
          {isAnnotation ? (
            <>
              <span className="min-w-0 break-all font-mono font-semibold leading-4 opacity-70">
                {frame.functionName}
              </span>
              {frame.annotationText && (
                <span className="min-w-0 break-all font-mono text-[11px] font-normal opacity-80">
                  {frame.annotationText}
                </span>
              )}
            </>
          ) : (
            <>
              <span className="min-w-0 break-all font-mono font-semibold leading-4">
                {methodName}
              </span>
              {frame.class && (
                <span className="min-w-0 break-all font-mono text-[11px] text-muted-foreground">
                  {frame.class}
                </span>
              )}
              {frame.location && (
                <span className="rounded border border-border bg-muted/40 px-1.5 py-px font-mono text-[10px] text-muted-foreground">
                  {frame.location}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {actions ? (
        <div className="flex shrink-0 items-start gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          {actions}
        </div>
      ) : (
        <div />
      )}

      {!isAnnotation && frameHasSource(frame) ? (
        <div className="col-span-3">
          <FrameSourceWindow frame={frame} />
        </div>
      ) : null}
    </div>
  );
}

function frameIcon(frame: ParsedThreadFrame) {
  switch (frame.kind) {
    case "locked":
      return UiLock;
    case "waiting_to_lock":
      return UiSync;
    case "waiting_on":
    case "parking":
      return UiWatch;
    default:
      break;
  }
  if (frame.nativeMethod) return UiChip;
  if (frame.runtime) return UiDebugStepOver;
  return frame.method || frame.class ? UiMethod : UiStackFrameDot;
}
