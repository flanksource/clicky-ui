import { UiBrain, UiCurrencyDollar, UiTimer } from "../../icons";
import { cn } from "../../lib/utils";
import { Icon, type StaticIconComponent } from "../Icon";
import {
  effortLevelColor,
  effortLevelIcon,
  effortLevelLabel,
} from "../chat/effort-icons";
import type { RuntimeBarAction } from "./RuntimeBarActions";
import {
  COST_PRESETS,
  TIMEOUT_PRESETS,
  formatCost,
  parseCost,
  parseTimeout,
} from "./RuntimeBar.limits";
import { RuntimeLimitInput } from "./RuntimeLimitInput";
import {
  SEGMENT_CAPTION_CLASS,
  SEGMENT_KEY_CLASS,
  SegmentItemLabel,
} from "./RuntimeBarSegment";
import { UNSPECIFIED_LABEL, UNSPECIFIED_HINT } from "./unspecified";

export function timeoutField({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (next: string | undefined) => void;
}): RuntimeBarAction {
  return limitField({
    id: "budget.timeout",
    label: "Timeout",
    inputLabel: "Timeout duration",
    icon: UiTimer,
    current: value,
    text: value ?? "",
    placeholder: "45m",
    presets: TIMEOUT_PRESETS.map((timeout) => ({
      label: timeout,
      value: timeout,
    })),
    parse: parseTimeout,
    onChange,
  });
}

export function budgetField({
  value,
  onChange,
}: {
  value: number | undefined;
  onChange: (next: number | undefined) => void;
}): RuntimeBarAction {
  return limitField({
    id: "budget.cost",
    label: "Budget",
    inputLabel: "Budget (USD)",
    icon: UiCurrencyDollar,
    current: formatCost(value),
    text: value === undefined ? "" : String(value),
    placeholder: "2.50",
    presets: COST_PRESETS.map((cost) => ({
      label: formatCost(cost)!,
      value: cost,
    })),
    parse: parseCost,
    onChange,
  });
}

function limitField<V extends string | number>({
  id,
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
  id: string;
  label: string;
  inputLabel: string;
  icon: StaticIconComponent;
  current: string | undefined;
  text: string;
  placeholder: string;
  presets: { label: string; value: V }[];
  parse: (text: string) => V | undefined;
  onChange: (next: V | undefined) => void;
}): RuntimeBarAction {
  return {
    id,
    label,
    icon,
    isSet: current !== undefined,
    title: `${label} — ${current ?? "no limit"}`,
    caption: (
      <>
        <Icon icon={icon} className="size-4 shrink-0 text-muted-foreground" />
        <span className={SEGMENT_CAPTION_CLASS}>{current}</span>
      </>
    ),
    header: (
      <div className="grid gap-1">
        <span className={SEGMENT_KEY_CLASS}>{inputLabel}</span>
        <RuntimeLimitInput
          inputLabel={inputLabel}
          text={text}
          placeholder={placeholder}
          parse={parse}
          current={current}
          onChange={onChange}
        />
      </div>
    ),
    items: [
      {
        label: (
          <SegmentItemLabel text="No limit" selected={current === undefined} />
        ),
        onSelect: () => onChange(undefined),
      },
      ...presets.map((preset) => ({
        label: (
          <SegmentItemLabel
            text={preset.label}
            selected={preset.label === current}
          />
        ),
        onSelect: () => onChange(preset.value),
      })),
    ],
  };
}

export function effortField({
  value,
  offered,
  supported,
  onChange,
}: {
  value: string | undefined;
  offered: string[];
  supported: string[];
  onChange: (next: string) => void;
}): RuntimeBarAction {
  const glyph = value ? effortLevelIcon(value) : undefined;
  return {
    id: "effort",
    label: "Effort",
    title: "Reasoning effort",
    isSet: Boolean(value),
    icon: UiBrain,
    iconClassName: "text-muted-foreground",
    caption: (
      <>
        <span className={SEGMENT_KEY_CLASS}>Effort</span>
        {glyph && (
          <Icon
            icon={glyph}
            className={cn("size-4 shrink-0", effortLevelColor(value!))}
          />
        )}
        <span className={SEGMENT_CAPTION_CLASS}>
          {value ? effortLevelLabel(value) : UNSPECIFIED_LABEL}
        </span>
      </>
    ),
    items: [
      {
        label: (
          <SegmentItemLabel
            text={UNSPECIFIED_LABEL}
            hint={UNSPECIFIED_HINT}
            selected={!value}
          />
        ),
        onSelect: () => onChange(""),
      },
      ...[
        ...new Set([...offered, ...supported, ...(value ? [value] : [])]),
      ].map((effort) => {
        const icon = effortLevelIcon(effort);
        return {
          label: (
            <SegmentItemLabel
              text={effortLevelLabel(effort)}
              selected={value === effort}
              {...(supported.includes(effort) ? {} : { hint: "unsupported" })}
            />
          ),
          ...(icon ? { icon } : {}),
          iconClassName: effortLevelColor(effort),
          disabled: !supported.includes(effort),
          onSelect: () => onChange(effort),
        };
      }),
    ],
  };
}
