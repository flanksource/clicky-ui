import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { FilterPill, type FilterMode } from "../data/FilterPill";
import { Icon } from "../data/Icon";
import { cn } from "../lib/utils";
import { Button } from "./button";
import { DatePicker } from "./DatePicker";
import { DateTimePicker } from "./DateTimePicker";
import { MultiSelect, type MultiSelectOption } from "./MultiSelect";
import { RangeSlider } from "./RangeSlider";
import { Select } from "./select";

const FILTER_INPUT_DEBOUNCE_MS = 500;

// When `autoSubmit` is false, debounced fields forward their draft value
// immediately (no timer) so the consumer can accumulate state locally and
// fire one request when Apply is clicked. When true (default) fields debounce
// upstream, matching the live-filter behaviour used in trace/log UIs.
const FilterBarContext = createContext<{ autoSubmit: boolean }>({
  autoSubmit: true,
});

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
  description?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export type FilterBarLookupOption = {
  value: string;
  label?: string;
  disabled?: boolean;
  title?: string;
};

export type FilterBarLookupInputType = "text" | "number" | "date";

export type FilterBarLookupFilter = {
  key: string;
  kind: "lookup";
  label: string;
  description?: string;
  value: string;
  options: FilterBarLookupOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  inputType?: FilterBarLookupInputType;
  disabled?: boolean;
  className?: string;
};

export type FilterBarLookupMultiFilter = {
  key: string;
  kind: "lookup-multi";
  label: string;
  description?: string;
  value: string[];
  options: FilterBarLookupOption[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export type FilterBarMultiFilterMode = Extract<FilterMode, "include" | "exclude">;

export type FilterBarMultiFilter = {
  key: string;
  kind: "multi";
  label: string;
  description?: string;
  value: Record<string, FilterBarMultiFilterMode>;
  options: MultiSelectOption[];
  onChange: (value: Record<string, FilterBarMultiFilterMode>) => void;
  disabled?: boolean;
  className?: string;
};

export type FilterBarNestedMultiGroup = {
  groupKey: string;
  label?: string;
  options: MultiSelectOption[];
};

export type FilterBarNestedMultiFilter = {
  key: string;
  kind: "nested-multi";
  label: string;
  description?: string;
  // Same wire shape as FilterBarMultiFilter so consumers can swap kinds
  // without changing their state slot.
  value: Record<string, FilterBarMultiFilterMode>;
  groups: FilterBarNestedMultiGroup[];
  onChange: (value: Record<string, FilterBarMultiFilterMode>) => void;
  disabled?: boolean;
  className?: string;
};

export type FilterBarSelectMultiFilter = {
  key: string;
  kind: "select-multi";
  label: string;
  description?: string;
  value: string[];
  options: MultiSelectOption[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export type FilterBarNumberValue = {
  min?: string;
  max?: string;
};

export type FilterBarNumberFilter = {
  key: string;
  kind: "number";
  label: string;
  description?: string;
  value: FilterBarNumberValue;
  onChange: (value: FilterBarNumberValue) => void;
  domainMin?: number;
  domainMax?: number;
  step?: number;
  formatValue?: (value: number) => string;
  minPlaceholder?: string;
  maxPlaceholder?: string;
  disabled?: boolean;
  className?: string;
};

export type FilterBarEnumFilter = {
  key: string;
  kind: "enum";
  label: string;
  description?: string;
  value: string;
  options: Array<{ value: string; label?: string }>;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export type FilterBarBooleanFilter = {
  key: string;
  kind: "boolean";
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  className?: string;
};

export type FilterBarFilter =
  | FilterBarTextFilter
  | FilterBarLookupFilter
  | FilterBarLookupMultiFilter
  | FilterBarMultiFilter
  | FilterBarNestedMultiFilter
  | FilterBarSelectMultiFilter
  | FilterBarNumberFilter
  | FilterBarEnumFilter
  | FilterBarBooleanFilter;

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
  // When false, debounced fields forward edits immediately (no timer) and
  // an Apply button is rendered in the trailing slot. The caller is expected
  // to accumulate field state and perform the side effect in `onApply`.
  // Defaults to true.
  autoSubmit?: boolean;
  onApply?: () => void;
  applyLabel?: string;
  isPending?: boolean;
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
  autoSubmit = true,
  onApply,
  applyLabel = "Apply",
  isPending = false,
}: FilterBarProps) {
  const hasRangeControls = Boolean(timeRange || dateRange);
  const showApply = !autoSubmit && !!onApply;
  const contextValue = useMemo(() => ({ autoSubmit }), [autoSubmit]);

  return (
    <FilterBarContext.Provider value={contextValue}>
      <div
        className={cn(
          "flex flex-wrap items-center gap-2 rounded-lg border border-input bg-background px-2 py-1.5 shadow-sm",
          className,
        )}
      >
        {leading && <div className="flex items-center gap-2">{leading}</div>}

        {search && <SearchField search={search} />}

        {children}

        {filters?.map((filter, index) => {
          const grow = !search && index === 0;

          if (filter.kind === "lookup") {
            return <LookupFilterField key={filter.key} filter={filter} grow={grow} />;
          }

          if (filter.kind === "lookup-multi") {
            return <LookupMultiFilterField key={filter.key} filter={filter} grow={grow} />;
          }

          if (filter.kind === "multi") {
            return <MultiFilterField key={filter.key} filter={filter} grow={grow} />;
          }

          if (filter.kind === "nested-multi") {
            return <NestedMultiFilterField key={filter.key} filter={filter} grow={grow} />;
          }

          if (filter.kind === "select-multi") {
            return <SelectMultiFilterField key={filter.key} filter={filter} grow={grow} />;
          }

          if (filter.kind === "number") {
            return <NumberFilterField key={filter.key} filter={filter} grow={grow} />;
          }

          if (filter.kind === "enum") {
            return <EnumFilterField key={filter.key} filter={filter} grow={grow} />;
          }

          if (filter.kind === "boolean") {
            return <BooleanFilterField key={filter.key} filter={filter} />;
          }

          return <TextFilterField key={filter.key} filter={filter} grow={grow} />;
        })}

        {(hasRangeControls || trailing || showApply) && (
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {dateRange && <RangeControlButton kind="date" label="Date range" {...dateRange} />}
            {timeRange && <RangeControlButton kind="time" label="Time range" {...timeRange} />}
            {trailing}
            {showApply && (
              <Button
                type="button"
                variant="default"
                size="sm"
                disabled={isPending}
                onClick={onApply}
              >
                {isPending ? "Loading…" : applyLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </FilterBarContext.Provider>
  );
}

type FilterBarFilterPanelChrome = "full" | "embedded";

export function FilterBarFilterPanel({
  filter,
  chrome = "full",
}: {
  filter: FilterBarFilter;
  chrome?: FilterBarFilterPanelChrome;
}) {
  const contextValue = useMemo(() => ({ autoSubmit: true }), []);

  return (
    <FilterBarContext.Provider value={contextValue}>
      {filter.kind === "lookup" && <LookupFilterField filter={filter} grow />}
      {filter.kind === "lookup-multi" && <LookupMultiFilterField filter={filter} grow />}
      {filter.kind === "multi" && <MultiFilterPanel filter={filter} chrome={chrome} />}
      {filter.kind === "nested-multi" && <NestedMultiFilterPanel filter={filter} chrome={chrome} />}
      {filter.kind === "select-multi" && <SelectMultiFilterField filter={filter} grow />}
      {filter.kind === "number" && <NumberFilterPanel filter={filter} chrome={chrome} />}
      {filter.kind === "enum" && <EnumFilterField filter={filter} grow />}
      {filter.kind === "boolean" && <BooleanFilterField filter={filter} />}
      {filter.kind === "text" && <TextFilterField filter={filter} grow />}
    </FilterBarContext.Provider>
  );
}

export function FilterBarRangePanel({
  kind,
  label,
  from = "",
  to = "",
  onApply,
  presets,
  fromPlaceholder,
  toPlaceholder,
  emptyLabel: _emptyLabel,
}: FilterBarRangeProps & { kind: "date" | "time"; label: string }) {
  const fromInputRef = useRef<HTMLInputElement>(null);
  const toInputRef = useRef<HTMLInputElement>(null);
  const [draftFrom, setDraftFrom] = useState(from);
  const [draftTo, setDraftTo] = useState(to);
  const rangePresets = useMemo(
    () => presets ?? (kind === "date" ? buildDateRangePresets() : DEFAULT_TIME_RANGE_PRESETS),
    [kind, presets],
  );

  useEffect(() => {
    setDraftFrom(from);
    setDraftTo(to);
  }, [from, to]);

  function applyRange(nextFrom: string, nextTo: string) {
    onApply(
      kind === "time" ? normalizeDateMath(nextFrom) : nextFrom.trim(),
      kind === "time" ? normalizeDateMath(nextTo) : nextTo.trim(),
    );
  }

  return (
    <div className="w-72 rounded-md border border-border bg-popover text-popover-foreground shadow-sm shadow-black/5">
      {rangePresets.length > 0 && (
        <div className="border-b border-border p-1">
          <div className="px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Quick ranges
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

      <div className="p-3">
        <div className="mb-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-muted-foreground">From</label>
            <RangeInput
              inputRef={fromInputRef}
              kind={kind}
              placeholder={fromPlaceholder ?? (kind === "date" ? "" : "now-24h")}
              value={draftFrom}
              onChange={setDraftFrom}
            />
          </div>
          <div className="flex flex-col gap-1">
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
        <div className="mt-3 flex justify-end">
          <Button
            type="button"
            variant="default"
            size="sm"
            className="h-8 px-3 text-xs"
            onClick={() => applyRange(draftFrom, draftTo)}
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}

function EnumFilterField({ filter, grow }: { filter: FilterBarEnumFilter; grow: boolean }) {
  return (
    <label
      title={filter.description}
      className={cn(
        "flex h-8 items-center gap-2 rounded-md border border-input bg-muted/30 pl-2 pr-1 text-xs",
        grow ? "min-w-[12rem] max-w-[18rem] flex-1" : "min-w-[11rem] max-w-[15rem] shrink-0",
        filter.disabled && "opacity-60",
        filter.className,
      )}
    >
      <span className="whitespace-nowrap font-medium uppercase tracking-wide text-muted-foreground">
        {filter.label}
      </span>
      <Select
        aria-label={filter.label}
        className="h-6 border-0 bg-transparent px-1 text-xs shadow-none focus-visible:ring-0"
        value={filter.value}
        placeholder={filter.placeholder ?? `Any ${filter.label.toLowerCase()}`}
        disabled={filter.disabled}
        onChange={(event) => filter.onChange(event.target.value)}
        options={filter.options.map((option) => ({
          value: option.value,
          label: option.label ?? option.value,
        }))}
      />
    </label>
  );
}

function BooleanFilterField({ filter }: { filter: FilterBarBooleanFilter }) {
  return (
    <label
      title={filter.description}
      className={cn(
        "flex h-8 shrink-0 items-center gap-2 rounded-md border border-input bg-muted/30 px-2 text-xs",
        filter.disabled && "opacity-60",
        filter.className,
      )}
    >
      <input
        type="checkbox"
        aria-label={filter.label}
        className="h-3.5 w-3.5 accent-primary"
        checked={filter.value}
        disabled={filter.disabled}
        onChange={(event) => filter.onChange(event.target.checked)}
      />
      <span className="whitespace-nowrap font-medium uppercase tracking-wide text-muted-foreground">
        {filter.label}
      </span>
    </label>
  );
}

function SearchField({ search }: { search: FilterBarSearchProps }) {
  const [draft, setDraft] = useDebouncedTextDraft(search.value, search.onChange);

  return (
    <div className="flex min-w-[14rem] max-w-[24rem] flex-1 items-center gap-2">
      <label
        className={cn(
          "flex h-8 min-w-0 flex-1 items-center rounded-md border border-input bg-background px-3 text-sm",
          search.className,
        )}
      >
        {draft.trim() ? (
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
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
      </label>
    </div>
  );
}

function TextFilterField({ filter, grow }: { filter: FilterBarTextFilter; grow: boolean }) {
  const [draft, setDraft] = useDebouncedTextDraft(filter.value, filter.onChange);

  return (
    <label
      title={filter.description}
      className={cn(
        "flex h-8 items-center gap-2 rounded-md border border-input bg-muted/30 pl-2 pr-2 text-xs",
        grow ? "min-w-[12rem] max-w-[18rem] flex-1" : "min-w-[11rem] max-w-[15rem] shrink-0",
        filter.disabled && "opacity-60",
        filter.className,
      )}
    >
      <span className="whitespace-nowrap font-medium uppercase tracking-wide text-muted-foreground">
        {filter.label}
      </span>
      <input
        type="text"
        aria-label={filter.label}
        className="w-full min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        placeholder={filter.placeholder ?? "Filter…"}
        value={draft}
        disabled={filter.disabled}
        onChange={(event) => setDraft(event.target.value)}
      />
    </label>
  );
}

function LookupFilterField({ filter, grow }: { filter: FilterBarLookupFilter; grow: boolean }) {
  const [draft, setDraft] = useDebouncedTextDraft(filter.value, filter.onChange);
  const listId = `${filter.key}-lookup-options`;

  return (
    <label
      title={filter.description}
      className={cn(
        "flex h-8 items-center gap-2 rounded-md border border-input bg-muted/30 pl-2 pr-2 text-xs",
        grow ? "min-w-[12rem] max-w-[18rem] flex-1" : "min-w-[11rem] max-w-[15rem] shrink-0",
        filter.disabled && "opacity-60",
        filter.className,
      )}
    >
      <span className="whitespace-nowrap font-medium uppercase tracking-wide text-muted-foreground">
        {filter.label}
      </span>
      {filter.inputType === "date" ? (
        <DateTimePicker
          aria-label={filter.label}
          className="w-full"
          inputClassName="w-full min-w-0 border-0 bg-transparent px-0 pr-6 text-sm text-foreground shadow-none focus-visible:ring-0"
          buttonClassName="right-0"
          placeholder={filter.placeholder ?? "Filter…"}
          value={draft}
          list={listId}
          disabled={filter.disabled}
          onChange={setDraft}
        />
      ) : (
        <input
          type={filter.inputType === "number" ? "number" : "text"}
          aria-label={filter.label}
          className="w-full min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
          placeholder={filter.placeholder ?? "Filter…"}
          value={draft}
          list={listId}
          disabled={filter.disabled}
          onChange={(event) => setDraft(event.target.value)}
        />
      )}
      <datalist id={listId}>
        {filter.options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            label={option.label ?? option.value}
            disabled={option.disabled}
          />
        ))}
      </datalist>
    </label>
  );
}

function LookupMultiFilterField({
  filter,
  grow,
}: {
  filter: FilterBarLookupMultiFilter;
  grow: boolean;
}) {
  const [draft, setDraft] = useDebouncedTextDraft(filter.value.join(", "), (next) =>
    filter.onChange(parseLookupMultiValue(next)),
  );
  const listId = `${filter.key}-lookup-options`;

  return (
    <label
      title={filter.description}
      className={cn(
        "flex h-8 items-center gap-2 rounded-md border border-input bg-muted/30 pl-2 pr-2 text-xs",
        grow ? "min-w-[12rem] max-w-[18rem] flex-1" : "min-w-[11rem] max-w-[15rem] shrink-0",
        filter.disabled && "opacity-60",
        filter.className,
      )}
    >
      <span className="whitespace-nowrap font-medium uppercase tracking-wide text-muted-foreground">
        {filter.label}
      </span>
      <input
        type="text"
        aria-label={filter.label}
        className="w-full min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        placeholder={filter.placeholder ?? "value-1, value-2"}
        value={draft}
        list={listId}
        disabled={filter.disabled}
        onChange={(event) => setDraft(event.target.value)}
      />
      <datalist id={listId}>
        {filter.options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            label={option.label ?? option.value}
            disabled={option.disabled}
          />
        ))}
      </datalist>
    </label>
  );
}

function NumberFilterField({ filter, grow }: { filter: FilterBarNumberFilter; grow: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  useDismissablePopup(open, rootRef, triggerRef, () => setOpen(false));

  const bounds = resolveNumberFilterBounds(filter);
  const [draft, setDraft] = useDebouncedNumberDraft(filter.value, filter.onChange);
  const sliderMin = clampNumber(parseFilterNumber(draft.min) ?? bounds.min, bounds.min, bounds.max);
  const sliderMax = clampNumber(parseFilterNumber(draft.max) ?? bounds.max, bounds.min, bounds.max);
  const activeMin = Math.min(sliderMin, sliderMax);
  const activeMax = Math.max(sliderMin, sliderMax);
  const summary = summarizeNumberFilter(filter, bounds, draft);

  return (
    <div
      ref={rootRef}
      title={filter.description}
      className={cn(
        "relative min-w-0",
        grow ? "min-w-[8rem] max-w-[12rem] flex-1" : "shrink-0",
        filter.disabled && "opacity-60",
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
        disabled={filter.disabled}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "min-w-0 gap-2 font-normal",
          grow ? "w-full max-w-[12rem] justify-between" : "w-auto max-w-[9.5rem] px-2.5",
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
        <div className="absolute left-0 top-[calc(100%+0.375rem)] z-50 min-w-[18rem] max-w-[22rem] rounded-md border border-border bg-popover p-3 text-popover-foreground shadow-lg shadow-black/5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {filter.label}
            </div>
            <button
              type="button"
              className="text-[10px] text-primary disabled:text-muted-foreground"
              onClick={() => {
                setDraft({});
                filter.onChange({});
              }}
              disabled={!String(draft.min ?? "").trim() && !String(draft.max ?? "").trim()}
            >
              Clear all
            </button>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{formatNumberValue(bounds.min, filter)}</span>
                <span>{formatNumberValue(bounds.max, filter)}</span>
              </div>
              <div className="relative h-6">
                <RangeSlider
                  min={bounds.min}
                  max={bounds.max}
                  step={bounds.step}
                  value={[activeMin, activeMax]}
                  ariaLabelMin={`${filter.label} minimum slider`}
                  ariaLabelMax={`${filter.label} maximum slider`}
                  onChange={([nextMin, nextMax]) =>
                    setDraft(numberFilterValueFromSlider([nextMin, nextMax], bounds))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground">Min</label>
                <input
                  type="number"
                  inputMode="decimal"
                  step={bounds.step}
                  aria-label={`${filter.label} minimum`}
                  className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder={filter.minPlaceholder ?? formatNumberValue(bounds.min, filter)}
                  value={draft.min ?? ""}
                  onChange={(event) =>
                    setDraft(
                      normalizeNumberFilterValue(
                        { min: event.target.value, max: draft.max ?? "" },
                        "min-input",
                      ),
                    )
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground">Max</label>
                <input
                  type="number"
                  inputMode="decimal"
                  step={bounds.step}
                  aria-label={`${filter.label} maximum`}
                  className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder={filter.maxPlaceholder ?? formatNumberValue(bounds.max, filter)}
                  value={draft.max ?? ""}
                  onChange={(event) =>
                    setDraft(
                      normalizeNumberFilterValue(
                        { min: draft.min ?? "", max: event.target.value },
                        "max-input",
                      ),
                    )
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NumberFilterPanel({
  filter,
  chrome = "full",
}: {
  filter: FilterBarNumberFilter;
  chrome?: FilterBarFilterPanelChrome;
}) {
  const bounds = resolveNumberFilterBounds(filter);
  const [draft, setDraft] = useDebouncedNumberDraft(filter.value, filter.onChange);
  const sliderMin = clampNumber(parseFilterNumber(draft.min) ?? bounds.min, bounds.min, bounds.max);
  const sliderMax = clampNumber(parseFilterNumber(draft.max) ?? bounds.max, bounds.min, bounds.max);
  const activeMin = Math.min(sliderMin, sliderMax);
  const activeMax = Math.max(sliderMin, sliderMax);
  const embedded = chrome === "embedded";

  return (
    <div
      data-filter-panel-chrome={chrome}
      className={cn(
        "min-w-[18rem] max-w-[22rem] text-popover-foreground",
        embedded
          ? "p-0"
          : "rounded-md border border-border bg-popover p-3 shadow-sm shadow-black/5",
      )}
    >
      {!embedded && (
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {filter.label}
          </div>
          <button
            type="button"
            className="text-[10px] text-primary disabled:text-muted-foreground"
            onClick={() => {
              setDraft({});
              filter.onChange({});
            }}
            disabled={!String(draft.min ?? "").trim() && !String(draft.max ?? "").trim()}
          >
            Clear all
          </button>
        </div>
      )}

      <div className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{formatNumberValue(bounds.min, filter)}</span>
            <span>{formatNumberValue(bounds.max, filter)}</span>
          </div>
          <div className="relative h-6">
            <RangeSlider
              min={bounds.min}
              max={bounds.max}
              step={bounds.step}
              value={[activeMin, activeMax]}
              ariaLabelMin={`${filter.label} minimum slider`}
              ariaLabelMax={`${filter.label} maximum slider`}
              onChange={([nextMin, nextMax]) =>
                setDraft(numberFilterValueFromSlider([nextMin, nextMax], bounds))
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground">Min</label>
            <input
              type="number"
              inputMode="decimal"
              step={bounds.step}
              aria-label={`${filter.label} minimum`}
              className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder={filter.minPlaceholder ?? formatNumberValue(bounds.min, filter)}
              value={draft.min ?? ""}
              onChange={(event) =>
                setDraft(
                  normalizeNumberFilterValue(
                    { min: event.target.value, max: draft.max ?? "" },
                    "min-input",
                  ),
                )
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground">Max</label>
            <input
              type="number"
              inputMode="decimal"
              step={bounds.step}
              aria-label={`${filter.label} maximum`}
              className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder={filter.maxPlaceholder ?? formatNumberValue(bounds.max, filter)}
              value={draft.max ?? ""}
              onChange={(event) =>
                setDraft(
                  normalizeNumberFilterValue(
                    { min: draft.min ?? "", max: event.target.value },
                    "max-input",
                  ),
                )
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MultiFilterField({ filter, grow }: { filter: FilterBarMultiFilter; grow: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [optionQuery, setOptionQuery] = useState("");
  const [draft, setDraft] = useDebouncedMultiDraft(filter.value, filter.onChange);

  useDismissablePopup(open, rootRef, triggerRef, () => setOpen(false));

  const summary = summarizeMultiFilter(filter.label, draft);
  const showOptionFilter = filter.options.length > 7;
  const visibleOptions = useMemo(() => {
    const query = optionQuery.trim().toLowerCase();
    if (!query) return filter.options;
    return filter.options.filter((option) =>
      multiSelectOptionText(option).toLowerCase().includes(query),
    );
  }, [filter.options, optionQuery]);

  return (
    <div
      ref={rootRef}
      title={filter.description}
      className={cn(
        "relative min-w-0",
        grow ? "min-w-[8rem] max-w-[12rem] flex-1" : "shrink-0",
        filter.disabled && "opacity-60",
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
        disabled={filter.disabled}
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
              onClick={() => setDraft({})}
              disabled={Object.keys(draft).length === 0}
            >
              Clear all
            </button>
          </div>

          {showOptionFilter && (
            <div className="mb-2 flex items-center gap-2 rounded-md border border-input bg-background px-2">
              <Icon name="codicon:search" className="shrink-0 text-muted-foreground" />
              <input
                type="search"
                aria-label={`Filter ${filter.label} options`}
                className="h-8 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                placeholder={`Filter ${filter.label.toLowerCase()}`}
                value={optionQuery}
                onChange={(event) => setOptionQuery(event.target.value)}
              />
            </div>
          )}

          <div className="max-h-72 space-y-0.5 overflow-auto">
            {visibleOptions.map((option) => {
              const mode = draft[option.value] ?? "neutral";
              const title = option.title ?? multiSelectOptionText(option);

              return (
                <div
                  key={option.value}
                  role="button"
                  tabIndex={0}
                  data-filter-option={option.value}
                  className="rounded-md px-1.5 py-0.5 hover:bg-accent/50 focus-visible:bg-accent/50 focus-visible:outline-none"
                  onClick={() =>
                    setDraft(updateMultiFilterValue(draft, option.value, nextFilterMode(mode)))
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setDraft(updateMultiFilterValue(draft, option.value, nextFilterMode(mode)));
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
                      setDraft(updateMultiFilterValue(draft, option.value, next))
                    }
                  />
                </div>
              );
            })}
            {visibleOptions.length === 0 && (
              <div className="px-2 py-3 text-sm text-muted-foreground">No options found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MultiFilterPanel({
  filter,
  chrome = "full",
}: {
  filter: FilterBarMultiFilter;
  chrome?: FilterBarFilterPanelChrome;
}) {
  const [optionQuery, setOptionQuery] = useState("");
  const [draft, setDraft] = useDebouncedMultiDraft(filter.value, filter.onChange);
  const showOptionFilter = filter.options.length > 7;
  const embedded = chrome === "embedded";
  const visibleOptions = useMemo(() => {
    const query = optionQuery.trim().toLowerCase();
    if (!query) return filter.options;
    return filter.options.filter((option) =>
      multiSelectOptionText(option).toLowerCase().includes(query),
    );
  }, [filter.options, optionQuery]);

  return (
    <div
      data-filter-panel-chrome={chrome}
      className={cn(
        "min-w-[18rem] max-w-[22rem] text-popover-foreground",
        embedded
          ? "p-0"
          : "rounded-md border border-border bg-popover p-2 shadow-sm shadow-black/5",
      )}
    >
      {!embedded && (
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {filter.label}
          </div>
          <button
            type="button"
            className="text-[10px] text-primary disabled:text-muted-foreground"
            onClick={() => setDraft({})}
            disabled={Object.keys(draft).length === 0}
          >
            Clear all
          </button>
        </div>
      )}

      {showOptionFilter && (
        <div className="mb-2 flex items-center gap-2 rounded-md border border-input bg-background px-2">
          <Icon name="codicon:search" className="shrink-0 text-muted-foreground" />
          <input
            type="search"
            aria-label={`Filter ${filter.label} options`}
            className="h-8 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder={`Filter ${filter.label.toLowerCase()}`}
            value={optionQuery}
            onChange={(event) => setOptionQuery(event.target.value)}
          />
        </div>
      )}

      <div className="max-h-72 space-y-0.5 overflow-auto">
        {visibleOptions.map((option) => {
          const mode = draft[option.value] ?? "neutral";
          const title = option.title ?? multiSelectOptionText(option);

          return (
            <div
              key={option.value}
              role="button"
              tabIndex={0}
              data-filter-option={option.value}
              className="rounded-md px-1.5 py-0.5 hover:bg-accent/50 focus-visible:bg-accent/50 focus-visible:outline-none"
              onClick={() =>
                setDraft(updateMultiFilterValue(draft, option.value, nextFilterMode(mode)))
              }
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setDraft(updateMultiFilterValue(draft, option.value, nextFilterMode(mode)));
                }
              }}
            >
              <FilterPill
                className="w-full justify-between"
                label={option.label}
                mode={mode}
                title={title}
                togglePosition="right"
                onModeChange={(next) => setDraft(updateMultiFilterValue(draft, option.value, next))}
              />
            </div>
          );
        })}
        {visibleOptions.length === 0 && (
          <div className="px-2 py-3 text-sm text-muted-foreground">No options found</div>
        )}
      </div>
    </div>
  );
}

function NestedMultiFilterPanel({
  filter,
  chrome = "full",
}: {
  filter: FilterBarNestedMultiFilter;
  chrome?: FilterBarFilterPanelChrome;
}) {
  const [activeGroup, setActiveGroup] = useState<string | null>(filter.groups[0]?.groupKey ?? null);
  const [draft, setDraft] = useDebouncedMultiDraft(filter.value, filter.onChange);
  const groups = filter.groups;
  const embedded = chrome === "embedded";
  const activeGroupData = useMemo(
    () => groups.find((group) => group.groupKey === activeGroup) ?? groups[0] ?? null,
    [groups, activeGroup],
  );

  const selectedByGroup = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const group of groups) {
      let n = 0;
      for (const option of group.options) {
        if (draft[option.value]) n += 1;
      }
      counts[group.groupKey] = n;
    }
    return counts;
  }, [groups, draft]);

  const sortedGroups = useMemo(() => {
    const selected: typeof groups = [];
    const rest: typeof groups = [];
    for (const group of groups) {
      if ((selectedByGroup[group.groupKey] ?? 0) > 0) selected.push(group);
      else rest.push(group);
    }
    return [...selected, ...rest];
  }, [groups, selectedByGroup]);

  const clearGroup = (groupKey: string) => {
    const group = groups.find((g) => g.groupKey === groupKey);
    if (!group) return;
    const next = { ...draft };
    for (const option of group.options) {
      delete next[option.value];
    }
    setDraft(next);
  };

  return (
    <div role="dialog" className="flex">
      <div
        data-filter-panel-chrome={chrome}
        className={cn(
          "min-w-[14rem] max-w-[16rem] text-popover-foreground",
          embedded
            ? "p-0"
            : "rounded-md border border-border bg-popover p-2 shadow-sm shadow-black/5",
        )}
      >
        {!embedded && (
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {filter.label}
            </div>
            <button
              type="button"
              className="text-[10px] text-primary disabled:text-muted-foreground"
              onClick={() => setDraft({})}
              disabled={Object.keys(draft).length === 0}
            >
              Clear all
            </button>
          </div>
        )}

        <div className="max-h-72 space-y-0.5 overflow-auto">
          {sortedGroups.map((group) => {
            const selected = selectedByGroup[group.groupKey] ?? 0;
            const isActive = group.groupKey === activeGroup;
            return (
              <div
                key={group.groupKey}
                role="button"
                tabIndex={0}
                onMouseEnter={() => setActiveGroup(group.groupKey)}
                onFocus={() => setActiveGroup(group.groupKey)}
                onClick={() => setActiveGroup(group.groupKey)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " " || event.key === "ArrowRight") {
                    event.preventDefault();
                    setActiveGroup(group.groupKey);
                  }
                }}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-2 rounded-md px-1.5 py-0.5 text-sm",
                  "hover:bg-accent/50 focus-visible:bg-accent/50 focus-visible:outline-none",
                  isActive && "bg-accent/60",
                )}
              >
                <span className="min-w-0 flex-1 truncate">{group.label ?? group.groupKey}</span>
                {selected > 0 && (
                  <span className="rounded-full bg-primary/15 px-1.5 text-[10px] font-medium text-primary">
                    {selected}/{group.options.length}
                  </span>
                )}
                <Icon name="codicon:chevron-right" className="shrink-0 text-muted-foreground" />
              </div>
            );
          })}
          {groups.length === 0 && (
            <div className="px-2 py-3 text-sm text-muted-foreground">No groups</div>
          )}
        </div>
      </div>

      {activeGroupData && (
        <div
          onMouseEnter={() => setActiveGroup(activeGroupData.groupKey)}
          className="ml-1.5 min-w-[16rem] max-w-[20rem] rounded-md border border-border bg-popover p-2 text-popover-foreground shadow-sm shadow-black/5"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {activeGroupData.label ?? activeGroupData.groupKey}
            </div>
            <button
              type="button"
              className="text-[10px] text-primary disabled:text-muted-foreground"
              onClick={() => clearGroup(activeGroupData.groupKey)}
              disabled={(selectedByGroup[activeGroupData.groupKey] ?? 0) === 0}
            >
              Clear
            </button>
          </div>

          <div className="max-h-72 space-y-0.5 overflow-auto">
            {activeGroupData.options.map((option) => {
              const mode = draft[option.value] ?? "neutral";
              const title = option.title ?? multiSelectOptionText(option);
              return (
                <div
                  key={option.value}
                  role="button"
                  tabIndex={0}
                  data-filter-option={option.value}
                  className="rounded-md px-1.5 py-0.5 hover:bg-accent/50 focus-visible:bg-accent/50 focus-visible:outline-none"
                  onClick={() =>
                    setDraft(updateMultiFilterValue(draft, option.value, nextFilterMode(mode)))
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setDraft(updateMultiFilterValue(draft, option.value, nextFilterMode(mode)));
                    } else if (event.key === "ArrowLeft") {
                      event.preventDefault();
                      setActiveGroup(null);
                    }
                  }}
                >
                  <FilterPill
                    className="w-full justify-between"
                    label={renderNestedOptionLabel(option, activeGroupData.groupKey)}
                    mode={mode}
                    title={title}
                    togglePosition="right"
                    onModeChange={(next) =>
                      setDraft(updateMultiFilterValue(draft, option.value, next))
                    }
                  />
                </div>
              );
            })}
            {activeGroupData.options.length === 0 && (
              <div className="px-2 py-3 text-sm text-muted-foreground">No values</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function multiSelectOptionText(option: MultiSelectOption) {
  const label = typeof option.label === "string" ? option.label : "";
  return [option.value, label, option.title ?? ""].filter(Boolean).join(" ");
}

function NestedMultiFilterField({
  filter,
  grow,
}: {
  filter: FilterBarNestedMultiFilter;
  grow: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [draft, setDraft] = useDebouncedMultiDraft(filter.value, filter.onChange);

  useDismissablePopup(open, rootRef, triggerRef, () => {
    setOpen(false);
    setActiveGroup(null);
  });

  const summary = summarizeMultiFilter(filter.label, draft);
  const groups = filter.groups;
  const activeGroupData = useMemo(
    () => groups.find((group) => group.groupKey === activeGroup) ?? null,
    [groups, activeGroup],
  );

  // Selected count per group, used in the outer list.
  const selectedByGroup = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const group of groups) {
      let n = 0;
      for (const option of group.options) {
        if (draft[option.value]) n += 1;
      }
      counts[group.groupKey] = n;
    }
    return counts;
  }, [groups, draft]);

  // Groups with active selections sort to the top so the user always sees
  // what's filtered without scrolling. Within each partition, the original
  // order from the consumer is preserved.
  const sortedGroups = useMemo(() => {
    const selected: typeof groups = [];
    const rest: typeof groups = [];
    for (const group of groups) {
      if ((selectedByGroup[group.groupKey] ?? 0) > 0) selected.push(group);
      else rest.push(group);
    }
    return [...selected, ...rest];
  }, [groups, selectedByGroup]);

  const clearGroup = (groupKey: string) => {
    const group = groups.find((g) => g.groupKey === groupKey);
    if (!group) return;
    const next = { ...draft };
    for (const option of group.options) {
      delete next[option.value];
    }
    setDraft(next);
  };

  return (
    <div
      ref={rootRef}
      title={filter.description}
      className={cn(
        "relative min-w-0",
        grow ? "min-w-[8rem] max-w-[12rem] flex-1" : "shrink-0",
        filter.disabled && "opacity-60",
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
        disabled={filter.disabled}
        onClick={() => {
          setOpen((current) => !current);
          if (open) setActiveGroup(null);
        }}
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
        <div
          role="dialog"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              setOpen(false);
              setActiveGroup(null);
            }
          }}
          className="absolute left-0 top-[calc(100%+0.375rem)] z-50 flex"
        >
          <div className="min-w-[14rem] max-w-[16rem] rounded-md border border-border bg-popover p-2 text-popover-foreground shadow-lg shadow-black/5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {filter.label}
              </div>
              <button
                type="button"
                className="text-[10px] text-primary disabled:text-muted-foreground"
                onClick={() => setDraft({})}
                disabled={Object.keys(draft).length === 0}
              >
                Clear all
              </button>
            </div>

            <div className="max-h-72 space-y-0.5 overflow-auto">
              {sortedGroups.map((group) => {
                const selected = selectedByGroup[group.groupKey] ?? 0;
                const isActive = group.groupKey === activeGroup;
                return (
                  <div
                    key={group.groupKey}
                    role="button"
                    tabIndex={0}
                    onMouseEnter={() => setActiveGroup(group.groupKey)}
                    onFocus={() => setActiveGroup(group.groupKey)}
                    onClick={() => setActiveGroup(group.groupKey)}
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" ||
                        event.key === " " ||
                        event.key === "ArrowRight"
                      ) {
                        event.preventDefault();
                        setActiveGroup(group.groupKey);
                      }
                    }}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-2 rounded-md px-1.5 py-0.5 text-sm",
                      "hover:bg-accent/50 focus-visible:bg-accent/50 focus-visible:outline-none",
                      isActive && "bg-accent/60",
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate">{group.label ?? group.groupKey}</span>
                    {selected > 0 && (
                      <span className="rounded-full bg-primary/15 px-1.5 text-[10px] font-medium text-primary">
                        {selected}/{group.options.length}
                      </span>
                    )}
                    <Icon name="codicon:chevron-right" className="shrink-0 text-muted-foreground" />
                  </div>
                );
              })}
              {groups.length === 0 && (
                <div className="px-2 py-3 text-sm text-muted-foreground">No groups</div>
              )}
            </div>
          </div>

          {activeGroupData && (
            <div
              onMouseEnter={() => setActiveGroup(activeGroupData.groupKey)}
              className="ml-1.5 min-w-[16rem] max-w-[20rem] rounded-md border border-border bg-popover p-2 text-popover-foreground shadow-lg shadow-black/5"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {activeGroupData.label ?? activeGroupData.groupKey}
                </div>
                <button
                  type="button"
                  className="text-[10px] text-primary disabled:text-muted-foreground"
                  onClick={() => clearGroup(activeGroupData.groupKey)}
                  disabled={(selectedByGroup[activeGroupData.groupKey] ?? 0) === 0}
                >
                  Clear
                </button>
              </div>

              <div className="max-h-72 space-y-0.5 overflow-auto">
                {activeGroupData.options.map((option) => {
                  const mode = draft[option.value] ?? "neutral";
                  const title = option.title ?? multiSelectOptionText(option);
                  return (
                    <div
                      key={option.value}
                      role="button"
                      tabIndex={0}
                      data-filter-option={option.value}
                      className="rounded-md px-1.5 py-0.5 hover:bg-accent/50 focus-visible:bg-accent/50 focus-visible:outline-none"
                      onClick={() =>
                        setDraft(updateMultiFilterValue(draft, option.value, nextFilterMode(mode)))
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setDraft(
                            updateMultiFilterValue(draft, option.value, nextFilterMode(mode)),
                          );
                        } else if (event.key === "ArrowLeft") {
                          event.preventDefault();
                          setActiveGroup(null);
                        }
                      }}
                    >
                      <FilterPill
                        className="w-full justify-between"
                        // Show only the value side here — the key is already
                        // implied by the parent group panel.
                        label={renderNestedOptionLabel(option, activeGroupData.groupKey)}
                        mode={mode}
                        title={title}
                        togglePosition="right"
                        onModeChange={(next) =>
                          setDraft(updateMultiFilterValue(draft, option.value, next))
                        }
                      />
                    </div>
                  );
                })}
                {activeGroupData.options.length === 0 && (
                  <div className="px-2 py-3 text-sm text-muted-foreground">No values</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function renderNestedOptionLabel(option: MultiSelectOption, groupKey: string): ReactNode {
  // If the option label already strips the key prefix, use it. Otherwise
  // strip it here so the inner panel doesn't repeat the key on every row.
  if (typeof option.label === "string") {
    const prefix = `${groupKey}=`;
    if (option.label.startsWith(prefix)) return option.label.slice(prefix.length);
    return option.label;
  }
  return option.label ?? option.value;
}

function SelectMultiFilterField({
  filter,
  grow,
}: {
  filter: FilterBarSelectMultiFilter;
  grow: boolean;
}) {
  return (
    <label
      title={filter.description}
      className={cn(
        "flex h-8 items-center gap-2 rounded-md border border-input bg-muted/30 pl-2 pr-1 text-xs",
        grow ? "min-w-[12rem] max-w-[18rem] flex-1" : "min-w-[11rem] max-w-[15rem] shrink-0",
        filter.disabled && "opacity-60",
        filter.className,
      )}
    >
      <span className="whitespace-nowrap font-medium uppercase tracking-wide text-muted-foreground">
        {filter.label}
      </span>
      <MultiSelect
        options={filter.options}
        value={filter.value}
        onChange={filter.onChange}
        placeholder={filter.placeholder ?? `Any ${filter.label.toLowerCase()}`}
        {...(filter.disabled !== undefined ? { disabled: filter.disabled } : {})}
        triggerClassName="h-6 min-w-0 border-0 bg-transparent px-1 text-xs shadow-none focus-visible:ring-0"
        menuClassName="left-auto right-0"
      />
    </label>
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

  const buttonLabel = formatRangeLabel(kind, from, to, emptyLabel);

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
        className="h-7 w-fit max-w-[11rem] min-w-0 gap-2 px-2 text-xs font-normal"
      >
        <Icon name="codicon:calendar" className="text-muted-foreground text-[14px]" />
        <span className="truncate font-normal tabular-nums">{buttonLabel}</span>
      </Button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+0.375rem)] z-50 w-72 rounded-md border border-border bg-popover text-popover-foreground shadow-md shadow-black/5 outline-none">
          {rangePresets.length > 0 && (
            <div className="border-b border-border p-1">
              <div className="px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Quick ranges
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

          <div className="p-3">
            <div className="mb-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Custom range
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-muted-foreground">From</label>
                <RangeInput
                  inputRef={fromInputRef}
                  kind={kind}
                  placeholder={fromPlaceholder ?? (kind === "date" ? "" : "now-24h")}
                  value={draftFrom}
                  onChange={setDraftFrom}
                />
              </div>
              <div className="flex flex-col gap-1">
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
            <div className="mt-3 flex justify-end">
              <Button
                type="button"
                variant="default"
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

function parseLookupMultiValue(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function useDebouncedMultiDraft(
  value: Record<string, FilterBarMultiFilterMode>,
  onChange: (value: Record<string, FilterBarMultiFilterMode>) => void,
) {
  const { autoSubmit } = useContext(FilterBarContext);
  const [draft, setDraft] = useState(value);
  const latestOnChange = useRef(onChange);

  useEffect(() => {
    latestOnChange.current = onChange;
  }, [onChange]);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (sameMultiFilterValue(draft, value)) return;

    if (!autoSubmit) {
      latestOnChange.current(draft);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      latestOnChange.current(draft);
    }, FILTER_INPUT_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [autoSubmit, draft, value]);

  return [draft, setDraft] as const;
}

function sameMultiFilterValue(
  a: Record<string, FilterBarMultiFilterMode>,
  b: Record<string, FilterBarMultiFilterMode>,
) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

function useDebouncedTextDraft(value: string, onChange: (value: string) => void) {
  const { autoSubmit } = useContext(FilterBarContext);
  const [draft, setDraft] = useState(value);
  const latestOnChange = useRef(onChange);

  useEffect(() => {
    latestOnChange.current = onChange;
  }, [onChange]);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (draft === value) return;

    if (!autoSubmit) {
      latestOnChange.current(draft);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      latestOnChange.current(draft);
    }, FILTER_INPUT_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [autoSubmit, draft, value]);

  return [draft, setDraft] as const;
}

function useDebouncedNumberDraft(
  value: FilterBarNumberValue,
  onChange: (value: FilterBarNumberValue) => void,
) {
  const { autoSubmit } = useContext(FilterBarContext);
  const [draft, setDraft] = useState(value);
  const latestOnChange = useRef(onChange);

  useEffect(() => {
    latestOnChange.current = onChange;
  }, [onChange]);

  useEffect(() => {
    setDraft(value);
  }, [value.max, value.min]);

  useEffect(() => {
    if (sameNumberFilterValue(draft, value)) return;

    if (!autoSubmit) {
      latestOnChange.current(draft);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      latestOnChange.current(draft);
    }, FILTER_INPUT_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [autoSubmit, draft, value]);

  return [draft, setDraft] as const;
}

function sameNumberFilterValue(left: FilterBarNumberValue, right: FilterBarNumberValue) {
  return (left.min ?? "") === (right.min ?? "") && (left.max ?? "") === (right.max ?? "");
}

type NumberFilterBounds = {
  min: number;
  max: number;
  step: number;
};

type NumberFilterSource = "min-input" | "max-input";

function resolveNumberFilterBounds(filter: FilterBarNumberFilter): NumberFilterBounds {
  const parsedMin = parseFilterNumber(filter.value.min);
  const parsedMax = parseFilterNumber(filter.value.max);
  const fallbackMin = parsedMin ?? 0;
  const fallbackMax = parsedMax ?? Math.max(fallbackMin + 100, 100);
  const min = filter.domainMin ?? Math.min(fallbackMin, fallbackMax);
  const max = filter.domainMax ?? Math.max(fallbackMax, min + 100);
  const step = filter.step && filter.step > 0 ? filter.step : 1;

  return {
    min,
    max: max <= min ? min + step : max,
    step,
  };
}

function summarizeNumberFilter(
  filter: FilterBarNumberFilter,
  bounds: NumberFilterBounds,
  value: FilterBarNumberValue,
) {
  const parsedMin = parseFilterNumber(value.min);
  const parsedMax = parseFilterNumber(value.max);
  const hasMin = String(value.min ?? "").trim() !== "";
  const hasMax = String(value.max ?? "").trim() !== "";

  if (!hasMin && !hasMax) {
    return filter.label;
  }

  const minLabel =
    parsedMin == null
      ? formatNumberValue(bounds.min, filter)
      : formatNumberValue(parsedMin, filter);
  const maxLabel =
    parsedMax == null
      ? formatNumberValue(bounds.max, filter)
      : formatNumberValue(parsedMax, filter);

  if (hasMin && hasMax) {
    if (minLabel === maxLabel) {
      return `${filter.label} ${minLabel}`;
    }
    return `${filter.label} ${minLabel}-${maxLabel}`;
  }

  if (hasMin) {
    return `${filter.label} >=${minLabel}`;
  }

  return `${filter.label} <=${maxLabel}`;
}

function normalizeNumberFilterValue(
  nextValue: FilterBarNumberValue,
  source: NumberFilterSource,
): FilterBarNumberValue {
  let min = nextValue.min ?? "";
  let max = nextValue.max ?? "";

  const parsedMin = parseFilterNumber(min);
  const parsedMax = parseFilterNumber(max);

  if (parsedMin != null && parsedMax != null && parsedMin > parsedMax) {
    if (source.startsWith("min")) {
      max = min;
    } else {
      min = max;
    }
  }

  return { min, max };
}

function numberFilterValueFromSlider(
  value: [number, number],
  bounds: NumberFilterBounds,
): FilterBarNumberValue {
  const [min, max] = value;
  return {
    min: min <= bounds.min ? "" : formatRawNumber(clampNumber(min, bounds.min, bounds.max)),
    max: max >= bounds.max ? "" : formatRawNumber(clampNumber(max, bounds.min, bounds.max)),
  };
}

function parseFilterNumber(value: string | undefined) {
  if (!value?.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatNumberValue(value: number, filter: FilterBarNumberFilter) {
  if (filter.formatValue) {
    return filter.formatValue(value);
  }

  return formatRawNumber(value);
}

function formatRawNumber(value: number) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(6)));
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
  if (kind === "date") {
    return (
      <DatePicker
        ref={inputRef as RefObject<HTMLInputElement>}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        inputClassName="pr-8"
      />
    );
  }

  return (
    <DateTimePicker
      ref={inputRef as RefObject<HTMLInputElement>}
      inputClassName="pr-8"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
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
