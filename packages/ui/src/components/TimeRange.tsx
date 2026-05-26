import { useEffect, useRef, useState, type RefObject } from "react";
import { Icon } from "../data/Icon";
import {
  CodiconArrowRightIcon,
  CodiconCalendarIcon,
  CodiconCloseIcon,
  CodiconWatchIcon,
} from "../data/static-icons";
import { cn } from "../lib/utils";
import { Button } from "./button";
import { Select } from "./select";

export type TimeRangeKind = "time" | "date";

export type TimeRangePresetGroup = "min" | "hr" | "day" | "wk+" | "this" | "last";

export type TimeRangePreset = {
  label: string;
  from: string;
  to: string;
};

export type TimeRangeChipRow = {
  id: string;
  label: string;
  chips: { label: string; token: string; to?: string; ariaLabel?: string; title?: string }[];
};

export type TimeRangeProps = {
  kind?: TimeRangeKind;
  label?: string;
  from?: string;
  to?: string;
  onApply: (from: string, to: string) => void;
  presets?: Array<TimeRangePreset | TimeRangePresetGroup>;
  chipRows?: TimeRangeChipRow[];
  timeEnabled?: boolean;
  timeZone?: string;
  timeZones?: string[];
  fromPlaceholder?: string;
  toPlaceholder?: string;
  emptyLabel?: string;
  align?: "left" | "right";
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  panelClassName?: string;
};

const defaultTimeChipRows: TimeRangeChipRow[] = [
  {
    id: "minutes",
    label: "Min",
    chips: [
      { label: "5m", token: "now-5m" },
      { label: "15m", token: "now-15m" },
      { label: "30m", token: "now-30m" },
    ],
  },
  {
    id: "hours",
    label: "Hr",
    chips: [
      { label: "1h", token: "now-1h" },
      { label: "2h", token: "now-2h" },
      { label: "4h", token: "now-4h" },
      { label: "8h", token: "now-8h" },
      { label: "12h", token: "now-12h" },
    ],
  },
  {
    id: "days",
    label: "Day",
    chips: [
      { label: "1d", token: "now-1d" },
      { label: "2d", token: "now-2d" },
      { label: "3d", token: "now-3d" },
      { label: "1w", token: "now-1w" },
    ],
  },
  {
    id: "weeks",
    label: "Wk+",
    chips: [
      { label: "2w", token: "now-2w" },
      { label: "1M", token: "now-1M" },
      { label: "3M", token: "now-3M" },
      { label: "6M", token: "now-6M" },
      { label: "1y", token: "now-1y" },
    ],
  },
];

const timeChipRowsByGroup: Record<
  Exclude<TimeRangePresetGroup, "this" | "last">,
  TimeRangeChipRow
> = {
  min: defaultTimeChipRows[0]!,
  hr: defaultTimeChipRows[1]!,
  day: defaultTimeChipRows[2]!,
  "wk+": defaultTimeChipRows[3]!,
};

const defaultDateChipRows: TimeRangeChipRow[] = [
  {
    id: "days",
    label: "Day",
    chips: [
      { label: "1d", token: "now-1d" },
      { label: "2d", token: "now-2d" },
      { label: "3d", token: "now-3d" },
      { label: "7d", token: "now-7d" },
    ],
  },
  {
    id: "weeks",
    label: "Wk",
    chips: [
      { label: "1w", token: "now-1w" },
      { label: "2w", token: "now-2w" },
      { label: "4w", token: "now-4w" },
    ],
  },
  {
    id: "months",
    label: "Mo",
    chips: [
      { label: "1M", token: "now-1M" },
      { label: "3M", token: "now-3M" },
      { label: "6M", token: "now-6M" },
      { label: "1y", token: "now-1y" },
    ],
  },
];

const thisLastChipRows: Record<Extract<TimeRangePresetGroup, "this" | "last">, TimeRangeChipRow> = {
  this: {
    id: "this",
    label: "This",
    chips: [
      { label: "Week", token: "now/w", to: "now/w+1w", ariaLabel: "this week" },
      { label: "Month", token: "now/M", to: "now/M+1M", ariaLabel: "this month" },
      { label: "Quarter", token: "now/q", to: "now/q+1q", ariaLabel: "this quarter" },
      { label: "Year", token: "now/y", to: "now/y+1y", ariaLabel: "this year" },
    ],
  },
  last: {
    id: "last",
    label: "Last",
    chips: [
      { label: "Week", token: "now/w-1w", to: "now/w", ariaLabel: "last week" },
      { label: "Month", token: "now/M-1M", to: "now/M", ariaLabel: "last month" },
      { label: "Quarter", token: "now/q-1q", to: "now/q", ariaLabel: "last quarter" },
      { label: "Year", token: "now/y-1y", to: "now/y", ariaLabel: "last year" },
    ],
  },
};

export function TimeRange({
  kind = "time",
  label = "Time range",
  from = "",
  to = "",
  onApply,
  presets,
  chipRows,
  timeEnabled = false,
  timeZone,
  timeZones,
  fromPlaceholder,
  toPlaceholder,
  emptyLabel,
  align = "right",
  disabled = false,
  className,
  triggerClassName,
  panelClassName,
}: TimeRangeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState(from);
  const [draftTo, setDraftTo] = useState(to);
  const resolvedDefaultTimeZone = timeZone ?? getDefaultTimeZone();
  const [selectedTimeZone, setSelectedTimeZone] = useState(resolvedDefaultTimeZone);

  const activeTimeZones = resolveTimeZones(timeZones, selectedTimeZone);
  const { rows: activeChipRows, presets: activePresets } = resolvePresetConfig(
    kind,
    presets,
    chipRows,
  );

  useDismissablePopup(open, rootRef, triggerRef, () => setOpen(false));

  useEffect(() => {
    if (open) {
      setDraftFrom(from);
      setDraftTo(to);
      setSelectedTimeZone(resolvedDefaultTimeZone);
    }
  }, [from, open, resolvedDefaultTimeZone, to]);

  const buttonLabel =
    formatSelectedPresetLabel(from, to, activeChipRows, activePresets) ??
    formatRangeLabel(kind, from, to, emptyLabel);
  const activeToken = normalizeRangeValue(kind, from, { timeEnabled, timeZone: selectedTimeZone });

  function applyRange(nextFrom: string, nextTo: string) {
    onApply(
      normalizeRangeValue(kind, nextFrom, { timeEnabled, timeZone: selectedTimeZone }),
      normalizeRangeValue(kind, nextTo, { timeEnabled, timeZone: selectedTimeZone }),
    );
    setOpen(false);
  }

  function clearRange() {
    setDraftFrom("");
    setDraftTo("");
    onApply("", "");
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={cn("relative inline-flex", className)}>
      <Button
        ref={triggerRef}
        type="button"
        variant="outline"
        size="sm"
        aria-label={`${label} filter`}
        aria-expanded={open}
        aria-haspopup="dialog"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "h-7 w-fit max-w-[12rem] min-w-0 gap-2 px-2 text-xs font-normal",
          triggerClassName,
        )}
      >
        <Icon
          icon={kind === "time" ? CodiconWatchIcon : CodiconCalendarIcon}
          className="text-muted-foreground text-[14px]"
        />
        <span className="truncate font-normal tabular-nums">{buttonLabel}</span>
      </Button>

      {open && (
        <div
          role="dialog"
          aria-label={label}
          className={cn(
            "absolute top-[calc(100%+0.375rem)] z-50 w-[22.5rem] overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg shadow-black/5 outline-none",
            align === "left" ? "left-0" : "right-0",
            panelClassName,
          )}
        >
          <div className="flex items-center justify-between border-b border-border/60 px-3.5 py-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {timeEnabled ? selectedTimeZone : "Relative"}
            </span>
          </div>

          {activeChipRows.length > 0 && (
            <ChipRowList rows={activeChipRows} activeToken={activeToken} onApply={applyRange} />
          )}
          {activePresets.length > 0 && (
            <div className={activeChipRows.length > 0 ? "px-3.5 pb-3" : "px-3.5 pt-3"}>
              <PresetList presets={activePresets} onApply={applyRange} />
            </div>
          )}

          <div className="border-t border-border/60 bg-muted/30 px-3.5 py-2.5">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Custom
              </div>
              {timeEnabled && (
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    TZ
                  </span>
                  <Select
                    aria-label={`${label} timezone`}
                    value={selectedTimeZone}
                    options={activeTimeZones.map((zone) => ({ value: zone, label: zone }))}
                    onChange={(event) => setSelectedTimeZone(event.target.value)}
                    className="h-7 w-40 truncate px-2 pr-7 font-mono text-xs"
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5">
              <DraftRangeInput
                aria-label={`${label} from`}
                placeholder={
                  fromPlaceholder ?? (kind === "date" ? "YYYY-MM-DD or now-1d" : "now-24h")
                }
                value={draftFrom}
                onChange={setDraftFrom}
                onClear={() => setDraftFrom("")}
                pickerKind={kind}
                timeEnabled={timeEnabled}
              />
              <Icon icon={CodiconArrowRightIcon} className="text-muted-foreground text-[12px]" />
              <DraftRangeInput
                aria-label={`${label} to`}
                placeholder={toPlaceholder ?? (kind === "date" ? "YYYY-MM-DD or now" : "now")}
                value={draftTo}
                onChange={setDraftTo}
                onClear={() => setDraftTo("")}
                pickerKind={kind}
                timeEnabled={timeEnabled}
              />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border/60 px-3 py-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2.5 text-xs"
              disabled={!from && !to}
              onClick={clearRange}
            >
              Clear
            </Button>
            <div className="flex gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2.5 text-xs"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                className="h-7 px-3.5 text-xs"
                onClick={() => applyRange(draftFrom, draftTo)}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DraftRangeInput({
  value,
  onChange,
  onClear,
  placeholder,
  pickerKind,
  timeEnabled,
  ...rest
}: {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder: string | undefined;
  pickerKind?: TimeRangeKind;
  timeEnabled: boolean;
  "aria-label": string;
}) {
  const ariaLabel = rest["aria-label"];
  const showCalendar = pickerKind !== undefined;
  const showTimeInput = pickerKind === "time" && timeEnabled;
  const { date: datePart, time: timePart } = splitDateTime(value);

  function setDatePart(nextDate: string) {
    if (!showTimeInput) {
      onChange(nextDate);
      return;
    }
    if (!nextDate) {
      onChange(timePart ? `T${timePart}` : "");
      return;
    }
    onChange(timePart ? `${nextDate}T${timePart}` : nextDate);
  }

  function setTimePart(nextTime: string) {
    if (!nextTime) {
      onChange(datePart);
      return;
    }
    onChange(datePart ? `${datePart}T${nextTime}` : `T${nextTime}`);
  }

  return (
    <div className="space-y-1">
      <DraftTextInput
        ariaLabel={ariaLabel}
        placeholder={placeholder}
        value={showTimeInput ? datePart : value}
        onChange={showTimeInput ? setDatePart : onChange}
        onClear={onClear}
        showCalendar={showCalendar}
      />
      {showTimeInput && (
        <DraftTimeInput ariaLabel={`${ariaLabel} time`} value={timePart} onChange={setTimePart} />
      )}
    </div>
  );
}

function resolvePresetConfig(
  kind: TimeRangeKind,
  presets: TimeRangeProps["presets"],
  chipRows: TimeRangeChipRow[] | undefined,
) {
  if (presets === undefined) {
    return {
      rows: chipRows ?? (kind === "date" ? defaultDateChipRows : defaultTimeChipRows),
      presets: [] as TimeRangePreset[],
    };
  }

  const rows: TimeRangeChipRow[] = chipRows ? [...chipRows] : [];
  const presetList: TimeRangePreset[] = [];

  for (const preset of presets) {
    if (typeof preset !== "string") {
      presetList.push(preset);
      continue;
    }
    if (preset === "this" || preset === "last") {
      rows.push(thisLastChipRows[preset]);
      continue;
    }
    rows.push(timeChipRowsByGroup[preset]);
  }

  return { rows, presets: presetList };
}

function DraftTextInput({
  ariaLabel,
  value,
  onChange,
  onClear,
  placeholder,
  showCalendar,
}: {
  ariaLabel: string;
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder: string | undefined;
  showCalendar: boolean;
}) {
  const pickerRef = useRef<HTMLInputElement | null>(null);
  const hasValue = value.length > 0;
  const paddingRight = showCalendar ? (hasValue ? "pr-12" : "pr-7") : "pr-7";

  return (
    <div className="relative">
      <input
        type="text"
        aria-label={ariaLabel}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "h-8 w-full rounded-md border border-input bg-background px-2 font-mono text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring",
          paddingRight,
        )}
      />
      {hasValue && (
        <button
          type="button"
          aria-label={`Clear ${ariaLabel}`}
          onClick={onClear}
          className={cn(
            "absolute inset-y-0 inline-flex w-5 items-center justify-center text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            showCalendar ? "right-6" : "right-1",
          )}
        >
          <Icon icon={CodiconCloseIcon} className="text-[12px]" />
        </button>
      )}
      {showCalendar && (
        <>
          <input
            ref={pickerRef}
            type="date"
            tabIndex={-1}
            aria-hidden="true"
            value={/^\d{4}-\d{2}-\d{2}$/.test(value.trim()) ? value.trim() : ""}
            onChange={(event) => onChange(event.target.value)}
            className="pointer-events-none absolute left-0 top-0 h-0 w-0 opacity-0"
          />
          <button
            type="button"
            aria-label={`Pick ${ariaLabel}`}
            onClick={() => pickerRef.current?.showPicker?.()}
            className="absolute inset-y-0 right-1 inline-flex w-5 items-center justify-center text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon icon={CodiconCalendarIcon} className="text-[12px]" />
          </button>
        </>
      )}
    </div>
  );
}

function DraftTimeInput({
  ariaLabel,
  value,
  onChange,
}: {
  ariaLabel: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      type="time"
      aria-label={ariaLabel}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-8 w-full rounded-md border border-input bg-background px-2 font-mono text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
    />
  );
}

function splitDateTime(value: string) {
  const trimmed = value.trim();
  const match = /^(\d{4}-\d{2}-\d{2})?T?(\d{2}:\d{2})?/.exec(trimmed);
  if (!match || trimmed.startsWith("now") || /^[+-]/.test(trimmed)) {
    return { date: trimmed, time: "" };
  }
  return { date: match[1] ?? "", time: match[2] ?? "" };
}

function ChipRowList({
  rows,
  activeToken,
  onApply,
}: {
  rows: TimeRangeChipRow[];
  activeToken: string;
  onApply: (from: string, to: string) => void;
}) {
  if (rows.length === 0) return null;

  return (
    <div className="px-3.5 py-3" role="list" aria-label="Time filters">
      {rows.map((row, index) => (
        <div
          key={row.id}
          className={cn(
            "grid grid-cols-[2rem_1fr] items-center gap-2",
            index === rows.length - 1 ? "" : "mb-1.5",
          )}
          role="listitem"
        >
          <span className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground">
            {row.label}
          </span>
          <div className="flex divide-x divide-border overflow-hidden rounded-[5px] border border-border">
            {row.chips.map((chip) => {
              const active = chip.token === activeToken;
              return (
                <button
                  key={chip.token}
                  type="button"
                  title={chip.title ?? chip.ariaLabel ?? chip.token}
                  aria-label={chip.ariaLabel ?? chip.token}
                  aria-pressed={active}
                  onClick={() => onApply(chip.token, chip.to ?? "now")}
                  className={cn(
                    "flex-1 min-w-0 px-0 py-1.5 text-center font-mono text-[11.5px] leading-none transition-colors focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "bg-foreground font-semibold text-background"
                      : "bg-background font-medium text-muted-foreground hover:bg-muted",
                  )}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function PresetList({
  presets,
  onApply,
}: {
  presets: TimeRangePreset[];
  onApply: (from: string, to: string) => void;
}) {
  if (presets.length === 0) return null;

  return (
    <div className="mb-3 space-y-1" role="list" aria-label="Time filters">
      {presets.map((preset) => (
        <button
          key={`${preset.label}-${preset.from}-${preset.to}`}
          type="button"
          className="flex h-8 w-full items-center justify-between gap-3 rounded-md border border-border bg-background px-2 text-left text-xs hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => onApply(preset.from, preset.to)}
        >
          <span className="min-w-0 truncate font-medium">{preset.label}</span>
          <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
            {formatPresetRange(preset)}
          </span>
        </button>
      ))}
    </div>
  );
}

function formatSelectedPresetLabel(
  from: string,
  to: string,
  rows: TimeRangeChipRow[],
  presets: TimeRangePreset[],
) {
  const normalizedFrom = from.trim();
  const normalizedTo = to.trim();
  if (!normalizedFrom && !normalizedTo) return undefined;

  for (const row of rows) {
    for (const chip of row.chips) {
      if (chip.token === normalizedFrom && (chip.to ?? "now") === normalizedTo) {
        return chip.ariaLabel ?? chip.title ?? chip.label;
      }
    }
  }

  return presets.find((preset) => preset.from === normalizedFrom && preset.to === normalizedTo)
    ?.label;
}

function formatPresetRange({ from, to }: TimeRangePreset) {
  if (!from) return to;
  if (!to || to === "now") return from;
  return `${from} -> ${to}`;
}

function useDismissablePopup(
  open: boolean,
  rootRef: RefObject<HTMLElement | null>,
  triggerRef: RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        onClose();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open, rootRef, triggerRef]);
}

function normalizeRangeValue(
  kind: TimeRangeKind,
  value: string,
  options: { timeEnabled?: boolean; timeZone?: string } = {},
) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed === "now" || trimmed.startsWith("now")) return trimmed;
  if (kind === "time" && /^[+-]\d/.test(trimmed)) return `now${trimmed}`;
  if (kind === "time" && options.timeEnabled) {
    return encodeDateTimeWithOffset(trimmed, options.timeZone ?? getDefaultTimeZone());
  }
  return trimmed;
}

function formatRangeLabel(kind: TimeRangeKind, from: string, to: string, emptyLabel?: string) {
  const trimmedFrom = from.trim();
  const trimmedTo = to.trim();

  if (!trimmedFrom && !trimmedTo) {
    return emptyLabel ?? (kind === "date" ? "Any date" : "now-24h");
  }

  if (kind === "time") {
    const normalizedFrom = normalizeRangeValue(kind, trimmedFrom);
    const normalizedTo = normalizeRangeValue(kind, trimmedTo || "now");
    if (!normalizedFrom) return normalizedTo;
    if (normalizedTo === "now") return normalizedFrom;
    return `${normalizedFrom} -> ${normalizedTo}`;
  }

  if (trimmedFrom && trimmedTo && trimmedFrom === trimmedTo) {
    return trimmedFrom;
  }

  if (!trimmedFrom) return trimmedTo;
  if (!trimmedTo) return trimmedFrom;
  return `${trimmedFrom} -> ${trimmedTo}`;
}

function getDefaultTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function resolveTimeZones(timeZones: string[] | undefined, selectedTimeZone: string) {
  const zones = timeZones && timeZones.length > 0 ? timeZones : [selectedTimeZone, "UTC"];
  return Array.from(new Set([selectedTimeZone, ...zones, "UTC"].filter(Boolean)));
}

function encodeDateTimeWithOffset(value: string, timeZone: string) {
  if (!isLocalDateTime(value) || hasExplicitOffset(value)) return value;

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?$/);
  if (!match) return value;

  const [, year, month, day, hour, minute, second = "00"] = match;
  const localUtcMillis = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  );
  const offsetMinutes = getTimeZoneOffsetMinutes(timeZone, localUtcMillis);
  return `${year}-${month}-${day}T${hour}:${minute}:${second}${formatOffset(offsetMinutes)}`;
}

function isLocalDateTime(value: string) {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?$/.test(value.trim());
}

function hasExplicitOffset(value: string) {
  return /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value.trim());
}

function getTimeZoneOffsetMinutes(timeZone: string, localUtcMillis: number) {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const parts = Object.fromEntries(
      formatter
        .formatToParts(new Date(localUtcMillis))
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, part.value]),
    );
    const zonedUtcMillis = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second),
    );
    return (zonedUtcMillis - localUtcMillis) / 60_000;
  } catch {
    return 0;
  }
}

function formatOffset(offsetMinutes: number) {
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const hours = Math.floor(abs / 60)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor(abs % 60)
    .toString()
    .padStart(2, "0");
  return `${sign}${hours}:${minutes}`;
}
