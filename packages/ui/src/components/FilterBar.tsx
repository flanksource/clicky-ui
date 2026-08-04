import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type Ref,
  type RefObject,
} from "react";
import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingPortal,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useMergeRefs,
  useRole,
  type Placement,
} from "@floating-ui/react";
import { FilterPill } from "../data/FilterPill";
import { FILTER_INPUT_DEBOUNCE_MS, FilterBarContext } from "./filter-bar-context";
import {
  comboboxLabelProps,
  lookupFieldWidthClass,
  multiSelectOptionText,
  nextFilterMode,
  sizedIcon,
  summarizeMultiFilter,
  updateMultiFilterValue,
  useDebouncedMultiDraft,
  type FilterBarMultiFilterMode,
} from "./filter-bar-field-utils";
import {
  MultiFilterField,
  MultiFilterPanel,
  type FilterBarMultiFilter,
} from "./filter-bar-multi";
import { clearFilterBarFilter, isFilterBarFilterActive } from "./filter-bar-utils";

export { TriStateMultiSelect, type TriStateMultiSelectProps } from "./filter-bar-multi";
export type { FilterBarMultiFilter, FilterBarMultiFilterMode };
import { Icon, LabelIcon, type LabelIconSpec } from "../data/Icon";
import { formatDateTimeRelative } from "../data/cells/timestamp-format";
import { UiChevronDown, UiChevronRight, UiChevronUp, UiClose, UiFilter, UiSearch } from "../icons";
import { cn } from "../lib/utils";
import { useEscapeLayer, useFloatingZIndex } from "../overlay/modalStack";
import { Button } from "./button";
import { Combobox, type ComboboxOption } from "./Combobox";
import { DateTimePicker } from "./DateTimePicker";
import { MultiSelect, type MultiSelectOption } from "./MultiSelect";
import { RangeSlider } from "./RangeSlider";
import { TimeRange, type TimeRangePresetGroup } from "./TimeRange";
import { TriStateToggle, type TriState, type TriStateLabels } from "./TriStateToggle";

const FILTER_BAR_GAP_PX = 8;
const FILTER_BAR_OVERFLOW_TRIGGER_ESTIMATE_PX = 44;

export type FilterBarSearchProps = {
  /** Controlled search text. */
  value: string;
  /** Called with the next search text. Debounced when `autoSubmit` is true. */
  onChange: (value: string) => void;
  /** Placeholder shown in the search input. */
  placeholder?: string;
  /** Accessible label for the search input. */
  ariaLabel?: string;
  /** Classes applied to the search input. */
  className?: string;
};

export type FilterBarTextFilter = {
  /** Stable filter key used for rendering and overflow measurement. */
  key: string;
  /** Renders a free-text input. */
  kind: "text";
  /** Filter label shown on the control. */
  label: string;
  /** Leading glyph shown before the label: a runtime icon name or a node. */
  icon?: LabelIconSpec;
  /** Optional helper text shown in filter popovers. */
  description?: string;
  /** Controlled input value. */
  value: string;
  /** Called with the next input value. */
  onChange: (value: string) => void;
  /** Placeholder shown in the input. */
  placeholder?: string;
  /** Disables this filter. */
  disabled?: boolean;
  /** Classes applied to this filter control. */
  className?: string;
};

export type FilterBarLookupOption = {
  /** Option value written to filter state. */
  value: string;
  /** Optional display label; falls back to `value`. */
  label?: string;
  /** Prevents choosing the option. */
  disabled?: boolean;
  /** Optional browser tooltip. */
  title?: string;
};

export type FilterBarLookupInputType = "text" | "number" | "date";

export type FilterBarLookupFilter = {
  key: string;
  /** Renders an input backed by a datalist-style option set. */
  kind: "lookup";
  label: string;
  /** Leading glyph shown before the label: a runtime icon name or a node. */
  icon?: LabelIconSpec;
  description?: string;
  /** Controlled selected or typed value. */
  value: string;
  /** Suggestions for the lookup input. */
  options: FilterBarLookupOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  /** Native input type for the lookup field. */
  inputType?: FilterBarLookupInputType;
  disabled?: boolean;
  className?: string;
};

export type FilterBarLookupMultiFilter = {
  key: string;
  /** Renders a multi-value lookup filter. */
  kind: "lookup-multi";
  label: string;
  /** Leading glyph shown before the label: a runtime icon name or a node. */
  icon?: LabelIconSpec;
  description?: string;
  /** Controlled selected values. */
  value: string[];
  /** Suggestions for the lookup input. */
  options: FilterBarLookupOption[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  /**
   * Optional async search invoked (debounced) as the user types; the consumer
   * fetches matching options and feeds them back via `options`. When set, the
   * typeahead is server-driven (results replace the list); when absent it
   * filters the static `options` client-side.
   */
  onSearch?: (query: string) => void;
  /** Shows a loading indicator while a search is in flight. */
  loading?: boolean;
  /** True when `options` is a capped head of a larger server-side result set. */
  truncated?: boolean;
  /** Total distinct option count behind a truncated result set. */
  total?: number;
  disabled?: boolean;
  className?: string;
};

export type FilterBarNestedMultiGroup = {
  /** Stable group id. */
  groupKey: string;
  /** Optional visible group label. */
  label?: string;
  /** Options in this group. */
  options: MultiSelectOption[];
};

export type FilterBarNestedMultiFilter = {
  key: string;
  /** Renders grouped include/exclude chips. */
  kind: "nested-multi";
  label: string;
  /** Leading glyph shown before the label: a runtime icon name or a node. */
  icon?: LabelIconSpec;
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
  /** Renders a compact multi-select dropdown. */
  kind: "select-multi";
  label: string;
  /** Leading glyph shown before the label: a runtime icon name or a node. */
  icon?: LabelIconSpec;
  description?: string;
  /** Controlled selected values. */
  value: string[];
  /** Available dropdown options. */
  options: MultiSelectOption[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export type FilterBarNumberValue = {
  /** Minimum bound as a string so callers can preserve draft input. */
  min?: string;
  /** Maximum bound as a string so callers can preserve draft input. */
  max?: string;
};

export type FilterBarNumberFilter = {
  key: string;
  /** Renders paired min/max numeric controls. */
  kind: "number";
  label: string;
  /** Leading glyph shown before the label: a runtime icon name or a node. */
  icon?: LabelIconSpec;
  description?: string;
  /** Controlled min/max value. */
  value: FilterBarNumberValue;
  onChange: (value: FilterBarNumberValue) => void;
  /** Lower bound used by the optional range slider. */
  domainMin?: number;
  /** Upper bound used by the optional range slider. */
  domainMax?: number;
  /** Step size for number inputs and slider movement. */
  step?: number;
  /** Formatter used for slider labels. */
  formatValue?: (value: number) => string;
  minPlaceholder?: string;
  maxPlaceholder?: string;
  disabled?: boolean;
  className?: string;
};

export type FilterBarEnumFilter = {
  key: string;
  /** Renders a single-select dropdown. */
  kind: "enum";
  label: string;
  /** Leading glyph shown before the label: a runtime icon name or a node. */
  icon?: LabelIconSpec;
  description?: string;
  /** Controlled selected value. */
  value: string;
  /** Available enum options. */
  options: Array<{ value: string; label?: string }>;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export type FilterBarBooleanFilter = {
  key: string;
  /** Renders a boolean toggle. */
  kind: "boolean";
  label: string;
  /** Leading glyph shown before the label: a runtime icon name or a node. */
  icon?: LabelIconSpec;
  description?: string;
  /** Controlled checked state. */
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  className?: string;
};

export type FilterBarTriStateFilter = {
  key: string;
  /** Renders a yes/no/any toggle for a nullable boolean field. */
  kind: "tristate";
  label: string;
  /** Leading glyph shown before the label: a runtime icon name or a node. */
  icon?: LabelIconSpec;
  description?: string;
  /** Controlled state; undefined means the filter is off. */
  value: TriState;
  onChange: (value: TriState) => void;
  /** Per-state wording, e.g. { on: "Deductible", off: "Not deductible" }. */
  labels?: TriStateLabels;
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
  | FilterBarBooleanFilter
  | FilterBarTriStateFilter;

export type FilterBarRangePreset = {
  /** Visible preset label. */
  label: string;
  /** Start value applied by the preset. */
  from: string;
  /** End value applied by the preset. */
  to: string;
};

export type FilterBarRangeProps = {
  /** Current start value. */
  from?: string;
  /** Current end value. */
  to?: string;
  /** Called when the user applies the range. */
  onApply: (from: string, to: string) => void;
  /** Presets or preset groups shown in the range popup. */
  presets?: Array<FilterBarRangePreset | TimeRangePresetGroup>;
  /** Enables time inputs when using date-time values. */
  timeEnabled?: boolean;
  /** Selected timezone. */
  timeZone?: string;
  /** Available timezone options. */
  timeZones?: string[];
  fromPlaceholder?: string;
  toPlaceholder?: string;
  emptyLabel?: string;
  className?: string;
};

export type FilterBarProps = {
  /** Optional global search control shown first. */
  search?: FilterBarSearchProps;
  /** Structured filters rendered after search. */
  filters?: FilterBarFilter[];
  /** Date-time range control. */
  timeRange?: FilterBarRangeProps;
  /** Date-only range control. */
  dateRange?: FilterBarRangeProps;
  /** Additional content rendered in the filter row. */
  children?: ReactNode;
  /** Content rendered before search and filters. */
  leading?: ReactNode;
  /** Content rendered at the end of the bar. */
  trailing?: ReactNode;
  /** Classes applied to the root bar. */
  className?: string;
  /**
   * When false, debounced fields forward edits immediately and an Apply button
   * is rendered in the trailing slot. Defaults to true.
   */
  autoSubmit?: boolean;
  /** Called by the Apply button when `autoSubmit` is false. */
  onApply?: () => void;
  /** Label for the Apply button. */
  applyLabel?: string;
  /** Shows a pending state on the Apply button. */
  isPending?: boolean;
  /** `responsive` moves hidden filters into an overflow popover; `wrap` lets them wrap. */
  overflowMode?: "responsive" | "wrap";
};

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
  overflowMode = "responsive",
}: FilterBarProps) {
  const hasRangeControls = Boolean(timeRange || dateRange);
  const showApply = !autoSubmit && !!onApply;
  const contextValue = useMemo(() => ({ autoSubmit }), [autoSubmit]);
  const allFilters = filters ?? [];
  const responsiveOverflow = overflowMode === "responsive" && allFilters.length > 0;
  const mobileFilterOverflow = useMediaQuery("(max-width: 767px)");
  const filterListRef = useRef<HTMLDivElement>(null);
  const overflowTriggerRef = useRef<HTMLButtonElement>(null);
  const filterNodeRefs = useRef(new Map<string, HTMLDivElement>());
  const filterWidthCache = useRef(new Map<string, number>());
  const filterKeys = useMemo(
    () => allFilters.map((filter) => filter.key).join("\u0000"),
    [allFilters],
  );
  const [visibleFilterCount, setVisibleFilterCount] = useState(allFilters.length);

  // Latest-value refs so measureOverflow can be a stable useCallback. Reading
  // the current values through refs sidesteps the closure-staleness problem
  // without putting array references in the dep list — which is what caused
  // the "Maximum update depth exceeded" cascade (allFilters in the deps made
  // measureOverflow change on every render → ResizeObserver effect re-ran →
  // setVisibleFilterCount fired → repeat).
  const allFiltersRef = useRef(allFilters);
  const responsiveOverflowRef = useRef(responsiveOverflow);
  const mobileFilterOverflowRef = useRef(mobileFilterOverflow);
  allFiltersRef.current = allFilters;
  responsiveOverflowRef.current = responsiveOverflow;
  mobileFilterOverflowRef.current = mobileFilterOverflow;

  useLayoutEffect(() => {
    setVisibleFilterCount(
      responsiveOverflowRef.current && mobileFilterOverflowRef.current
        ? 0
        : allFiltersRef.current.length,
    );
  }, [filterKeys, mobileFilterOverflow]);

  const measureOverflow = useCallback(() => {
    const current = allFiltersRef.current;
    if (!responsiveOverflowRef.current) {
      setVisibleFilterCount(current.length);
      return;
    }
    if (mobileFilterOverflowRef.current) {
      setVisibleFilterCount(0);
      return;
    }

    const filterList = filterListRef.current;
    if (!filterList) return;

    const availableWidth = Math.floor(filterList.getBoundingClientRect().width);
    if (availableWidth <= 0) return;

    const widths = current.map((filter) => {
      const node = filterNodeRefs.current.get(filter.key);
      const measured = node?.getBoundingClientRect().width ?? 0;
      if (measured > 0) {
        const width = Math.ceil(measured);
        filterWidthCache.current.set(filter.key, width);
        return width;
      }
      return filterWidthCache.current.get(filter.key) ?? estimateFilterWidth(filter);
    });

    const triggerWidth = Math.ceil(
      overflowTriggerRef.current?.getBoundingClientRect().width ??
        FILTER_BAR_OVERFLOW_TRIGGER_ESTIMATE_PX,
    );
    const triggerGap = triggerWidth > 0 ? FILTER_BAR_GAP_PX : 0;
    const allFiltersWidth = sumFilterWidths(widths);
    const nextVisible =
      allFiltersWidth <= availableWidth
        ? current.length
        : calculateVisibleFilterCount(
            widths,
            Math.max(0, availableWidth - triggerWidth - triggerGap),
          );
    setVisibleFilterCount((prev) => (prev === nextVisible ? prev : nextVisible));
  }, []);

  useLayoutEffect(() => {
    measureOverflow();
  }, [measureOverflow]);

  useEffect(() => {
    if (!responsiveOverflow) return;

    const filterList = filterListRef.current;
    const trigger = overflowTriggerRef.current;
    const ResizeObserverCtor = typeof ResizeObserver === "undefined" ? null : ResizeObserver;

    if (!ResizeObserverCtor) {
      window.addEventListener("resize", measureOverflow);
      measureOverflow();
      return () => window.removeEventListener("resize", measureOverflow);
    }

    const observer = new ResizeObserverCtor(() => measureOverflow());
    if (filterList) observer.observe(filterList);
    if (trigger) observer.observe(trigger);
    window.addEventListener("resize", measureOverflow);
    measureOverflow();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measureOverflow);
    };
  }, [measureOverflow, responsiveOverflow, mobileFilterOverflow]);

  const inlineFilters = responsiveOverflow
    ? allFilters.slice(0, Math.min(visibleFilterCount, allFilters.length))
    : allFilters;
  const overflowFilters = responsiveOverflow
    ? allFilters.slice(Math.min(visibleFilterCount, allFilters.length))
    : [];
  const activeOverflowCount = overflowFilters.filter(isFilterBarFilterActive).length;

  const setFilterNode = useCallback((key: string, node: HTMLDivElement | null) => {
    if (!node) {
      filterNodeRefs.current.delete(key);
      return;
    }
    filterNodeRefs.current.set(key, node);
  }, []);

  return (
    <FilterBarContext.Provider value={contextValue}>
      <div
        data-slot="filter-bar"
        className={cn(
          "flex flex-nowrap items-center gap-2 overflow-visible bg-background py-1.5",
          "flex-wrap md:flex-nowrap",
          overflowMode === "wrap" && "flex-wrap",
          className,
        )}
      >
        {leading && <div className="flex shrink-0 items-center gap-2">{leading}</div>}

        {search && <SearchField search={search} />}

        {children}

        {allFilters.length > 0 && (
          <div
            ref={filterListRef}
            data-filter-bar-list
            className={cn(
              "flex min-w-0 items-center gap-2",
              overflowMode === "wrap" ? "flex-wrap" : "flex-1",
            )}
          >
            {inlineFilters.map((filter, index) => (
              <div
                key={filter.key}
                ref={(node) => setFilterNode(filter.key, node)}
                data-filter-bar-item={filter.key}
                className="min-w-0 shrink-0"
              >
                {renderFilterField(filter, !search && index === 0)}
              </div>
            ))}
          </div>
        )}

        {responsiveOverflow && overflowFilters.length > 0 && (
          <OverflowFiltersMenu
            triggerRef={overflowTriggerRef}
            filters={overflowFilters}
            activeHidden={activeOverflowCount}
            {...(onApply ? { onApply } : {})}
          />
        )}

        {(hasRangeControls || trailing || showApply) && (
          <div className="ml-auto flex min-w-0 shrink-0 flex-wrap items-center justify-end gap-2">
            {dateRange && <RangeControlButton kind="date" label="Date range" {...dateRange} />}
            {timeRange && (
              <RangeControlButton
                kind={timeRange.timeEnabled === false ? "date" : "time"}
                label={timeRange.timeEnabled === false ? "Date range" : "Time range"}
                {...timeRange}
              />
            )}
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
  autoSubmit = true,
}: {
  filter: FilterBarFilter;
  chrome?: FilterBarFilterPanelChrome;
  autoSubmit?: boolean;
}) {
  const contextValue = useMemo(() => ({ autoSubmit }), [autoSubmit]);

  return (
    <FilterBarContext.Provider value={contextValue}>
      <FilterBarFilterPanelContent filter={filter} chrome={chrome} />
    </FilterBarContext.Provider>
  );
}

function FilterBarFilterPanelContent({
  filter,
  chrome = "full",
}: {
  filter: FilterBarFilter;
  chrome?: FilterBarFilterPanelChrome;
}) {
  return (
    <>
      {filter.kind === "lookup" && <LookupFilterField filter={filter} grow />}
      {filter.kind === "lookup-multi" && <LookupMultiFilterField filter={filter} grow />}
      {filter.kind === "multi" && <MultiFilterPanel filter={filter} chrome={chrome} />}
      {filter.kind === "nested-multi" && <NestedMultiFilterPanel filter={filter} chrome={chrome} />}
      {filter.kind === "select-multi" && <SelectMultiFilterField filter={filter} grow />}
      {filter.kind === "number" && <NumberFilterPanel filter={filter} chrome={chrome} />}
      {filter.kind === "enum" && <EnumFilterField filter={filter} grow />}
      {filter.kind === "boolean" && <BooleanFilterField filter={filter} />}
      {filter.kind === "tristate" && <TriStateFilterField filter={filter} />}
      {filter.kind === "text" && <TextFilterField filter={filter} grow />}
    </>
  );
}

function renderFilterField(filter: FilterBarFilter, grow: boolean) {
  if (filter.kind === "lookup") {
    return <LookupFilterField filter={filter} grow={grow} />;
  }

  if (filter.kind === "lookup-multi") {
    return <LookupMultiFilterField filter={filter} grow={grow} />;
  }

  if (filter.kind === "multi") {
    return <MultiFilterField filter={filter} grow={grow} />;
  }

  if (filter.kind === "nested-multi") {
    return <NestedMultiFilterField filter={filter} grow={grow} />;
  }

  if (filter.kind === "select-multi") {
    return <SelectMultiFilterField filter={filter} grow={grow} />;
  }

  if (filter.kind === "number") {
    return <NumberFilterField filter={filter} grow={grow} />;
  }

  if (filter.kind === "enum") {
    return <EnumFilterField filter={filter} grow={grow} />;
  }

  if (filter.kind === "boolean") {
    return <BooleanFilterField filter={filter} />;
  }

  if (filter.kind === "tristate") {
    return <TriStateFilterField filter={filter} />;
  }

  return <TextFilterField filter={filter} grow={grow} />;
}

function OverflowFiltersMenu({
  triggerRef,
  filters,
  activeHidden,
  onApply,
}: {
  triggerRef: RefObject<HTMLButtonElement>;
  filters: FilterBarFilter[];
  activeHidden: number;
  onApply?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [stagedValues, setStagedValues] = useState<Record<string, FilterBarValue>>({});
  const hasHidden = filters.length > 0;
  const hiddenFilterKeys = useMemo(
    () => filters.map((filter) => filter.key).join("\u0000"),
    [filters],
  );
  // Re-stage from the live filters on every open/close so an un-applied edit is
  // discarded, preserving the prior close behaviour.
  const { refs, floatingStyles, context, floatingZ, getReferenceProps, getFloatingProps } =
    useAnchoredPopup(
      open,
      (next) => {
        setStagedValues(createFilterValueMap(filters));
        setOpen(next);
      },
      "bottom-end",
    );
  const closeOverflowMenu = useCallback(() => {
    setStagedValues(createFilterValueMap(filters));
    setOpen(false);
  }, [filters]);
  // Merge floating-ui's reference ref with the caller's triggerRef (the parent
  // measures the trigger width through it for overflow layout).
  const setTriggerRef = useMergeRefs([refs.setReference, triggerRef]);

  useEffect(() => {
    if (!hasHidden) closeOverflowMenu();
  }, [closeOverflowMenu, hasHidden]);

  useEffect(() => {
    if (!open) return;
    setStagedValues(createFilterValueMap(filters));
  }, [hiddenFilterKeys, open]);

  const stagedFilters = filters.map((filter) =>
    filterWithStagedValue(
      filter,
      stagedValues[filter.key] ?? filterBarFilterValue(filter),
      (next) =>
        setStagedValues((current) => ({
          ...current,
          [filter.key]: next,
        })),
    ),
  );

  return (
    <div
      className={cn("inline-flex shrink-0", !hasHidden && "invisible pointer-events-none")}
      aria-hidden={!hasHidden || undefined}
    >
      <Button
        ref={setTriggerRef}
        type="button"
        variant="outline"
        size="sm"
        aria-label="More filters"
        tabIndex={hasHidden ? 0 : -1}
        title={hasHidden ? "More filters" : undefined}
        className={cn(
          "h-8 min-w-0 gap-1.5 px-2 text-xs font-normal",
          activeHidden > 0 && "border-primary/40 text-primary",
        )}
        {...getReferenceProps()}
      >
        <Icon icon={UiFilter} className="text-[14px]" />
        {activeHidden > 0 && (
          <span className="rounded-full bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
            {activeHidden}
          </span>
        )}
      </Button>

      {hasHidden && open && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={refs.setFloating}
              role="dialog"
              aria-label="Overflow filters"
              style={{ ...floatingStyles, zIndex: floatingZ }}
              className="flex max-h-[min(34rem,calc(100vh-2rem))] w-[min(34rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-md border border-border bg-popover p-2 text-popover-foreground shadow-lg shadow-black/10"
              {...getFloatingProps()}
            >
          <div className="mb-2 flex items-center justify-between gap-2 px-1">
            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Filters
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="rounded px-1.5 py-0.5 text-xs text-primary transition-colors hover:bg-accent focus:bg-accent focus:outline-none disabled:text-muted-foreground"
                onClick={() => stagedFilters.forEach(clearFilterBarFilter)}
                disabled={stagedFilters.every((filter) => !isFilterBarFilterActive(filter))}
              >
                Clear all
              </button>
              <button
                type="button"
                aria-label="Close overflow filters"
                title="Close"
                className="inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:outline-none"
                onClick={closeOverflowMenu}
              >
                <Icon icon={UiClose} className="text-sm" />
              </button>
            </div>
          </div>
          <div className="min-h-0 flex-1 divide-y divide-border/70 overflow-y-auto rounded-md border border-border/70">
            {stagedFilters.map((filter) => {
              const active = isFilterBarFilterActive(filter);
              return (
                <div
                  key={filter.key}
                  data-overflow-filter-row={filter.key}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 overflow-visible p-3 md:h-12 md:grid-cols-[minmax(7rem,10rem)_auto_minmax(0,1fr)_auto] md:items-center md:p-2"
                >
                  <label
                    htmlFor={filterInputId(filter)}
                    className="flex min-w-0 items-center gap-1 truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
                    title={filter.description ?? filter.label}
                  >
                    <LabelIcon
                      icon={sizedIcon(filter.icon, 12)}
                      className="text-[12px] normal-case"
                    />
                    <span className="truncate">{filter.label}</span>
                  </label>
                  <span className="hidden text-sm text-muted-foreground md:block">=</span>
                  <div className="col-span-2 min-w-0 overflow-visible md:col-span-1">
                    <FilterBarContext.Provider value={{ autoSubmit: false }}>
                      <FilterBarKeyValueControl filter={filter} />
                    </FilterBarContext.Provider>
                  </div>
                  <button
                    type="button"
                    aria-label={`Clear ${filter.label}`}
                    title={`Clear ${filter.label}`}
                    className="inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:outline-none disabled:text-muted-foreground/40"
                    onClick={() => clearFilterBarFilter(filter)}
                    disabled={!active}
                  >
                    <Icon icon={UiClose} className="text-sm" />
                  </button>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={closeOverflowMenu}
            >
              Close
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => {
                applyStagedFilterValues(filters, stagedValues);
                onApply?.();
                setOpen(false);
              }}
            >
              Apply
            </Button>
          </div>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </div>
  );
}

function FilterBarKeyValueControl({ filter }: { filter: FilterBarFilter }) {
  if (filter.kind === "text") {
    return <TextFilterValueControl filter={filter} />;
  }
  if (filter.kind === "lookup") {
    return <LookupFilterValueControl filter={filter} />;
  }
  if (filter.kind === "lookup-multi") {
    return <LookupMultiFilterValueControl filter={filter} />;
  }
  if (filter.kind === "enum") {
    return <EnumFilterValueControl filter={filter} />;
  }
  if (filter.kind === "boolean") {
    return <BooleanFilterValueControl filter={filter} />;
  }
  if (filter.kind === "select-multi") {
    return <SelectMultiFilterValueControl filter={filter} />;
  }
  if (filter.kind === "multi") {
    return <MultiFilterField filter={filter} grow />;
  }
  if (filter.kind === "nested-multi") {
    return <NestedMultiFilterField filter={filter} grow />;
  }
  if (filter.kind === "tristate") {
    return <TriStateFilterValueControl filter={filter} />;
  }
  return <NumberFilterField filter={filter} grow />;
}

function filterInputId(filter: FilterBarFilter) {
  return `filterbar-overflow-${filter.key}`;
}

function lookupOptionsToCombobox(options: FilterBarLookupOption[]): ComboboxOption[] {
  return options.map((option) => ({
    value: option.value,
    label: option.label ?? option.value,
    ...(option.disabled !== undefined ? { disabled: option.disabled } : {}),
  }));
}

function valueInputClassName(disabled?: boolean) {
  return cn(
    "h-8 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring",
    disabled && "cursor-not-allowed opacity-60",
  );
}

function TextFilterValueControl({ filter }: { filter: FilterBarTextFilter }) {
  const [draft, setDraft] = useDebouncedTextDraft(filter.value, filter.onChange);

  return (
    <input
      id={filterInputId(filter)}
      type="text"
      aria-label={filter.label}
      className={valueInputClassName(filter.disabled)}
      {...(filter.placeholder !== undefined ? { placeholder: filter.placeholder } : {})}
      value={draft}
      disabled={filter.disabled}
      onChange={(event) => setDraft(event.target.value)}
    />
  );
}

function LookupFilterValueControl({ filter }: { filter: FilterBarLookupFilter }) {
  const [draft, setDraft] = useDebouncedTextDraft(filter.value, filter.onChange);

  if (filter.inputType === "date") {
    return (
      <DateTimePicker
        id={filterInputId(filter)}
        aria-label={filter.label}
        className="w-full"
        inputClassName={valueInputClassName(filter.disabled)}
        buttonClassName="right-1"
        placeholder={filter.placeholder}
        value={draft}
        disabled={filter.disabled}
        onChange={setDraft}
      />
    );
  }

  if (filter.inputType === "number") {
    return (
      <input
        id={filterInputId(filter)}
        type="number"
        aria-label={filter.label}
        className={valueInputClassName(filter.disabled)}
        placeholder={filter.placeholder}
        value={draft}
        disabled={filter.disabled}
        onChange={(event) => setDraft(event.target.value)}
      />
    );
  }

  // The overflow panel renders the filter label as a separate row header, so
  // the Combobox here omits its own inline label to avoid duplication.
  return (
    <Combobox
      id={filterInputId(filter)}
      options={lookupOptionsToCombobox(filter.options)}
      value={filter.value}
      onChange={filter.onChange}
      allowCustomValue={false}
      size="sm"
      className="w-full"
      {...(filter.placeholder !== undefined ? { placeholder: filter.placeholder } : {})}
      {...(filter.disabled !== undefined ? { disabled: filter.disabled } : {})}
    />
  );
}

function LookupMultiFilterValueControl({ filter }: { filter: FilterBarLookupMultiFilter }) {
  return (
    <Combobox
      multiple
      id={filterInputId(filter)}
      options={lookupOptionsToCombobox(filter.options)}
      value={filter.value}
      onChange={filter.onChange}
      allowCustomValue={false}
      footer={lookupMultiFilterFooter(filter)}
      size="sm"
      className="w-full"
      {...(filter.placeholder !== undefined ? { placeholder: filter.placeholder } : {})}
      {...(filter.disabled !== undefined ? { disabled: filter.disabled } : {})}
    />
  );
}

function enumOptionsToCombobox(
  options: FilterBarEnumFilter["options"],
): ComboboxOption[] {
  return options.map((option) => ({
    value: option.value,
    label: option.label ?? option.value,
  }));
}

function EnumFilterValueControl({ filter }: { filter: FilterBarEnumFilter }) {
  return (
    <Combobox
      id={filterInputId(filter)}
      options={enumOptionsToCombobox(filter.options)}
      value={filter.value}
      onChange={filter.onChange}
      allowCustomValue={false}
      size="sm"
      {...(filter.placeholder !== undefined ? { placeholder: filter.placeholder } : {})}
      className="w-full"
      {...(filter.disabled !== undefined ? { disabled: filter.disabled } : {})}
    />
  );
}

function BooleanFilterValueControl({ filter }: { filter: FilterBarBooleanFilter }) {
  return (
    <div className="flex h-8 items-center">
      <input
        id={filterInputId(filter)}
        type="checkbox"
        aria-label={filter.label}
        className="h-4 w-4 accent-primary"
        checked={filter.value}
        disabled={filter.disabled}
        onChange={(event) => filter.onChange(event.target.checked)}
      />
    </div>
  );
}

function TriStateFilterValueControl({ filter }: { filter: FilterBarTriStateFilter }) {
  return (
    <div className="flex h-8 items-center">
      <TriStateToggle
        value={filter.value}
        onChange={filter.onChange}
        label={filter.label}
        size="md"
        {...(filter.labels ? { labels: filter.labels } : {})}
        {...(filter.disabled ? { disabled: filter.disabled } : {})}
      />
    </div>
  );
}

function SelectMultiFilterValueControl({ filter }: { filter: FilterBarSelectMultiFilter }) {
  return (
    <MultiSelect
      options={filter.options}
      value={filter.value}
      onChange={filter.onChange}
      ariaLabel={`${filter.label} filter`}
      {...(filter.placeholder !== undefined ? { placeholder: filter.placeholder } : {})}
      {...(filter.disabled !== undefined ? { disabled: filter.disabled } : {})}
      triggerClassName="h-8 w-full rounded-md border border-input bg-background px-2 text-sm shadow-none"
      menuClassName="left-auto right-0"
    />
  );
}

export function FilterBarRangePanel({
  kind,
  label,
  from = "",
  to = "",
  onApply,
  presets,
  timeEnabled,
  timeZone,
  timeZones,
  fromPlaceholder,
  toPlaceholder,
  emptyLabel,
}: FilterBarRangeProps & { kind: "date" | "time"; label: string }) {
  return (
    <div className="w-72 p-3 text-popover-foreground">
      <TimeRange
        kind={kind}
        label={label}
        align="left"
        from={from}
        to={to}
        onApply={onApply}
        {...(presets ? { presets } : {})}
        {...(timeEnabled !== undefined ? { timeEnabled } : {})}
        {...(timeZone ? { timeZone } : {})}
        {...(timeZones ? { timeZones } : {})}
        {...(fromPlaceholder ? { fromPlaceholder } : {})}
        {...(toPlaceholder ? { toPlaceholder } : {})}
        {...(emptyLabel ? { emptyLabel } : {})}
        panelClassName="left-0 right-auto"
      />
    </div>
  );
}

function EnumFilterField({ filter, grow }: { filter: FilterBarEnumFilter; grow: boolean }) {
  return (
    <Combobox
      {...comboboxLabelProps(filter)}
      options={enumOptionsToCombobox(filter.options)}
      value={filter.value}
      onChange={filter.onChange}
      allowCustomValue={false}
      size="sm"
      {...(filter.placeholder !== undefined ? { placeholder: filter.placeholder } : {})}
      className={cn(lookupFieldWidthClass(grow), filter.className)}
      {...(filter.disabled !== undefined ? { disabled: filter.disabled } : {})}
    />
  );
}

function TriStateFilterField({ filter }: { filter: FilterBarTriStateFilter }) {
  return (
    <div
      title={filter.description}
      className={cn(
        "flex h-8 shrink-0 items-center gap-2 rounded-md border border-input bg-muted/30 px-2 text-xs",
        filter.disabled && "opacity-60",
        filter.className,
      )}
    >
      <TriStateToggle
        value={filter.value}
        onChange={filter.onChange}
        label={filter.label}
        {...(filter.labels ? { labels: filter.labels } : {})}
        {...(filter.disabled ? { disabled: filter.disabled } : {})}
      />
      <FilterFieldLabel icon={filter.icon} label={filter.label} />
    </div>
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
      <FilterFieldLabel icon={filter.icon} label={filter.label} />
    </label>
  );
}

function SearchField({ search }: { search: FilterBarSearchProps }) {
  const [draft, setDraft] = useDebouncedTextDraft(search.value, search.onChange);

  return (
    <div className="flex min-w-0 flex-[1_1_14rem] items-center gap-2 md:min-w-[14rem] md:max-w-[24rem]">
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
          <Icon icon={UiSearch} className="mr-2 shrink-0 text-muted-foreground" />
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
      <FilterFieldLabel icon={filter.icon} label={filter.label} />
      <input
        type="text"
        aria-label={filter.label}
        className="w-full min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        {...(filter.placeholder !== undefined ? { placeholder: filter.placeholder } : {})}
        value={draft}
        disabled={filter.disabled}
        onChange={(event) => setDraft(event.target.value)}
      />
    </label>
  );
}

// FilterFieldLabel is the uppercase label shown inside inline filter shells,
// with an optional leading glyph from the filter's `icon`.
function FilterFieldLabel({ icon, label }: { icon?: LabelIconSpec; label: string }) {
  return (
    <span className="flex items-center gap-1 whitespace-nowrap font-medium uppercase tracking-wide text-muted-foreground">
      <LabelIcon icon={icon} className="text-[13px] normal-case" />
      {label}
    </span>
  );
}

function LookupFilterField({ filter, grow }: { filter: FilterBarLookupFilter; grow: boolean }) {
  const [draft, setDraft] = useDebouncedTextDraft(filter.value, filter.onChange);

  // Date and number lookups keep their specialized inputs in the label shell;
  // text lookups use the Combobox with its own inline label.
  if (filter.inputType === "date" || filter.inputType === "number") {
    // For a date lookup with a value, surface the human-readable absolute +
    // relative form (e.g. "Apr 15, 2026, 12:00 PM (2h ago)") as the hover title.
    const dateTitle =
      filter.inputType === "date" && draft ? formatDateTimeRelative(draft) : undefined;
    return (
      <label
        title={dateTitle ?? filter.description}
        className={cn(
          "flex h-8 items-center gap-2 rounded-md border border-input bg-muted/30 pl-2 pr-2 text-xs",
          lookupFieldWidthClass(grow),
          filter.disabled && "opacity-60",
          filter.className,
        )}
      >
        <FilterFieldLabel icon={filter.icon} label={filter.label} />
        {filter.inputType === "date" ? (
          <DateTimePicker
            aria-label={filter.label}
            className="w-full"
            inputClassName="w-full min-w-0 border-0 bg-transparent px-0 pr-6 text-sm text-foreground shadow-none focus-visible:ring-0"
            buttonClassName="right-0"
            placeholder={filter.placeholder}
            value={draft}
            disabled={filter.disabled}
            onChange={setDraft}
          />
        ) : (
          <input
            type="number"
            aria-label={filter.label}
            className="w-full min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
            placeholder={filter.placeholder}
            value={draft}
            disabled={filter.disabled}
            onChange={(event) => setDraft(event.target.value)}
          />
        )}
      </label>
    );
  }

  return (
    <Combobox
      {...comboboxLabelProps(filter)}
      options={lookupOptionsToCombobox(filter.options)}
      value={filter.value}
      onChange={filter.onChange}
      allowCustomValue={false}
      size="sm"
      className={cn(lookupFieldWidthClass(grow), filter.className)}
      {...(filter.placeholder !== undefined ? { placeholder: filter.placeholder } : {})}
      {...(filter.disabled !== undefined ? { disabled: filter.disabled } : {})}
    />
  );
}

function LookupMultiFilterField({
  filter,
  grow,
}: {
  filter: FilterBarLookupMultiFilter;
  grow: boolean;
}) {
  return (
    <Combobox
      multiple
      {...comboboxLabelProps(filter)}
      options={lookupOptionsToCombobox(filter.options)}
      value={filter.value}
      onChange={filter.onChange}
      allowCustomValue={false}
      footer={lookupMultiFilterFooter(filter)}
      size="sm"
      className={cn(lookupFieldWidthClass(grow), filter.className)}
      {...(filter.placeholder !== undefined ? { placeholder: filter.placeholder } : {})}
      {...(filter.onSearch !== undefined ? { onSearch: filter.onSearch } : {})}
      {...(filter.loading !== undefined ? { loading: filter.loading } : {})}
      {...(filter.disabled !== undefined ? { disabled: filter.disabled } : {})}
    />
  );
}

function lookupMultiFilterFooter(filter: FilterBarLookupMultiFilter) {
  const moreCount =
    filter.truncated && filter.total ? Math.max(filter.total - filter.options.length, 0) : 0;
  if (moreCount === 0) return undefined;
  return (
    <>
      … and {moreCount.toLocaleString()} more
      {filter.onSearch ? " — type to search all" : ""}
    </>
  );
}

function NumberFilterField({ filter, grow }: { filter: FilterBarNumberFilter; grow: boolean }) {
  const [open, setOpen] = useState(false);
  const popup = useAnchoredPopup(open, setOpen);

  const bounds = resolveNumberFilterBounds(filter);
  const [draft, setDraft] = useDebouncedNumberDraft(filter.value, filter.onChange);
  const sliderMin = clampNumber(parseFilterNumber(draft.min) ?? bounds.min, bounds.min, bounds.max);
  const sliderMax = clampNumber(parseFilterNumber(draft.max) ?? bounds.max, bounds.min, bounds.max);
  const activeMin = Math.min(sliderMin, sliderMax);
  const activeMax = Math.max(sliderMin, sliderMax);
  const summary = summarizeNumberFilter(filter, bounds, draft);

  return (
    <div
      title={filter.description}
      className={cn(
        "inline-flex min-w-0",
        grow ? "min-w-[8rem] max-w-[12rem] flex-1" : "shrink-0",
        filter.disabled && "opacity-60",
        filter.className,
      )}
    >
      <Button
        ref={popup.refs.setReference as Ref<HTMLButtonElement>}
        type="button"
        variant="outline"
        size="sm"
        aria-label={`${filter.label} filter`}
        disabled={filter.disabled}
        className={cn(
          "min-w-0 gap-2 font-normal",
          grow ? "w-full max-w-[12rem] justify-between" : "w-auto max-w-[9.5rem] px-2.5",
          summary === filter.label && "text-muted-foreground",
        )}
        {...popup.getReferenceProps()}
      >
        <LabelIcon icon={filter.icon} className="text-[14px] text-muted-foreground" />
        <span className="truncate">{summary}</span>
        <Icon icon={open ? UiChevronUp : UiChevronDown} className="text-muted-foreground" />
      </Button>

      {open && (
        <FloatingPortal>
          <FloatingFocusManager context={popup.context} modal={false}>
            <div
              ref={popup.refs.setFloating}
              role="dialog"
              aria-label={filter.label}
              style={{ ...popup.floatingStyles, zIndex: popup.floatingZ }}
              className="min-w-[18rem] max-w-[22rem] rounded-md border border-border bg-popover p-3 text-popover-foreground shadow-lg shadow-black/5"
              {...popup.getFloatingProps()}
            >
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
                  {...(filter.minPlaceholder !== undefined ? { placeholder: filter.minPlaceholder } : {})}
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
                  {...(filter.maxPlaceholder !== undefined ? { placeholder: filter.maxPlaceholder } : {})}
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
          </FloatingFocusManager>
        </FloatingPortal>
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
              {...(filter.minPlaceholder !== undefined ? { placeholder: filter.minPlaceholder } : {})}
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
              {...(filter.maxPlaceholder !== undefined ? { placeholder: filter.maxPlaceholder } : {})}
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
                <Icon icon={UiChevronRight} className="shrink-0 text-muted-foreground" />
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

function NestedMultiFilterField({
  filter,
  grow,
}: {
  filter: FilterBarNestedMultiFilter;
  grow: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [draft, setDraft] = useDebouncedMultiDraft(filter.value, filter.onChange);

  const popup = useAnchoredPopup(open, (next) => {
    setOpen(next);
    if (!next) setActiveGroup(null);
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
      title={filter.description}
      className={cn(
        "inline-flex min-w-0",
        grow ? "min-w-[8rem] max-w-[12rem] flex-1" : "shrink-0",
        filter.disabled && "opacity-60",
        filter.className,
      )}
    >
      <Button
        ref={popup.refs.setReference as Ref<HTMLButtonElement>}
        type="button"
        variant="outline"
        size="sm"
        aria-label={`${filter.label} filter`}
        disabled={filter.disabled}
        className={cn(
          "min-w-0 gap-2 font-normal",
          grow ? "w-full max-w-[12rem] justify-between" : "w-auto max-w-[8.5rem] px-2.5",
          summary === filter.label && "text-muted-foreground",
        )}
        {...popup.getReferenceProps()}
      >
        <span className="truncate">{summary}</span>
        <Icon icon={open ? UiChevronUp : UiChevronDown} className="text-muted-foreground" />
      </Button>

      {open && (
        <FloatingPortal>
          <FloatingFocusManager context={popup.context} modal={false}>
            <div
              ref={popup.refs.setFloating}
              role="dialog"
              aria-label={filter.label}
              style={{ ...popup.floatingStyles, zIndex: popup.floatingZ }}
              className="flex"
              {...popup.getFloatingProps()}
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
                    <Icon icon={UiChevronRight} className="shrink-0 text-muted-foreground" />
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
          </FloatingFocusManager>
        </FloatingPortal>
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
        ariaLabel={`${filter.label} filter`}
        {...(filter.placeholder !== undefined ? { placeholder: filter.placeholder } : {})}
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
  timeEnabled,
  timeZone,
  timeZones,
  fromPlaceholder,
  toPlaceholder,
  emptyLabel,
  className,
}: FilterBarRangeProps & { kind: "date" | "time"; label: string }) {
  return (
    <TimeRange
      kind={kind}
      label={label}
      from={from}
      to={to}
      onApply={onApply}
      {...(presets ? { presets } : {})}
      {...(timeEnabled !== undefined ? { timeEnabled } : {})}
      {...(timeZone ? { timeZone } : {})}
      {...(timeZones ? { timeZones } : {})}
      {...(fromPlaceholder ? { fromPlaceholder } : {})}
      {...(toPlaceholder ? { toPlaceholder } : {})}
      {...(emptyLabel ? { emptyLabel } : {})}
      {...(className ? { className } : {})}
    />
  );
}

// Anchored popup wired through floating-ui's portal so it escapes `overflow`
// clipping from scroll-container ancestors (e.g. AppLayout's `<main>`), matching
// Combobox/DropdownMenu. `flip`/`shift` keep it on-screen at viewport edges.
function useAnchoredPopup(
  open: boolean,
  onOpenChange: (open: boolean) => void,
  placement: Placement = "bottom-start",
) {
  const floatingZ = useFloatingZIndex();
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [offset(6), flip({ padding: 8 }), shift({ padding: 8 })],
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context, { escapeKey: false }),
    useRole(context, { role: "dialog" }),
  ]);
  useEscapeLayer(open, () => {
    onOpenChange(false);
    if (refs.domReference.current instanceof HTMLElement) refs.domReference.current.focus();
  });
  return { refs, floatingStyles, context, floatingZ, getReferenceProps, getFloatingProps };
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    onChange();
    media.addEventListener?.("change", onChange);
    return () => media.removeEventListener?.("change", onChange);
  }, [query]);

  return matches;
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

type FilterBarValue =
  | string
  | string[]
  | boolean
  // A tri-state filter's "off" position is undefined, so it is a real staged
  // value rather than the absence of one.
  | undefined
  | FilterBarNumberValue
  | Record<string, FilterBarMultiFilterMode>;

function createFilterValueMap(filters: FilterBarFilter[]) {
  return Object.fromEntries(filters.map((filter) => [filter.key, filterBarFilterValue(filter)]));
}

function filterBarFilterValue(filter: FilterBarFilter): FilterBarValue {
  return filter.value;
}

function filterWithStagedValue(
  filter: FilterBarFilter,
  value: FilterBarValue,
  onChange: (value: FilterBarValue) => void,
): FilterBarFilter {
  if (filter.kind === "text") {
    return {
      ...filter,
      value: String(value ?? ""),
      onChange: (next: string) => onChange(next),
    };
  }
  if (filter.kind === "lookup") {
    return {
      ...filter,
      value: String(value ?? ""),
      onChange: (next: string) => onChange(next),
    };
  }
  if (filter.kind === "lookup-multi") {
    return {
      ...filter,
      value: Array.isArray(value) ? value.map(String) : [],
      onChange: (next: string[]) => onChange(next),
    };
  }
  if (filter.kind === "multi") {
    return {
      ...filter,
      value: isMultiFilterValue(value) ? value : {},
      onChange: (next: Record<string, FilterBarMultiFilterMode>) => onChange(next),
    };
  }
  if (filter.kind === "nested-multi") {
    return {
      ...filter,
      value: isMultiFilterValue(value) ? value : {},
      onChange: (next: Record<string, FilterBarMultiFilterMode>) => onChange(next),
    };
  }
  if (filter.kind === "select-multi") {
    return {
      ...filter,
      value: Array.isArray(value) ? value.map(String) : [],
      onChange: (next: string[]) => onChange(next),
    };
  }
  if (filter.kind === "number") {
    return {
      ...filter,
      value: isNumberFilterValue(value) ? value : {},
      onChange: (next: FilterBarNumberValue) => onChange(next),
    };
  }
  if (filter.kind === "enum") {
    return {
      ...filter,
      value: String(value ?? ""),
      onChange: (next: string) => onChange(next),
    };
  }
  if (filter.kind === "tristate") {
    return {
      ...filter,
      value: value === undefined ? undefined : Boolean(value),
      onChange: (next: TriState) => onChange(next),
    };
  }
  return {
    ...filter,
    value: Boolean(value),
    onChange: (next: boolean) => onChange(next),
  };
}

function applyStagedFilterValues(
  filters: FilterBarFilter[],
  stagedValues: Record<string, FilterBarValue>,
) {
  for (const filter of filters) {
    // Key presence, not `??`: undefined is a tri-state filter's "off" value and
    // must still be applied over a live true/false.
    const next = Object.hasOwn(stagedValues, filter.key)
      ? stagedValues[filter.key]
      : filterBarFilterValue(filter);
    if (sameFilterBarValue(filterBarFilterValue(filter), next)) continue;
    applyFilterBarValue(filter, next);
  }
}

function applyFilterBarValue(filter: FilterBarFilter, value: FilterBarValue) {
  if (filter.kind === "text" || filter.kind === "lookup" || filter.kind === "enum") {
    filter.onChange(String(value ?? ""));
    return;
  }
  if (filter.kind === "lookup-multi" || filter.kind === "select-multi") {
    filter.onChange(Array.isArray(value) ? value.map(String) : []);
    return;
  }
  if (filter.kind === "number") {
    filter.onChange(isNumberFilterValue(value) ? value : {});
    return;
  }
  if (filter.kind === "boolean") {
    filter.onChange(Boolean(value));
    return;
  }
  if (filter.kind === "tristate") {
    filter.onChange(value === undefined ? undefined : Boolean(value));
    return;
  }
  filter.onChange(isMultiFilterValue(value) ? value : {});
}

function sameFilterBarValue(left: FilterBarValue, right: FilterBarValue) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function isNumberFilterValue(value: FilterBarValue): value is FilterBarNumberValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMultiFilterValue(
  value: FilterBarValue,
): value is Record<string, FilterBarMultiFilterMode> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function calculateVisibleFilterCount(widths: number[], availableWidth: number) {
  if (widths.length === 0) return 0;

  let used = 0;
  let count = 0;
  for (const width of widths) {
    const nextUsed = used + (count > 0 ? FILTER_BAR_GAP_PX : 0) + width;
    if (nextUsed > availableWidth) break;
    used = nextUsed;
    count += 1;
  }
  return count;
}

function sumFilterWidths(widths: number[]) {
  if (widths.length === 0) return 0;
  return (
    widths.reduce((total, width) => total + width, 0) + (widths.length - 1) * FILTER_BAR_GAP_PX
  );
}

function estimateFilterWidth(filter: FilterBarFilter) {
  if (filter.kind === "boolean") return Math.max(88, filter.label.length * 8 + 40);
  // Multi renders as a combobox field (min-w-[11rem] ≈ 176px); nested keeps
  // its compact trigger button.
  if (filter.kind === "multi") return 176;
  if (filter.kind === "nested-multi") return 136;
  if (filter.kind === "number") return 152;
  return Math.max(144, filter.label.length * 8 + 96);
}
