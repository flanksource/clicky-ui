import { UiGitCommit } from "../../../icons";
import type {
  AISpecRuntimeCommit,
  AISpecRuntimeValue,
} from "../SpecRuntimeEditor.model";
import { SpecField, SpecInput } from "./fields";
import { commitPhase, commitPhaseFromEntry, withCommit } from "./update";

export function CommitSection({
  value,
  onChange,
  inheritedCommits,
}: {
  value: AISpecRuntimeValue;
  onChange: (value: AISpecRuntimeValue) => void;
  /**
   * Commit stanza(s) inherited from a lower spec layer (e.g. the lifecycle
   * step's own workflow). Determines whether message details apply while the
   * editable layer inherits its policy. The runtime bar owns phase selection.
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
    <div className="grid gap-density-2">
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
