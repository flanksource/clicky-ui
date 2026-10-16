import { useMemo } from "react";
import { LogViewer } from "../LogViewer";
import { parseStackDump } from "../diagnostics/stacktrace";
import { StackDumpView } from "../diagnostics/StackDumpView";
import { Expectation } from "./Expectation";
import type { FailureDetail, Test } from "./types";

/** A failure stack: a Go panic dump as goroutine cards, anything else as a log. */
function FailureStack({ stack }: { stack: string }) {
  const parsed = useMemo(() => parseStackDump(stack), [stack]);
  if (parsed.format !== "go") return <LogViewer logs={stack} collapsedLines={6} />;
  return (
    <div className="flex max-h-[32rem] min-h-0 flex-col" data-failure-stack="go">
      <StackDumpView text={stack} singleItem={parsed.goroutines.length === 1} />
    </div>
  );
}

/**
 * Renders a structured failure: its summary, the expectation, and the stack.
 * A stack that is a Go goroutine dump (a panic) is shown as searchable
 * goroutine cards; any other stack stays a log.
 */
export function TestFailureDetail({ failure }: { failure: FailureDetail }) {
  const hasExpectation = !!(
    failure.matcher ||
    failure.expected ||
    failure.actual ||
    failure.location
  );
  return (
    <div className="space-y-2">
      {failure.summary && (
        <p className="text-sm font-medium text-red-700 dark:text-red-300">{failure.summary}</p>
      )}
      {hasExpectation && (
        <Expectation
          check={failure.matcher}
          expected={failure.expected || undefined}
          actual={failure.actual || undefined}
          location={failure.location}
        />
      )}
      {failure.stack && <FailureStack stack={failure.stack} />}
    </div>
  );
}

// A quarter of the detail pane, which TestDetailPanel makes a size container.
const OUTPUT_MAX_HEIGHT = "25cqh";

/** stdout / stderr as terminal blocks, each scrolling within a quarter of the detail pane. */
export function TestOutput({ node }: { node: Test }) {
  if (!node.stdout && !node.stderr) return null;
  return (
    <div className="space-y-3">
      {node.stdout && (
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">stdout</div>
          <LogViewer logs={node.stdout} variant="terminal" maxHeight={OUTPUT_MAX_HEIGHT} />
        </div>
      )}
      {node.stderr && (
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">stderr</div>
          <LogViewer
            logs={node.stderr}
            variant="terminal"
            maxHeight={OUTPUT_MAX_HEIGHT}
            borderClass="border-red-500/70"
          />
        </div>
      )}
    </div>
  );
}
