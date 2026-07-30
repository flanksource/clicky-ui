import { UiGitCommit, UiPlay } from "../../../icons";
import type {
  AISpecRuntimeValue,
  SpecCommitPhase,
} from "../SpecRuntimeEditor.model";
import { CheckboxField, SpecField, SpecInput, SpecSelect } from "./fields";
import { commitPhase, withCommit, withCommitPhase } from "./update";

// The phase select doubles as the on/off control, the way the checkout and
// worktree sections use "none": the run either has a commit policy or it has
// none, and a separate checkbox would leave a stanza that says nothing.
export function CommitSection({
  value,
  onChange,
}: {
  value: AISpecRuntimeValue;
  onChange: (value: AISpecRuntimeValue) => void;
}) {
  const phase = commitPhase(value);
  const commit = value.workflow?.commits?.[0];
  return (
    <div className="grid gap-density-2 md:grid-cols-[minmax(8rem,10rem)_minmax(8rem,10rem)_minmax(0,1fr)]">
      <SpecField label="Commit">
        <SpecSelect
          ariaLabel="Commit"
          value={phase}
          onChange={(next) =>
            onChange(withCommitPhase(value, next as SpecCommitPhase | "none"))
          }
          icon={UiGitCommit}
        >
          <option value="none">Never</option>
          <option value="turn">Every turn</option>
          <option value="agent">After the loop</option>
          <option value="run">End of run</option>
        </SpecSelect>
      </SpecField>
      {phase !== "none" && (
        <>
          <CheckboxField
            label="Dry run"
            checked={commit?.dryRun}
            onChange={(dryRun) => onChange(withCommit(value, { dryRun }))}
            icon={UiPlay}
          />
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
