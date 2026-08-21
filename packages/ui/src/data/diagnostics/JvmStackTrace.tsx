import type { ParsedThreadFrame } from "./jvm-stacktrace";
import type { FrameSource } from "./FrameSourceWindow.utils";
import { StackFrameRow, type StackFrameActions } from "./StackFrameRow";

// JvmFrameSourceResolver returns a source window for a frame, or undefined when
// no source is available (a missing class must never blank out the frame). Used
// to augment the rendered thread dump with decompiled source in place. Shares
// its return shape with StackTraceSourceResolver so one resolver can serve both
// the thread-dump and the exception surfaces.
export type JvmFrameSourceResolver = (frame: ParsedThreadFrame) => FrameSource | undefined;

export type JvmStackTraceProps = {
  frames: ParsedThreadFrame[];
  hideRuntimeOnly?: boolean;
  className?: string;
  /** Optional resolver that supplies inline source under each frame. */
  resolveSource?: JvmFrameSourceResolver;
  /** Trailing per-frame actions, revealed on hover/focus. */
  frameActions?: StackFrameActions;
};

// JvmStackTrace renders a parsed thread dump: frames plus the lock/monitor
// annotation entries interleaved with them. It is a bare frame list — the
// thread's own header, state badge and controls belong to the surrounding card
// (see ThreadCard / DiagnosticsDetailPanel). Frames render through the shared
// StackFrameRow, so they match an exception stack trace exactly.
export function JvmStackTrace({
  frames,
  hideRuntimeOnly = false,
  className,
  resolveSource,
  frameActions,
}: JvmStackTraceProps) {
  const visibleFrames = hideRuntimeOnly
    ? frames.filter((frame) => frame.kind !== "frame" || !frame.runtime)
    : frames;

  if (visibleFrames.length === 0) return null;

  return (
    <div className={className}>
      {visibleFrames.map((frame, index) => {
        const resolved = resolveSource?.(frame);
        // `line` stays the frame's own — see the note in RenderedStackTrace.
        const withSource = resolved
          ? { ...frame, ...(({ line: _ignored, ...rest }) => rest)(resolved) }
          : frame;
        return (
          <StackFrameRow
            key={`${frame.functionName}-${index}`}
            frame={withSource}
            index={index}
            {...(frameActions ? { frameActions } : {})}
          />
        );
      })}
    </div>
  );
}
