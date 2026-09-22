import { useId, useState } from "react";
import { Combobox, type ComboboxOption } from "../../components/Combobox";
import { InputField } from "../../components/InputField";
import { UiCurrencyDollar, UiTimer } from "../../icons";
import { cn } from "../../lib/utils";
import type { DropdownMenuItem } from "../../overlay/DropdownMenu";
import { Icon, type StaticIconComponent } from "../Icon";
import {
  COST_PRESETS,
  TIMEOUT_PRESETS,
  formatCost,
  parseCost,
  parseTimeout,
} from "./RuntimeBar.limits";
import {
  RuntimeSegment,
  SEGMENT_CAPTION_CLASS,
  SEGMENT_KEY_CLASS,
  SegmentItemLabel,
} from "./RuntimeBarSegment";

export function TimeoutSegment({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (next: string | undefined) => void;
}) {
  return (
    <LimitSegment
      label="Timeout"
      inputLabel="Timeout duration"
      icon={UiTimer}
      current={value}
      text={value ?? ""}
      placeholder="45m"
      presets={TIMEOUT_PRESETS.map((timeout) => ({ label: timeout, value: timeout }))}
      parse={parseTimeout}
      onChange={onChange}
    />
  );
}

export function CostSegment({
  value,
  onChange,
}: {
  value: number | undefined;
  onChange: (next: number | undefined) => void;
}) {
  return (
    <LimitSegment
      label="Max cost"
      inputLabel="Max cost (USD)"
      icon={UiCurrencyDollar}
      current={formatCost(value)}
      text={value === undefined ? "" : String(value)}
      placeholder="2.50"
      presets={COST_PRESETS.map((cost) => ({ label: formatCost(cost) ?? "", value: cost }))}
      parse={parseCost}
      onChange={onChange}
    />
  );
}

export function RuntimeBarLimitFields({
  timeout,
  cost,
  showTimeout,
  showCost,
  onTimeoutChange,
  onCostChange,
}: {
  timeout: string | undefined;
  cost: number | undefined;
  showTimeout: boolean;
  showCost: boolean;
  onTimeoutChange: (next: string | undefined) => void;
  onCostChange: (next: number | undefined) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="grid gap-1">
        {showTimeout && (
          <LimitField
            label="Timeout"
            icon={UiTimer}
            inputLabel="Timeout duration"
            current={timeout}
            text={timeout ?? ""}
            placeholder="45m"
            presets={TIMEOUT_PRESETS.map((preset) => ({
              label: preset,
              value: preset,
            }))}
            parse={parseTimeout}
            onChange={onTimeoutChange}
          />
        )}
        {showCost && (
          <LimitField
            label="Max cost"
            icon={UiCurrencyDollar}
            inputLabel="Max cost (USD)"
            current={formatCost(cost)}
            text={cost === undefined ? "" : String(cost)}
            placeholder="2.50"
            presets={COST_PRESETS.map((preset) => ({ label: formatCost(preset) ?? "", value: preset }))}
            parse={parseCost}
            onChange={onCostChange}
          />
        )}
      </div>
    </div>
  );
}

// A preset menu plus a free-text header. Typed text is held while the field is
// focused and only committed once it parses, so partial input ("2.") never
// rewrites the value under the caret.
function LimitSegment<V extends string | number>({
  label,
  inputLabel,
  icon,
  current,
  text,
  placeholder,
  presets,
  parse,
  onChange,
}: {
  label: string;
  inputLabel: string;
  icon: StaticIconComponent;
  current: string | undefined;
  text: string;
  placeholder: string;
  presets: { label: string; value: V }[];
  parse: (text: string) => V | undefined;
  onChange: (next: V | undefined) => void;
}) {
  const items: DropdownMenuItem[] = [
    {
      group: label,
      label: <SegmentItemLabel text="No limit" selected={current === undefined} />,
      onSelect: () => onChange(undefined),
    },
    ...presets.map((preset) => ({
      group: label,
      label: <SegmentItemLabel text={preset.label} selected={preset.label === current} />,
      onSelect: () => onChange(preset.value),
    })),
  ];

  return (
    <RuntimeSegment
      menuLabel={label}
      title={`${label} — ${current ?? "no limit"}`}
      // A limit is only worth showing at its full value, so it never absorbs the
      // settings row's shrink; the effort segment's "Effort" key label does.
      className="shrink-0"
      items={items}
      header={
        <div className="grid gap-1">
          <span className={SEGMENT_KEY_CLASS}>{inputLabel}</span>
          <LimitInput
            inputLabel={inputLabel}
            text={text}
            placeholder={placeholder}
            parse={parse}
            current={current}
            onChange={onChange}
          />
        </div>
      }
    >
      <Icon icon={icon} className="size-4 shrink-0 text-muted-foreground" />
      <span
        className={cn(
          "shrink-0",
          current ? SEGMENT_CAPTION_CLASS : "truncate text-xs text-muted-foreground",
        )}
      >
        {current ?? "None"}
      </span>
    </RuntimeSegment>
  );
}

function LimitField<V extends string | number>({
  label,
  icon,
  inputLabel,
  current,
  text,
  placeholder,
  presets,
  parse,
  onChange,
}: {
  label: string;
  icon: StaticIconComponent;
  inputLabel: string;
  current: string | undefined;
  text: string;
  placeholder: string;
  presets: { label: string; value: V }[];
  parse: (text: string) => V | undefined;
  onChange: (next: V | undefined) => void;
}) {
  const id = useId();
  return (
    <div
      role="group"
      aria-label={`${label} limit`}
      className="flex min-w-0 items-center gap-2"
    >
      <span className="flex min-w-0 flex-1 items-center gap-1.5 text-xs font-medium text-foreground">
        <Icon icon={icon} className="size-4 shrink-0 text-muted-foreground" />
        <span className="truncate">{label}</span>
      </span>
      <LimitInput
        inputLabel={inputLabel}
        text={text}
        placeholder={placeholder}
        parse={parse}
        current={current}
        onChange={onChange}
        className="w-24 shrink-0"
      />
      <Combobox
        id={`${id}-presets`}
        ariaLabel={`${label} presets`}
        value={current ?? ""}
        onChange={(selectedPreset) => {
          if (selectedPreset === "" || selectedPreset === "__no_limit") {
            onChange(undefined);
            return;
          }
          const preset = presets.find(
            (candidate) => candidate.label === selectedPreset,
          );
          if (!preset) {
            throw new Error(`Unknown ${label} preset: ${selectedPreset}`);
          }
          onChange(preset.value);
        }}
        options={[
          { value: "__no_limit", label: "No limit" },
          ...presets.map<ComboboxOption>((preset) => ({
            value: preset.label,
            label: preset.label,
          })),
        ]}
        allowCustomValue={false}
        size="xs"
        placeholder="Presets"
        className="w-28 shrink-0"
      />
    </div>
  );
}

function LimitInput<V extends string | number>({
  inputLabel,
  text,
  placeholder,
  parse,
  current,
  onChange,
  className,
}: {
  inputLabel: string;
  text: string;
  placeholder: string;
  parse: (text: string) => V | undefined;
  current: string | undefined;
  onChange: (next: V | undefined) => void;
  className?: string | undefined;
}) {
  const [draft, setDraft] = useState<string>();
  const shown = draft ?? text;
  const invalid = shown.trim() !== "" && parse(shown) === undefined;
  return (
    <InputField
      value={shown}
      aria-label={inputLabel}
      placeholder={placeholder}
      invalid={invalid}
      onFocus={() => setDraft(text)}
      onBlur={() => setDraft(undefined)}
      onChange={(next) => {
        setDraft(next);
        if (next.trim() === "") {
          if (current !== undefined) onChange(undefined);
          return;
        }
        const parsed = parse(next);
        if (parsed !== undefined) onChange(parsed);
      }}
      inputClassName="font-mono text-xs"
      className={cn("bg-background", className)}
    />
  );
}
