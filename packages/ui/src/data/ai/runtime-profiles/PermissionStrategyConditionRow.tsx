import { Combobox } from "../../../components/Combobox";
import { Select } from "../../../components/select";
import { UiTrash } from "../../../icons";
import type { MatchPatterns, PermissionRule } from "../../chat/tool-policy";
import type { ToolMeta } from "../../chat/types";
import {
  MATCH_FIELD_OPTIONS,
  conditionText,
  isHintField,
  patternValues,
  removeCondition,
  replaceMatchField,
  toolFieldSuggestions,
  updateCondition,
  updatePatternCondition,
  type MatchField,
} from "./PermissionStrategiesEditor.model";

export function PermissionStrategyConditionRow({
  rule,
  field,
  index,
  tools,
  onChange,
}: {
  rule: PermissionRule;
  field: MatchField;
  index: number;
  tools: ToolMeta[];
  onChange: (value: PermissionRule) => void;
}) {
  const hint = isHintField(field);
  const multiple = !hint && Array.isArray(rule[field]);
  const suggestions = hint ? [] : toolFieldSuggestions(tools, field);
  const options = suggestions.map((value) => ({ value, label: value }));
  const setPattern = (value: MatchPatterns) => {
    if (hint) throw new Error(`${field} is not a pattern condition`);
    onChange(updatePatternCondition({ rule, field, value }));
  };

  return (
    <div className="grid gap-2 sm:grid-cols-[9rem_4.5rem_minmax(0,1fr)_2.25rem]">
      <Select
        aria-label={`Match field ${index + 1}`}
        value={field}
        onChange={(event) =>
          onChange(
            replaceMatchField(rule, field, event.target.value as MatchField),
          )
        }
        options={MATCH_FIELD_OPTIONS}
      />
      {hint ? (
        <span className="flex h-control-h items-center justify-center rounded-md border border-input bg-muted/30 text-xs font-medium text-muted-foreground">
          is
        </span>
      ) : (
        <Select
          aria-label={`Match operator ${index + 1}`}
          value={multiple ? "in" : "is"}
          onChange={(event) => {
            const values = patternValues(rule[field]);
            setPattern(event.target.value === "in" ? values : (values[0] ?? ""));
          }}
          options={[
            { value: "is", label: "is" },
            { value: "in", label: "in" },
          ]}
        />
      )}
      {hint ? (
        <Select
          aria-label={`Match value ${index + 1}`}
          value={conditionText(rule, field)}
          onChange={(event) =>
            onChange(updateCondition(rule, field, event.target.value))
          }
          options={[
            { value: "true", label: "Yes" },
            { value: "false", label: "No" },
          ]}
        />
      ) : multiple ? (
        <Combobox
          ariaLabel={`Match values ${index + 1}`}
          multiple
          variant="tags"
          value={patternValues(rule[field])}
          options={options}
          allowCustomValue
          separators={[","]}
          onChange={setPattern}
        />
      ) : (
        <Combobox
          ariaLabel={`Match value ${index + 1}`}
          value={conditionText(rule, field)}
          options={options}
          allowCustomValue
          onChange={setPattern}
        />
      )}
      <button
        type="button"
        aria-label={`Remove match condition ${index + 1}`}
        onClick={() => onChange(removeCondition(rule, field))}
        className="flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        <UiTrash className="size-4" />
      </button>
    </div>
  );
}
