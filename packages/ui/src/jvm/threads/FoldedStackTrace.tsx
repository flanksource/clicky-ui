import { useMemo, useState } from "react";
import { Button } from "../../components/button";
import { Callout } from "../../data/Callout";
import { parseJvmThreadDump } from "../../data/diagnostics/jvm-stacktrace";
import { JvmStackTrace } from "../../data/diagnostics/JvmStackTrace";
import { countStackFrames, foldRepeatedFrames } from "../model/stack-fold";
import type { JvmThreadStack } from "../protocol/types";

export type FoldedStackTraceProps = {
  stack: JvmThreadStack;
};

/**
 * A thread's stack as frames. A recursion thousands of frames deep reads as one
 * copy with a note saying what was folded; the full stack is one click away and
 * is what "Download stack" saves.
 */
export function FoldedStackTrace({ stack }: FoldedStackTraceProps) {
  const [showAll, setShowAll] = useState(false);
  const folded = useMemo(() => foldRepeatedFrames(stack.text), [stack.text]);
  const totalFrames = useMemo(() => countStackFrames(stack.text), [stack.text]);
  const shown = showAll ? stack.text : folded.text;
  const parsed = useMemo(() => parseJvmThreadDump(shown), [shown]);
  const first = parsed[0];

  return (
    <div className="flex flex-col gap-2">
      {folded.folds.length > 0 ? (
        <Callout variant="note" className="my-0">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>
              {folded.folds.map((fold) => `A ${fold.unitFrames}-frame block repeats ${fold.repeats}× on this stack`).join("; ")}
              {showAll ? "." : `. It is shown once, with ${folded.foldedFrames.toLocaleString()} repeated frames folded.`}
            </span>
            <Button type="button" size="xs" variant="outline" onClick={() => setShowAll(!showAll)}>
              {showAll ? "Fold repeats" : `Show all ${totalFrames.toLocaleString()} frames`}
            </Button>
          </span>
        </Callout>
      ) : null}
      {first ? (
        <JvmStackTrace frames={first.frames} className="space-y-0.5" />
      ) : (
        <pre className="overflow-auto whitespace-pre-wrap font-mono text-[11px] leading-4">{shown}</pre>
      )}
    </div>
  );
}
