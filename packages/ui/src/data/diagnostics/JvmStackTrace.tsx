import { Icon } from "../Icon";
import { UiChip, UiDebugStepOver, UiLock, UiSync, UiMethod, UiWatch } from "../../icons";
import type { ParsedThreadFrame } from "./jvm-stacktrace";
import { FrameSourceWindow, frameHasSource } from "./FrameSourceWindow";

// JvmFrameSourceResolver returns a source window for a frame, or undefined when
// no source is available (a missing class must never blank out the frame). Used
// to augment the rendered thread dump with decompiled source in place.
export type JvmFrameSourceResolver = (frame: ParsedThreadFrame) =>
  | { sourceLines: string[]; sourceLineNumbers?: number[]; sourceStartLine?: number }
  | undefined;

export type JvmStackTraceProps = {
  frames: ParsedThreadFrame[];
  hideRuntimeOnly?: boolean;
  className?: string;
  /** Optional resolver that supplies inline source under each frame. */
  resolveSource?: JvmFrameSourceResolver;
};

export function JvmStackTrace({
  frames,
  hideRuntimeOnly = false,
  className,
  resolveSource,
}: JvmStackTraceProps) {
  const visibleFrames = hideRuntimeOnly
    ? frames.filter((frame) => frame.kind !== "frame" || !frame.runtime)
    : frames;

  if (visibleFrames.length === 0) return null;

  return (
    <div className={className}>
      {visibleFrames.map((frame, index) => {
        const resolved = resolveSource?.(frame);
        const withSource = resolved ? { ...frame, ...resolved } : frame;
        return (
          <JvmStackFrameRow key={`${frame.functionName}-${index}`} frame={withSource} />
        );
      })}
    </div>
  );
}

export function JvmStackFrameRow({ frame }: { frame: ParsedThreadFrame }) {
  const isAnno = frame.kind !== "frame";
  const icon = isAnno
    ? frame.kind === "locked"
      ? UiLock
      : frame.kind === "waiting_to_lock"
        ? UiSync
        : UiWatch
    : frame.nativeMethod
      ? UiChip
      : frame.runtime
        ? UiDebugStepOver
        : UiMethod;

  return (
    <div className={frame.runtime ? "text-muted-foreground" : "text-foreground"}>
      <div className="flex items-start gap-1.5">
        <Icon icon={icon} className="mt-0.5 shrink-0 text-[11px]" />
        <div className="min-w-0">
          <div className="break-all font-mono text-[11px] font-semibold leading-4">
            {isAnno ? (
              <>
                <span className="opacity-70">{frame.functionName}</span>
                {frame.annotationText && (
                  <span className="ml-2 font-normal opacity-80">{frame.annotationText}</span>
                )}
              </>
            ) : (
              <>
                {frame.displayName}
                {frame.location && (
                  <span className="ml-2 text-[10px] font-normal opacity-80">{frame.location}</span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      {!isAnno && frameHasSource(frame) && <FrameSourceWindow frame={frame} />}
    </div>
  );
}
