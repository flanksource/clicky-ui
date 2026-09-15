import { type ReactNode } from "react";
import { cn } from "../lib/utils";
import { Combobox, type ComboboxOption } from "./Combobox";
import { Field } from "./Field";
import { InputField } from "./InputField";
import { Switch } from "./Switch";
import {
  COMMON_CRON_SUGGESTIONS,
  type CronSuggestion,
} from "./schedule-types";

export interface ScheduleValue {
  cron: string;
  timezone: string;
  enabled: boolean;
}

export interface ScheduleEditorProps {
  id: string;
  value: ScheduleValue;
  onChange: (value: ScheduleValue) => void;
  disabled?: boolean;
  cronError?: ReactNode;
  timezoneError?: ReactNode;
  cronHelper?: ReactNode;
  timezoneHelper?: ReactNode;
  cronSuggestions?: readonly CronSuggestion[];
  timezoneSuggestions?: readonly string[];
  className?: string;
}

/**
 * Controlled recurring-schedule fields shared by operation and activity forms.
 * Saving, deleting and permission checks stay with the host because those are
 * application policy; the value shape and accessible field chrome stay here.
 */
export function ScheduleEditor({
  id,
  value,
  onChange,
  disabled,
  cronError,
  timezoneError,
  cronHelper,
  timezoneHelper,
  cronSuggestions,
  timezoneSuggestions,
  className,
}: ScheduleEditorProps) {
  const cronID = `${id}-cron`;
  const timezoneID = `${id}-timezone`;
  const timezoneListID = `${id}-timezone-suggestions`;
  const cronOptions = uniqueCronSuggestions([
    ...(cronSuggestions ?? []),
    ...COMMON_CRON_SUGGESTIONS,
  ]).map<ComboboxOption>((suggestion) => ({
    value: suggestion.cron,
    label: suggestion.label,
    ...(suggestion.description
      ? { description: suggestion.description }
      : {}),
    selectedLabel: suggestion.cron,
    trailing: (
      <code className="text-[11px] text-muted-foreground">
        {suggestion.cron}
      </code>
    ),
  }));
  const timezoneOptions = [...new Set(timezoneSuggestions ?? [])];

  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
        <Field
          label="Cron expression"
          htmlFor={cronID}
          required
          {...(cronError ? { error: cronError } : {})}
          {...(cronHelper ? { helper: cronHelper } : {})}
        >
          <Combobox
            id={cronID}
            value={value.cron}
            options={cronOptions}
            required
            ariaRequired
            allowCustomValue
            invalid={Boolean(cronError)}
            {...(disabled != null ? { disabled } : {})}
            onChange={(cron) => onChange({ ...value, cron })}
            onNew={(cron) => ({ value: cron, label: cron })}
          />
        </Field>
        <Field
          label="Timezone"
          htmlFor={timezoneID}
          {...(timezoneError ? { error: timezoneError } : {})}
          {...(timezoneHelper ? { helper: timezoneHelper } : {})}
        >
          <InputField
            id={timezoneID}
            value={value.timezone}
            autoComplete="off"
            invalid={Boolean(timezoneError)}
            {...(disabled != null ? { disabled } : {})}
            {...(timezoneOptions.length ? { list: timezoneListID } : {})}
            onChange={(timezone) => onChange({ ...value, timezone })}
          />
          {timezoneOptions.length ? (
            <datalist id={timezoneListID}>
              {timezoneOptions.map((timezone) => (
                <option key={timezone} value={timezone} />
              ))}
            </datalist>
          ) : null}
        </Field>
        <div className="flex items-end pb-density-2">
          <Switch
            checked={value.enabled}
            label="Enabled"
            {...(disabled != null ? { disabled } : {})}
            onChange={(enabled) => onChange({ ...value, enabled })}
          />
        </div>
      </div>
    </div>
  );
}

function uniqueCronSuggestions(
  suggestions: readonly CronSuggestion[],
): CronSuggestion[] {
  const seen = new Set<string>();
  return suggestions.filter((suggestion) => {
    if (seen.has(suggestion.cron)) return false;
    seen.add(suggestion.cron);
    return true;
  });
}
