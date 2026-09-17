import { SegmentedControl } from "../../../components/SegmentedControl";
import type { PlaygroundSample, ResultExpectation } from "../api.ts";
import type { Evaluator } from "../useEvaluator.ts";
import type { SampleRuns } from "../useSampleRuns.ts";
import { ResultPanel } from "./ResultPanel.tsx";
import { SamplesPanel } from "./SamplesPanel.tsx";

export type ResultViewId = "input" | "samples";

interface ResultViewProps {
  view: ResultViewId;
  onViewChange: (view: ResultViewId) => void;
  evaluator: Evaluator;
  sampleRuns: SampleRuns;
  samples: PlaygroundSample[];
  expectation?: ResultExpectation | undefined;
  onUseInput: (input: string) => void;
}

/** The Result tab: the current input's result, or every sample's once there are several. */
export function ResultView({
  view,
  onViewChange,
  evaluator,
  sampleRuns,
  samples,
  expectation,
  onUseInput,
}: ResultViewProps) {
  const single = (
    <ResultPanel
      response={evaluator.response}
      pending={evaluator.pending}
      stale={evaluator.stale}
      onRun={evaluator.run}
      expectation={expectation}
    />
  );
  if (samples.length < 2) return single;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-4 py-1.5">
        <SegmentedControl
          size="sm"
          value={view}
          options={[
            { id: "input", label: "This input" },
            { id: "samples", label: `All samples · ${samples.length}` },
          ]}
          onChange={onViewChange}
          aria-label="Result scope"
        />
      </div>
      <div className="min-h-0 flex-1">
        {view === "samples" ? (
          <SamplesPanel samples={samples} runs={sampleRuns} expectation={expectation} onUseInput={onUseInput} />
        ) : (
          single
        )}
      </div>
    </div>
  );
}
