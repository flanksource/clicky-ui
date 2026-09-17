import { useEffect, useRef, useState } from "react";
import { Button } from "../../../components/button";
import { Badge } from "../../../data/Badge";
import { UiArrowRight, UiWarningTriangle } from "../../../icons";
import type { EvalResponse, PlaygroundSample, ResultExpectation } from "../api.ts";
import { RUN_SHORTCUT_LABEL } from "../runShortcut";
import { classifySample, nextFailure, resultTypes, tallySamples, type SampleOutcome } from "../sampleOutcome.ts";
import type { SampleRuns } from "../useSampleRuns.ts";
import { ExpectationStrip } from "./ExpectationStrip.tsx";
import { ResultError, ResultValue, StaleButton } from "./ResultPanel.tsx";

interface SamplesPanelProps {
  samples: PlaygroundSample[];
  runs: SampleRuns;
  expectation?: ResultExpectation | undefined;
  /** Loads a sample into the Input editor. */
  onUseInput: (input: string) => void;
}

const DOT: Record<SampleOutcome, string> = {
  valid: "bg-green-500",
  empty: "bg-muted-foreground/40",
  invalid: "bg-amber-500",
  failed: "bg-destructive",
};

/**
 * The current expression against every sample.
 *
 * The author writes against the input in front of them; the samples that break
 * the expression are, by definition, the ones they have not looked at. So every
 * sample is listed with its outcome, and "Next failure" walks the broken ones.
 */
export function SamplesPanel({ samples, runs, expectation, onUseInput }: SamplesPanelProps) {
  const [focused, setFocused] = useState(0);
  const classified = samples.map((sample) => {
    const response = runs.results.find((entry) => entry.sample.id === sample.id)?.response;
    return { sample, response, ...(response ? classifySample(response, expectation?.validate) : {}) };
  });
  const outcomes = classified.map((entry) => entry.outcome);
  const ran = classified.flatMap((entry) => (entry.outcome ? [entry.outcome] : []));
  const tally = tallySamples(ran);
  const types = resultTypes(runs.results.map((entry) => entry.response));
  const jump = nextFailure(outcomes, focused);
  const current = classified[Math.min(focused, classified.length - 1)];
  // Nothing has run yet is not the same as out of date: only dim results.
  const outdated = runs.stale && runs.results.length > 0;

  // Land on the first broken sample once a run completes, not on whatever row
  // happened to be focused before it.
  const outcomesRef = useRef(outcomes);
  outcomesRef.current = outcomes;
  useEffect(() => {
    if (runs.pending || runs.results.length === 0) return;
    const first = nextFailure(outcomesRef.current, -1);
    if (first !== undefined) setFocused(first);
  }, [runs.pending, runs.results.length]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-1.5 border-b border-border px-4 py-2 text-xs">
        {runs.progress ? (
          <Badge tone="info" variant="soft" size="sm">
            Running {runs.progress.done}/{runs.progress.total}
          </Badge>
        ) : null}
        {ran.length > 0 ? <Tally tally={tally} /> : null}
        {types.length > 1 ? (
          <Badge tone="warning" variant="soft" size="sm">
            returns {types.join(" | ")}
          </Badge>
        ) : null}
        {jump !== undefined ? (
          <Button size="sm" variant="outline" className="h-6 gap-1 px-2 text-xs" onClick={() => setFocused(jump)}>
            <UiArrowRight className="size-3" aria-hidden="true" />
            Next failure
          </Button>
        ) : null}
        {outdated && !runs.pending ? <StaleButton onRun={() => void runs.run()} /> : null}
      </div>

      <ul
        aria-label="Samples"
        className={`max-h-[40%] shrink-0 overflow-auto border-b border-border py-1 ${outdated ? "opacity-60" : ""}`}
      >
        {classified.map((entry, index) => (
          <li key={entry.sample.id}>
            <button
              type="button"
              aria-current={index === focused}
              onClick={() => setFocused(index)}
              className={`flex w-full items-center gap-2 px-4 py-1 text-left text-xs hover:bg-muted ${
                index === focused ? "bg-primary/[0.06]" : ""
              }`}
            >
              <span
                aria-hidden="true"
                className={`size-2 shrink-0 rounded-full ${entry.outcome ? DOT[entry.outcome] : "border border-border"}`}
              />
              <span className="w-20 shrink-0 truncate font-medium">{entry.sample.label}</span>
              <code className="min-w-0 flex-1 truncate font-mono text-muted-foreground">
                {entry.response ? preview(entry.response) : runs.pending ? "…" : "not run"}
              </code>
              {entry.issues?.[0] ? (
                <span
                  className={`min-w-0 max-w-[45%] truncate ${entry.outcome === "failed" ? "text-destructive" : "text-amber-700 dark:text-amber-400"}`}
                  title={entry.issues.join("\n")}
                >
                  {entry.issues[0]}
                </span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>

      {runs.results.length === 0 && !runs.pending ? (
        <div className="p-4">
          <p className="text-sm text-muted-foreground">
            Run the expression against all {samples.length} samples to see which ones it holds for.
          </p>
          <Button onClick={() => void runs.run()} size="sm" className="mt-3">
            Run all samples ({RUN_SHORTCUT_LABEL})
          </Button>
        </div>
      ) : current ? (
        <FocusedSample
          label={current.sample.label}
          response={current.response}
          expectation={expectation}
          stale={outdated}
          onUseInput={() => onUseInput(current.sample.input)}
        />
      ) : null}
    </div>
  );
}

function Tally({ tally }: { tally: Record<SampleOutcome, number> }) {
  return (
    <>
      <Badge tone="success" variant="soft" size="sm">
        {tally.valid} valid
      </Badge>
      {tally.empty > 0 ? (
        <Badge tone="neutral" variant="soft" size="sm">
          {tally.empty} empty
        </Badge>
      ) : null}
      {tally.invalid > 0 ? (
        <Badge tone="warning" variant="soft" size="sm" icon={UiWarningTriangle}>
          {tally.invalid} invalid
        </Badge>
      ) : null}
      {tally.failed > 0 ? (
        <Badge tone="danger" variant="soft" size="sm" icon={UiWarningTriangle}>
          {tally.failed} failed
        </Badge>
      ) : null}
    </>
  );
}

function FocusedSample({
  label,
  response,
  expectation,
  stale,
  onUseInput,
}: {
  label: string;
  response: EvalResponse | undefined;
  expectation: ResultExpectation | undefined;
  stale: boolean;
  onUseInput: () => void;
}) {
  return (
    <section aria-label={`${label} result`} className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center gap-2 px-4 py-2 text-xs">
        <span className="font-medium">{label}</span>
        {response && !response.error ? (
          <Badge variant="outline" size="sm">
            {response.durationMs.toFixed(2)} ms
          </Badge>
        ) : null}
        <Button size="sm" variant="ghost" className="ml-auto h-6 px-2 text-xs" onClick={onUseInput}>
          Use as input
        </Button>
      </header>
      {expectation ? <ExpectationStrip expectation={expectation} response={response ?? null} stale={stale} /> : null}
      <div className={`min-h-0 flex-1 overflow-auto p-4 ${stale ? "opacity-50" : ""}`}>
        {!response ? (
          <p className="text-sm text-muted-foreground">Evaluating…</p>
        ) : response.error ? (
          <ResultError error={response.error} />
        ) : (
          <ResultValue response={response} />
        )}
      </div>
    </section>
  );
}

function preview(response: EvalResponse): string {
  if (response.error) return "error";
  return response.result === "" ? '""' : response.result.replace(/\s+/g, " ");
}
