import { useEffect, useRef, useState, type RefObject } from "react";
import { Icon } from "../data/Icon";
import { cn } from "../lib/utils";
import { Button } from "./button";

export type TimeRangeKind = "time" | "date";

export type TimeRangePreset = {
  label: string;
  from: string;
  to: string;
};

export type TimeRangeChipRow = {
  id: string;
  label: string;
  chips: { label: string; token: string }[];
};

export type TimeRangeProps = {
  kind?: TimeRangeKind;
  label?: string;
  from?: string;
  to?: string;
  onApply: (from: string, to: string) => void;
  presets?: TimeRangePreset[];
  chipRows?: TimeRangeChipRow[];
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

export function TimeRange({
  kind = "time",
  label = "Time range",
  from = "",
  to = "",
  onApply,
  presets,
  chipRows,
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

  const usePresetList = presets !== undefined;
  const activePresets = presets ?? [];
  const activeChipRows = chipRows ?? (kind === "date" ? defaultDateChipRows : defaultTimeChipRows);

  useDismissablePopup(open, rootRef, triggerRef, () => setOpen(false));

  useEffect(() => {
    if (open) {
      setDraftFrom(from);
      setDraftTo(to);
    }
  }, [from, open, to]);

  const buttonLabel = formatRangeLabel(kind, from, to, emptyLabel);
  const activeToken = normalizeRangeValue(kind, from);

  function applyRange(nextFrom: string, nextTo: string) {
    onApply(normalizeRangeValue(kind, nextFrom), normalizeRangeValue(kind, nextTo));
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
          name={kind === "time" ? "codicon:clock" : "codicon:calendar"}
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
              {kind === "time" ? "UTC" : "Relative"}
            </span>
          </div>

          {usePresetList ? (
            <div className="px-3.5 pt-3">
              <PresetList presets={activePresets} onApply={applyRange} />
            </div>
          ) : (
            <ChipRowList rows={activeChipRows} activeToken={activeToken} onApply={applyRange} />
          )}

          <div className="border-t border-border/60 bg-muted/30 px-3.5 py-2.5">
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Custom
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
              />
              <Icon
                name="codicon:arrow-right"
                className="text-muted-foreground text-[12px]"
                aria-hidden="true"
              />
              <DraftRangeInput
                aria-label={`${label} to`}
                placeholder={toPlaceholder ?? (kind === "date" ? "YYYY-MM-DD or now" : "now")}
                value={draftTo}
                onChange={setDraftTo}
                onClear={() => setDraftTo("")}
                pickerKind={kind}
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
  ...rest
}: {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder: string | undefined;
  pickerKind?: TimeRangeKind;
  "aria-label": string;
}) {
  const ariaLabel = rest["aria-label"];
  const showCalendar = pickerKind !== undefined;
  const showTimeInput = pickerKind === "time";
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
          <Icon name="codicon:close" className="text-[12px]" />
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
            <Icon name="codicon:calendar" className="text-[12px]" />
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
                  title={chip.token}
                  aria-label={chip.token}
                  aria-pressed={active}
                  onClick={() => onApply(chip.token, "now")}
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

function normalizeRangeValue(kind: TimeRangeKind, value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed === "now" || trimmed.startsWith("now")) return trimmed;
  if (kind === "time" && /^[+-]\d/.test(trimmed)) return `now${trimmed}`;
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
