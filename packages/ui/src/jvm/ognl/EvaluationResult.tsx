import { useState, type ReactNode } from "react";
import { CopyButton } from "../../components/CopyButton";
import { Loading } from "../../components/loading";
import { SegmentedControl } from "../../components/SegmentedControl";
import { AnsiHtml } from "../../data/AnsiHtml";
import { JsonView } from "../../data/JsonView";
import { ObjectGraph, type ObjectGraphNode } from "../../data/ObjectGraph";
import { cn } from "../../lib/utils";
import { InlineError } from "../../rpc/InlineError";
import { evaluationGraph, evaluationRawText } from "../model/expressions";
import type { JvmEvaluation } from "../protocol/types";

export type EvaluationResultView = "tree" | "raw";

export type EvaluationResultProps = {
  /** The last completed evaluation. */
  evaluation?: JvmEvaluation | undefined;
  /** An evaluation is running; the previous result is hidden meanwhile. */
  pending?: boolean;
  /** Why the last evaluation failed. */
  error?: unknown;
  /** View shown first when the result has an object graph. Default "tree". */
  defaultView?: EvaluationResultView;
  /** Makes node labels clickable, e.g. to drill into a path. Omit for a static tree. */
  onSelectNode?: (node: ObjectGraphNode) => void;
  className?: string;
};

const VIEW_OPTIONS = [
  { id: "tree" as const, label: "Tree" },
  { id: "raw" as const, label: "Raw" },
];

function formatElapsed(elapsedMs: number): string {
  return elapsedMs >= 1000 ? `${(elapsedMs / 1000).toFixed(1)} s` : `${elapsedMs} ms`;
}

function Stream({ label, text, tone }: { label: string; text: string; tone?: "error" }) {
  return (
    <section aria-label={label} className="min-w-0">
      <h3 className={cn("mb-1 text-xs font-semibold uppercase text-muted-foreground", tone === "error" && "text-destructive")}>{label}</h3>
      <AnsiHtml text={text} className="max-h-60 overflow-auto whitespace-pre-wrap break-words rounded border border-border bg-muted/30 p-2 font-mono text-xs" />
    </section>
  );
}

function Body({ evaluation, graph, view, onSelectNode }: { evaluation: JvmEvaluation; graph: ObjectGraphNode | undefined; view: EvaluationResultView; onSelectNode: EvaluationResultProps["onSelectNode"] }): ReactNode {
  if (view === "raw" && evaluationRawText(evaluation)) {
    return (
      <section aria-label="Raw result">
        <pre className="whitespace-pre-wrap break-words p-3 font-mono text-xs">{evaluationRawText(evaluation)}</pre>
      </section>
    );
  }
  if (graph) {
    return <ObjectGraph roots={[graph]} className="p-1" showOptionsMenu showFullscreenControl {...(onSelectNode ? { onNodeSelect: onSelectNode } : {})} />;
  }
  if (evaluation.value !== undefined) return <div className="p-3"><JsonView data={evaluation.value} /></div>;
  return <p className="p-3 text-sm text-muted-foreground">The evaluation completed without a value.</p>;
}

/** An OGNL or Groovy evaluation: its object graph or plain value (tree or raw JSON, copyable), stdout, stderr and elapsed time. */
export function EvaluationResult({ evaluation, pending = false, error, defaultView = "tree", onSelectNode, className }: EvaluationResultProps) {
  const [view, setView] = useState<EvaluationResultView>(defaultView);
  if (pending) return <Loading variant="centered" label="Running…" className={className} />;
  if (error) return <InlineError title="Evaluation failed" error={error} {...(className ? { className } : {})} />;
  if (!evaluation) return <p className={cn("text-sm text-muted-foreground", className)}>Run an expression to inspect live JVM state.</p>;

  let graph: ObjectGraphNode | undefined;
  try {
    graph = evaluationGraph(evaluation.graph);
  } catch (unreadable) {
    return <InlineError title="Evaluation result unreadable" error={unreadable} {...(className ? { className } : {})} />;
  }
  const raw = evaluationRawText(evaluation);

  return (
    <div className={cn("flex min-h-0 flex-col gap-3", className)}>
      <div className="flex items-center justify-between gap-2">
        {graph ? <SegmentedControl size="sm" aria-label="Result view" options={VIEW_OPTIONS} value={view} onChange={setView} /> : <span />}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {evaluation.elapsedMs !== undefined ? <span>{formatElapsed(evaluation.elapsedMs)}</span> : null}
          {raw ? <CopyButton value={raw} label="Copy result" /> : null}
        </div>
      </div>
      <div className="min-h-0 overflow-auto rounded-md border border-border bg-muted/10">
        <Body evaluation={evaluation} graph={graph} view={graph ? view : "tree"} onSelectNode={onSelectNode} />
      </div>
      {evaluation.stdout ? <Stream label="Standard output" text={evaluation.stdout} /> : null}
      {evaluation.stderr ? <Stream label="Standard error" text={evaluation.stderr} tone="error" /> : null}
    </div>
  );
}
