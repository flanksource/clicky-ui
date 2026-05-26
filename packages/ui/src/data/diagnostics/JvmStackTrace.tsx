import { Icon } from "../Icon";
import {
  CodiconChipIcon,
  CodiconDebugStepOverIcon,
  CodiconLockIcon,
  CodiconSyncIcon,
  CodiconSymbolMethodIcon,
  CodiconWatchIcon,
} from "../static-icons";
import type { ParsedThreadFrame } from "./jvm-stacktrace";

export type JvmStackTraceProps = {
  frames: ParsedThreadFrame[];
  hideRuntimeOnly?: boolean;
  className?: string;
};

export function JvmStackTrace({ frames, hideRuntimeOnly = false, className }: JvmStackTraceProps) {
  const visibleFrames = hideRuntimeOnly
    ? frames.filter((frame) => frame.kind !== "frame" || !frame.runtime)
    : frames;

  if (visibleFrames.length === 0) return null;

  return (
    <div className={className}>
      {visibleFrames.map((frame, index) => (
        <JvmStackFrameRow key={`${frame.functionName}-${index}`} frame={frame} />
      ))}
    </div>
  );
}

export function JvmStackFrameRow({ frame }: { frame: ParsedThreadFrame }) {
  const isAnno = frame.kind !== "frame";
  const icon = isAnno
    ? frame.kind === "locked"
      ? CodiconLockIcon
      : frame.kind === "waiting_to_lock"
        ? CodiconSyncIcon
        : CodiconWatchIcon
    : frame.nativeMethod
      ? CodiconChipIcon
      : frame.runtime
        ? CodiconDebugStepOverIcon
        : CodiconSymbolMethodIcon;

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
    </div>
  );
}
