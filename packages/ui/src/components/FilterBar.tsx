import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { FilterPill, type FilterMode } from "../data/FilterPill";
import { Icon } from "../data/Icon";
import { cn } from "../lib/utils";
import { Button } from "./button";
import type { MultiSelectOption } from "./MultiSelect";

export type FilterBarSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
};

export type FilterBarTextFilter = {
  key: string;
  kind: "text";
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export type FilterBarMultiFilterMode = Extract<FilterMode, "include" | "exclude">;

export type FilterBarMultiFilter = {
  key: string;
  kind: "multi";
  label: string;
  value: Record<string, FilterBarMultiFilterMode>;
  options: MultiSelectOption[];
  onChange: (value: Record<string, FilterBarMultiFilterMode>) => void;
  className?: string;
};

export type FilterBarFilter = FilterBarTextFilter | FilterBarMultiFilter;

export type FilterBarRangePreset = {
  label: string;
  from: string;
  to: string;
};

export type FilterBarRangeProps = {
  from?: string;
  to?: string;
  onApply: (from: string, to: string) => void;
  presets?: FilterBarRangePreset[];
  fromPlaceholder?: string;
  toPlaceholder?: string;
  emptyLabel?: string;
  className?: string;
};

export type FilterBarProps = {
  search?: FilterBarSearchProps;
  filters?: FilterBarFilter[];
  timeRange?: FilterBarRangeProps;
  dateRange?: FilterBarRangeProps;
  children?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  className?: string;
};

const DEFAULT_TIME_RANGE_PRESETS: FilterBarRangePreset[] = [
  { label: "Last 15 minutes", from: "now-15m", to: "now" },
  { label: "Last 1 hour", from: "now-1h", to: "now" },
  { label: "Last 6 hours", from: "now-6h", to: "now" },
  { label: "Last 24 hours", from: "now-24h", to: "now" },
  { label: "Last 7 days", from: "now-7d", to: "now" },
  { label: "Last 30 days", from: "now-30d", to: "now" },
];

export function FilterBar({
  search,
  filters,
  timeRange,
  dateRange,
  children,
  leading,
  trailing,
  className,
}: FilterBarProps) {
  const hasRangeControls = Boolean(timeRange || dateRange);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-lg border border-input bg-background px-2 py-1.5 shadow-sm",
        className,
      )}
    >
      {leading && <div className="flex items-center gap-2">{leading}</div>}

      {search && (
        <div className="flex min-w-[14rem] max-w-[24rem] flex-1 items-center gap-2">
          <label
            className={cn(
              "flex h-8 min-w-0 flex-1 items-center rounded-md border border-input bg-background px-3 text-sm",
              search.className,
            )}
          >
            {search.value.trim() ? (
              <span className="mr-2 whitespace-nowrap text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {search.ariaLabel ?? "Search"}
              </span>
            ) : (
              <Icon name="codicon:search" className="mr-2 shrink-0 text-muted-foreground" />
            )}
            <input
              type="search"
              aria-label={search.ariaLabel ?? search.placeholder ?? "Search"}
              className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
              placeholder={search.placeholder ?? "Search…"}
              value={search.value}
              onChange={(event) => search.onChange(event.target.value)}
            />
          </label>
        </div>
      )}

      {children}

      {filters?.map((filter, index) => {
        const grow = !search && index === 0;

        return filter.kind === "multi" ? (
          <MultiFilterField key={filter.key} filter={filter} grow={grow} />
        ) : (
          <TextFilterField key={filter.key} filter={filter} grow={grow} />
        );
      })}

      {(hasRangeControls || trailing) && (
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {dateRange && <RangeControlButton kind="date" label="Date range" {...dateRange} />}
          {timeRange && <RangeControlButton kind="time" label="Time range" {...timeRange} />}
          {trailing}
        </div>
      )}
    </div>
  );
}

function TextFilterField({
  filter,
  grow,
}: {
  filter: FilterBarTextFilter;
  grow: boolean;
}) {
  return (
    <label
      className={cn(
        "flex h-8 items-center gap-2 rounded-md border border-input bg-muted/30 pl-2 pr-2 text-xs",
        grow ? "min-w-[12rem] max-w-[18rem] flex-1" : "min-w-[11rem] max-w-[15rem] shrink-0",
        filter.className,
      )}
    >
      <span className="whitespace-nowrap font-medium uppercase tracking-wide text-muted-foreground">
        {filter.label}
      </span>
      <input
        type="text"
        aria-label={filter.label}
        className="w-full min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        placeholder={filter.placeholder ?? "Filter…"}
        value={filter.value}
        onChange={(event) => filter.onChange(event.target.value)}
      />
    </label>
  );
}

function MultiFilterField({
  filter,
  grow,
}: {
  filter: FilterBarMultiFilter;
  grow: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  useDismissablePopup(open, rootRef, triggerRef, () => setOpen(false));

  const summary = summarizeMultiFilter(filter.label, filter.value);

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative min-w-0",
        grow ? "min-w-[8rem] max-w-[12rem] flex-1" : "shrink-0",
        filter.className,
      )}
    >
      <Button
        ref={triggerRef}
        type="button"
        variant="outline"
        size="sm"
        aria-label={`${filter.label} filter`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "min-w-0 gap-2 font-normal",
          grow ? "w-full max-w-[12rem] justify-between" : "w-auto max-w-[8.5rem] px-2.5",
          summary === filter.label && "text-muted-foreground",
        )}
      >
        <span className="truncate">{summary}</span>
        <Icon
          name={open ? "codicon:chevron-up" : "codicon:chevron-down"}
          className="text-muted-foreground"
        />
      </Button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+0.375rem)] z-50 min-w-[18rem] max-w-[22rem] rounded-md border border-border bg-popover p-2 text-popover-foreground shadow-lg shadow-black/5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {filter.label}
            </div>
            <button
              type="button"
              className="text-[10px] text-primary disabled:text-muted-foreground"
              onClick={() => filter.onChange({})}
              disabled={Object.keys(filter.value).length === 0}
            >
              Clear all
            </button>
          </div>

          <div className="max-h-72 space-y-1 overflow-auto">
            {filter.options.map((option) => {
              const mode = filter.value[option.value] ?? "neutral";
              const title = typeof option.label === "string" ? option.label : option.value;

              return (
                <div
                  key={option.value}
                  role="button"
                  tabIndex={0}
                  data-filter-option={option.value}
                  className="rounded-md px-1.5 py-1 hover:bg-accent/50 focus-visible:bg-accent/50 focus-visible:outline-none"
                  onClick={() =>
                    filter.onChange(
                      updateMultiFilterValue(filter.value, option.value, nextFilterMode(mode)),
                    )
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      filter.onChange(
                        updateMultiFilterValue(filter.value, option.value, nextFilterMode(mode)),
                      );
                    }
                  }}
                >
                  <FilterPill
                    className="w-full justify-between"
                    label={option.label}
                    mode={mode}
                    title={title}
                    togglePosition="right"
                    onModeChange={(next) =>
                      filter.onChange(updateMultiFilterValue(filter.value, option.value, next))
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function RangeControlButton({
  kind,
  label,
  from = "",
  to = "",
  onApply,
  presets,
  fromPlaceholder,
  toPlaceholder,
  emptyLabel,
  className,
}: FilterBarRangeProps & { kind: "date" | "time"; label: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const fromInputRef = useRef<HTMLInputElement>(null);
  const toInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState(from);
  const [draftTo, setDraftTo] = useState(to);

  useDismissablePopup(open, rootRef, triggerRef, () => setOpen(false));

  useEffect(() => {
    if (open) {
      setDraftFrom(from);
      setDraftTo(to);
    }
  }, [from, open, to]);

  const rangePresets = useMemo(
    () => presets ?? (kind === "date" ? buildDateRangePresets() : DEFAULT_TIME_RANGE_PRESETS),
    [kind, presets],
  );

  const buttonLabel =
    kind === "time"
      ? formatRangeLabel(kind, from, to, emptyLabel)
      : formatRangeButtonLabel(label, kind, from, to, emptyLabel);

  function applyRange(nextFrom: string, nextTo: string) {
    onApply(
      kind === "time" ? normalizeDateMath(nextFrom) : nextFrom.trim(),
      kind === "time" ? normalizeDateMath(nextTo) : nextTo.trim(),
    );
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <Button
        ref={triggerRef}
        type="button"
        variant="outline"
        size="sm"
        aria-label={`${label} filter`}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((current) => !current)}
        className="w-fit max-w-[11rem] min-w-0 gap-2 font-normal"
      >
        <Icon
          name="codicon:calendar"
          className="text-muted-foreground"
        />
        <span className="truncate">{buttonLabel}</span>
      </Button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+0.375rem)] z-50 w-72 rounded-md border border-border bg-popover text-popover-foreground shadow-lg shadow-black/5">
          {rangePresets.length > 0 && (
            <div className="border-b border-border p-1">
              <div className="px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {label} presets
              </div>
              {rangePresets.map((preset) => {
                const active = from === preset.from && to === preset.to;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyRange(preset.from, preset.to)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent focus:bg-accent focus:outline-none",
                      active && "bg-accent font-medium",
                    )}
                  >
                    <span>{preset.label}</span>
                    <span className="text-[11px] text-muted-foreground">{preset.from}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="space-y-3 p-3">
            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Custom {label.toLowerCase()}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground">From</label>
                <RangeInput
                  inputRef={fromInputRef}
                  kind={kind}
                  placeholder={fromPlaceholder ?? (kind === "date" ? "" : "now-24h")}
                  value={draftFrom}
                  onChange={setDraftFrom}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground">To</label>
                <RangeInput
                  inputRef={toInputRef}
                  kind={kind}
                  placeholder={toPlaceholder ?? (kind === "date" ? "" : "now")}
                  value={draftTo}
                  onChange={setDraftTo}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs"
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

function summarizeMultiFilter(
  label: string,
  value: Record<string, FilterBarMultiFilterMode>,
): string {
  const includeCount = Object.values(value).filter((mode) => mode === "include").length;
  const excludeCount = Object.values(value).filter((mode) => mode === "exclude").length;

  if (includeCount === 0 && excludeCount === 0) {
    return label;
  }

  const counts = [
    includeCount > 0 ? `+${includeCount}` : null,
    excludeCount > 0 ? `-${excludeCount}` : null,
  ].filter(Boolean);

  return `${label} ${counts.join(" ")}`;
}

function updateMultiFilterValue(
  current: Record<string, FilterBarMultiFilterMode>,
  optionValue: string,
  nextMode: FilterMode,
): Record<string, FilterBarMultiFilterMode> {
  const next = { ...current };

  if (nextMode === "neutral") {
    delete next[optionValue];
    return next;
  }

  if (nextMode === "include" || nextMode === "exclude") {
    next[optionValue] = nextMode;
  }

  return next;
}

function nextFilterMode(mode: FilterMode): FilterMode {
  if (mode === "include") return "exclude";
  if (mode === "exclude") return "neutral";
  return "include";
}

function normalizeDateMath(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed === "now" || trimmed.startsWith("now")) return trimmed;
  if (/^[+-]\d/.test(trimmed)) return `now${trimmed}`;
  return trimmed;
}

function formatRangeLabel(
  kind: "date" | "time",
  from: string,
  to: string,
  emptyLabel?: string,
): string {
  const trimmedFrom = from.trim();
  const trimmedTo = to.trim();

  if (!trimmedFrom && !trimmedTo) {
    return emptyLabel ?? (kind === "date" ? "Any date" : "now-24h");
  }

  if (kind === "time") {
    const normalizedFrom = normalizeDateMath(trimmedFrom);
    const normalizedTo = normalizeDateMath(trimmedTo || "now");
    if (!normalizedFrom) return normalizedTo;
    if (normalizedTo === "now") return normalizedFrom;
    return `${normalizedFrom} → ${normalizedTo}`;
  }

  if (trimmedFrom && trimmedTo && trimmedFrom === trimmedTo) {
    return trimmedFrom;
  }

  if (!trimmedFrom) return trimmedTo;
  if (!trimmedTo) return trimmedFrom;
  return `${trimmedFrom} → ${trimmedTo}`;
}

function formatRangeButtonLabel(
  label: string,
  kind: "date" | "time",
  from: string,
  to: string,
  emptyLabel?: string,
) {
  const summary = formatRangeLabel(kind, from, to, emptyLabel);
  const defaultEmptyLabel = emptyLabel ?? (kind === "date" ? "Any date" : "now-24h");
  const isEmpty = !from.trim() && !to.trim() && summary === defaultEmptyLabel;

  return isEmpty ? label : `${label}: ${summary}`;
}

function RangeInput({
  inputRef,
  kind,
  value,
  onChange,
  placeholder,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  kind: "date" | "time";
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <input
        ref={inputRef}
        type={kind === "date" ? "date" : "text"}
        className={cn(
          "h-8 w-full rounded-md border border-input bg-background px-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring",
          kind === "date" && "pr-8",
        )}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {kind === "date" && (
        <button
          type="button"
          aria-label="Open date picker"
          className="absolute inset-y-0 right-1 inline-flex items-center text-muted-foreground"
          onClick={() => {
            inputRef.current?.focus();
            inputRef.current?.showPicker?.();
          }}
        >
          <Icon name="codicon:calendar" className="text-sm" />
        </button>
      )}
    </div>
  );
}

function buildDateRangePresets(now = new Date()): FilterBarRangePreset[] {
  const today = formatDateValue(now);
  const yesterday = formatDateValue(addDays(now, -1));
  const last7 = formatDateValue(addDays(now, -6));
  const last30 = formatDateValue(addDays(now, -29));
  const monthStart = formatDateValue(new Date(now.getFullYear(), now.getMonth(), 1));

  return [
    { label: "Today", from: today, to: today },
    { label: "Yesterday", from: yesterday, to: yesterday },
    { label: "Last 7 days", from: last7, to: today },
    { label: "Last 30 days", from: last30, to: today },
    { label: "This month", from: monthStart, to: today },
  ];
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDateValue(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}
