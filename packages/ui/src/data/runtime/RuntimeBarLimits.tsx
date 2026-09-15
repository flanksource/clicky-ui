import { useState } from "react";
import { InputField } from "../../components/InputField";
import { UiCurrencyDollar, UiTimer } from "../../icons";
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
  const [draft, setDraft] = useState<string>();
  const shown = draft ?? text;
  const invalid = shown.trim() !== "" && parse(shown) === undefined;
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
      items={items}
      header={
        <div className="grid gap-1">
          <span className={SEGMENT_KEY_CLASS}>{inputLabel}</span>
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
            className="bg-background"
          />
        </div>
      }
    >
      <Icon icon={icon} className="size-4 shrink-0 text-muted-foreground" />
      <span
        className={current ? SEGMENT_CAPTION_CLASS : "truncate text-xs text-muted-foreground"}
      >
        {current ?? "None"}
      </span>
    </RuntimeSegment>
  );
}
