import { useMemo } from "react";
import { Button } from "../../components/button";
import { LogViewer } from "../LogViewer";
import { parseStackDump } from "../diagnostics/stacktrace";
import { StackDumpView } from "../diagnostics/StackDumpView";
import { Expectation } from "./Expectation";
import { useSelectDetailTab } from "./detailTabContext";
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

/** Combined output, with a ten-line preview linking to the panel's Stdout tab. */
export function TestOutput({ node, view = "preview" }: { node: Test; view?: "preview" | "full" }) {
  const selectTab = useSelectDetailTab();
  if (!node.stdout && !node.stderr) return null;
  const output = [node.stdout, node.stderr].flatMap((stream) => stream ? [stream.replace(/\r?\n$/, "")] : []).join("\n");
  const lines = output.split(/\r?\n/);
  const preview = view === "preview";
  return (
    <div className="space-y-1">
      {preview && <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Output</div>}
      <LogViewer
        logs={preview ? lines.slice(0, 10).join("\n") : output}
        variant="terminal"
        maxHeight="none"
        collapsedLines={lines.length}
      />
      {preview && lines.length > 10 && selectTab && (
        <Button type="button" variant="link" size="sm" className="px-0" onClick={() => selectTab("stdout")}>
          Show more in Stdout
        </Button>
      )}
    </div>
  );
}
