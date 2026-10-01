import { UiGitCommit } from "../../../icons";
import type {
  AISpecRuntimeCommit,
  AISpecRuntimeValue,
  SpecCommitPhase,
} from "../SpecRuntimeEditor.model";
import { SpecField, SpecInput, SpecSelect } from "./fields";
import { commitPhase, commitPhaseFromEntry, withCommit, withCommitPhase } from "./update";

// The phase select doubles as the on/off control, the way the checkout and
// worktree sections use "none": the run either has a commit policy or it has
// none, and a separate checkbox would leave a stanza that says nothing.
export function CommitSection({
  value,
  onChange,
  inheritedCommits,
}: {
  value: AISpecRuntimeValue;
  onChange: (value: AISpecRuntimeValue) => void;
  /**
   * Commit stanza(s) inherited from a lower spec layer (e.g. the lifecycle
   * step's own workflow). Shown as the current selection, marked inherited,
   * only while the operator has not set `workflow.commits` at all — the
   * request the editor emits stays delta-only (see `withCommitPhase`) until
   * the operator actually changes something.
   */
  inheritedCommits?: AISpecRuntimeCommit[] | undefined;
}) {
  const operatorSet = value.workflow?.commits !== undefined;
  const inheritedCommit = operatorSet ? undefined : inheritedCommits?.[0];
  const phase = operatorSet
    ? commitPhase(value)
    : inheritedCommit
      ? commitPhaseFromEntry(inheritedCommit)
      : "none";
  const commit = operatorSet ? value.workflow?.commits?.[0] : undefined;
  return (
    <div className="grid gap-density-2 md:grid-cols-[minmax(8rem,10rem)_minmax(0,1fr)]">
      <SpecField
        label="Commit"
        hint={inheritedCommit ? "inherited" : undefined}
        composite
      >
        <SpecSelect
          ariaLabel="Commit"
          value={phase}
          onChange={(next) =>
            onChange(withCommitPhase(value, next as SpecCommitPhase | "none"))
          }
          icon={UiGitCommit}
          options={[
            { value: "none", label: "Never" },
            { value: "turn", label: "Every turn" },
            { value: "agent", label: "After the loop" },
            { value: "run", label: "End of run" },
          ]}
        />
      </SpecField>
      {phase !== "none" && (
        <>
          <SpecField
            label="Commit message"
            hint={phase === "turn" ? "subject of the anchor commit" : undefined}
          >
            <SpecInput
              ariaLabel="Commit message"
              value={commit?.message}
              onChange={(message) => onChange(withCommit(value, { message }))}
              placeholder="Apply AI changes"
              icon={UiGitCommit}
            />
          </SpecField>
        </>
      )}
    </div>
  );
}
