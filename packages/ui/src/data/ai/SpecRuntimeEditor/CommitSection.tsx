import { UiGitCommit, UiPlay } from "../../../icons";
import type { AISpecRuntimeValue } from "../SpecRuntimeEditor.model";
import { CheckboxField, SpecField, SpecInput } from "./fields";
import { withPostRun } from "./update";

export function CommitSection({
  value,
  onChange,
}: {
  value: AISpecRuntimeValue;
  onChange: (value: AISpecRuntimeValue) => void;
}) {
  return (
    <div className="grid gap-density-2 md:grid-cols-[minmax(8rem,10rem)_minmax(8rem,10rem)_minmax(0,1fr)]">
      <CheckboxField
        label="Commit"
        checked={value.workflow?.postRun?.commit}
        onChange={(commit) => onChange(withPostRun(value, { commit }))}
        icon={UiGitCommit}
      />
      <CheckboxField
        label="Dry run"
        checked={value.workflow?.postRun?.dryRun}
        onChange={(dryRun) => onChange(withPostRun(value, { dryRun }))}
        icon={UiPlay}
      />
      <SpecField label="Commit message">
        <SpecInput
          value={value.workflow?.postRun?.commitMessage}
          onChange={(commitMessage) =>
            onChange(withPostRun(value, { commitMessage }))
          }
          placeholder="Apply AI changes"
          icon={UiGitCommit}
        />
      </SpecField>
    </div>
  );
}
