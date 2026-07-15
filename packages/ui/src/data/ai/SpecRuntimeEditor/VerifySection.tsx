import { SegmentedControl } from "../../../components/SegmentedControl";
import { UiGitCommit, UiPlay, UiRepeat } from "../../../icons";
import { FixtureEditor } from "../../FixtureEditor";
import {
  SPEC_VERIFY_SCOPES,
  type AISpecRuntimeValue,
  type SpecVerifyScope,
} from "../SpecRuntimeEditor.model";
import { CheckboxField, NumberField, SpecField, SpecInput } from "./fields";
import { withFinalize, withVerify } from "./update";

const SCOPE_OPTIONS: Array<{ id: SpecVerifyScope; label: string }> =
  SPEC_VERIFY_SCOPES.map((scope) => ({
    id: scope,
    label: scope === "all" ? "All files" : "Changed files",
  }));

export function VerifySection({
  value,
  onChange,
}: {
  value: AISpecRuntimeValue;
  onChange: (value: AISpecRuntimeValue) => void;
}) {
  return (
    <div className="grid gap-density-3">
      <SpecField label="Verify fixture">
        <FixtureEditor
          value={value.workflow?.verify?.fixture ?? ""}
          onChange={(fixture) => onChange(withVerify(value, { fixture }))}
          size="sm"
          placeholder="Write the verify fixture markdown..."
        />
      </SpecField>
      <div className="flex flex-wrap items-end gap-density-3">
        <SpecField label="Scope">
          <SegmentedControl
            aria-label="Verification scope"
            size="sm"
            value={(value.workflow?.verify?.scope || "all") as SpecVerifyScope}
            onChange={(scope) => onChange(withVerify(value, { scope }))}
            options={SCOPE_OPTIONS}
          />
        </SpecField>
        <div className="w-32">
          <NumberField
            label="Max iterations"
            value={value.workflow?.verify?.maxIterations}
            onChange={(maxIterations) =>
              onChange(withVerify(value, { maxIterations: maxIterations ?? 0 }))
            }
            icon={UiRepeat}
            min={0}
            step={1}
            integer
          />
        </div>
      </div>
      <div className="grid gap-density-2 md:grid-cols-[minmax(8rem,10rem)_minmax(8rem,10rem)_minmax(0,1fr)]">
        <CheckboxField
          label="Commit"
          checked={value.workflow?.finalize?.commit}
          onChange={(commit) => onChange(withFinalize(value, { commit }))}
          icon={UiGitCommit}
        />
        <CheckboxField
          label="Dry run"
          checked={value.workflow?.finalize?.dryRun}
          onChange={(dryRun) => onChange(withFinalize(value, { dryRun }))}
          icon={UiPlay}
        />
        <SpecField label="Commit message">
          <SpecInput
            value={value.workflow?.finalize?.commitMessage}
            onChange={(commitMessage) =>
              onChange(withFinalize(value, { commitMessage }))
            }
            placeholder="Apply AI changes"
            icon={UiGitCommit}
          />
        </SpecField>
      </div>
    </div>
  );
}
