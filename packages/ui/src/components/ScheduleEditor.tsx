import { type ReactNode } from "react";
import { cn } from "../lib/utils";
import { Button } from "./button";
import { Combobox, type ComboboxOption } from "./Combobox";
import { Field } from "./Field";
import { InputField } from "./InputField";
import {
  formatStructuredCron,
  parseStructuredCron,
} from "./schedule-cron-model";
import { Switch } from "./Switch";
import { COMMON_CRON_SUGGESTIONS, type CronSuggestion } from "./schedule-types";

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

const WEEKDAYS = [
  { value: 0, short: "Sun", label: "Sunday" },
  { value: 1, short: "Mon", label: "Monday" },
  { value: 2, short: "Tue", label: "Tuesday" },
  { value: 3, short: "Wed", label: "Wednesday" },
  { value: 4, short: "Thu", label: "Thursday" },
  { value: 5, short: "Fri", label: "Friday" },
  { value: 6, short: "Sat", label: "Saturday" },
] as const;

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
    ...(suggestion.description ? { description: suggestion.description } : {}),
    selectedLabel: suggestion.cron,
    trailing: (
      <code className="text-[11px] text-muted-foreground">
        {suggestion.cron}
      </code>
    ),
  }));
  const timezoneOptions = [...new Set(timezoneSuggestions ?? [])];
  const structured = parseStructuredCron(value.cron);
  const structuredDisabled = Boolean(disabled || !structured);

  const changeTime = (time: string) => {
    if (!structured || !/^\d{2}:\d{2}$/.test(time)) return;
    onChange({
      ...value,
      cron: formatStructuredCron(time, structured.weekdays),
    });
  };

  const toggleWeekday = (weekday: number) => {
    if (!structured) return;
    const selected = structured.weekdays.includes(weekday);
    if (selected && structured.weekdays.length === 1) return;
    const weekdays = selected
      ? structured.weekdays.filter((day) => day !== weekday)
      : [...structured.weekdays, weekday];
    onChange({
      ...value,
      cron: formatStructuredCron(structured.time, weekdays),
    });
  };

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
      <div className="grid gap-3 sm:grid-cols-[minmax(10rem,0.35fr)_minmax(0,1fr)]">
        <Field label="Time" htmlFor={`${id}-time`}>
          <InputField
            id={`${id}-time`}
            type="time"
            value={structured?.time ?? ""}
            disabled={structuredDisabled}
            onChange={changeTime}
          />
        </Field>
        <Field
          label="Days of week"
          helper={
            structured
              ? "Select one or more days."
              : "This custom cron expression is preserved; edit it above to enable time and weekday controls."
          }
        >
          <div
            className="flex flex-wrap gap-1"
            role="group"
            aria-label="Days of week"
          >
            {WEEKDAYS.map((weekday) => {
              const selected =
                structured?.weekdays.includes(weekday.value) ?? false;
              return (
                <Button
                  key={weekday.value}
                  type="button"
                  size="sm"
                  variant={selected ? "secondary" : "outline"}
                  aria-label={weekday.label}
                  aria-pressed={selected}
                  disabled={structuredDisabled}
                  onClick={() => toggleWeekday(weekday.value)}
                >
                  {weekday.short}
                </Button>
              );
            })}
          </div>
        </Field>
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
