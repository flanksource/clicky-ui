import { SegmentedControl } from "../../../components/SegmentedControl";
import { UiRepeat } from "../../../icons";
import { FixtureEditor } from "../../FixtureEditor";
import type { ChatModel } from "../../chat/types";
import type { SpecRuntimeFamily } from "../../runtime/runtime-mode";
import {
  SPEC_VERIFY_SCOPES,
  type AISpecRuntimeValue,
  type SpecVerifyScope,
} from "../SpecRuntimeEditor.model";
import { NumberField, SpecField } from "./fields";
import type { SpecRuntimeSecretSelectorConfig } from "./types";
import { withVerify } from "./update";

const SCOPE_OPTIONS: Array<{ id: SpecVerifyScope; label: string }> =
  SPEC_VERIFY_SCOPES.map((scope) => ({
    id: scope,
    label: scope === "all" ? "All files" : "Changed files",
  }));

export function VerifySection({
  value,
  onChange,
  models,
  families,
  secretSelector,
}: {
  value: AISpecRuntimeValue;
  onChange: (value: AISpecRuntimeValue) => void;
  models?: ChatModel[] | undefined;
  families?: SpecRuntimeFamily[] | undefined;
  secretSelector?: SpecRuntimeSecretSelectorConfig | undefined;
}) {
  return (
    <div className="grid gap-density-3">
      <SpecField label="Verify fixture">
        <FixtureEditor
          value={value.workflow?.verify?.fixture ?? ""}
          onChange={(fixture) => onChange(withVerify(value, { fixture }))}
          size="sm"
          placeholder="Write the verify fixture markdown..."
          frontmatterEditor={{
            mode: "verification",
            models,
            families,
            secretSelector,
          }}
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
    </div>
  );
}
