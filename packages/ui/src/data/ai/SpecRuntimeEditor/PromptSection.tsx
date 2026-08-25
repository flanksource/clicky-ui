import { SegmentedControl } from "../../../components/SegmentedControl";
import { UiAdd, UiFileJson, UiGearSix, UiUser } from "../../../icons";
import {
  SPEC_SCHEMA_STRICTNESS,
  type AISpecRuntimeValue,
  type SpecSchemaStrictness,
} from "../SpecRuntimeEditor.model";
import { ExpandField, SpecField, TextareaField } from "./fields";
import { withPrompt } from "./update";
import {
  SUPPORT_ALL_RUNTIME_FIELDS,
  type RuntimeFieldSupport,
} from "../../runtime/runtime-field-support";

const SCHEMA_STRICTNESS_OPTIONS: Array<{
  id: SpecSchemaStrictness | "";
  label: string;
}> = [
  { id: "", label: "None" },
  ...SPEC_SCHEMA_STRICTNESS.map((mode) => ({
    id: mode,
    label: mode.charAt(0).toUpperCase() + mode.slice(1),
  })),
];

export function PromptSection({
  value,
  onChange,
  supports = SUPPORT_ALL_RUNTIME_FIELDS,
}: {
  value: AISpecRuntimeValue;
  onChange: (value: AISpecRuntimeValue) => void;
  supports?: RuntimeFieldSupport | undefined;
}) {
  return (
    <div className="grid gap-density-2">
      <ExpandField
        label="User override"
        value={value.prompt?.user}
        onChange={(user) => onChange(withPrompt(value, { user }))}
        placeholder="Override the rendered user prompt"
        icon={UiUser}
      />
      {supports("prompt.system") && (
        <ExpandField
          label="System"
          value={value.prompt?.system}
          onChange={(system) => onChange(withPrompt(value, { system }))}
          placeholder="Replace the system prompt"
          icon={UiGearSix}
        />
      )}
      {supports("prompt.appendSystem") && (
        <ExpandField
          label="Append system"
          value={value.prompt?.appendSystem}
          onChange={(appendSystem) =>
            onChange(withPrompt(value, { appendSystem }))
          }
          placeholder="Appended to the default system prompt"
          icon={UiAdd}
        />
      )}
    </div>
  );
}

export function PromptAdvanced({
  value,
  onChange,
}: {
  value: AISpecRuntimeValue;
  onChange: (value: AISpecRuntimeValue) => void;
}) {
  return (
    <div className="grid gap-density-2">
      <SpecField label="Schema strictness">
        <SegmentedControl<SpecSchemaStrictness | "">
          aria-label="Schema strictness"
          size="sm"
          wrap
          value={value.prompt?.schemaStrictness ?? ""}
          options={SCHEMA_STRICTNESS_OPTIONS}
          onChange={(schemaStrictness) =>
            onChange(withPrompt(value, { schemaStrictness }))
          }
        />
      </SpecField>
      <TextareaField
        label="Prompt schema JSON"
        value={schemaText(value.prompt?.schemaJSON)}
        onChange={(schemaJSON) => onChange(withPrompt(value, { schemaJSON }))}
        minHeight={176}
        icon={UiFileJson}
      />
    </div>
  );
}

function schemaText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "";
  }
}
