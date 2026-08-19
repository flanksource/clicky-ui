import { useCallback, useMemo, useRef, useState } from "react";
import { FilterPill } from "../data/FilterPill";
import { Icon, type LabelIconSpec } from "../data/Icon";
import { UiSearch } from "../icons";
import { cn } from "../lib/utils";
import { Combobox, type ComboboxOption } from "./Combobox";
import { FilterBarContext } from "./filter-bar-context";
import {
  comboboxLabelProps,
  lookupFieldWidthClass,
  mergeMultiSelectOptions,
  multiSelectOptionText,
  nextFilterMode,
  updateMultiFilterValue,
  useDebouncedMultiDraft,
  type FilterBarMultiFilterMode,
} from "./filter-bar-field-utils";
import type { MultiSelectOption } from "./MultiSelect";

export type { FilterBarMultiFilterMode } from "./filter-bar-field-utils";

export type FilterBarMultiFilter = {
  key: string;
  /** Renders include/exclude chips for each option. */
  kind: "multi";
  label: string;
  /** Leading glyph shown before the label: a runtime icon name or a node. */
  icon?: LabelIconSpec;
  description?: string;
  /** Map of option value to include/exclude state. */
  value: Record<string, FilterBarMultiFilterMode>;
  /** Available chip options. When `truncated`, this is only the head set. */
  options: MultiSelectOption[];
  onChange: (value: Record<string, FilterBarMultiFilterMode>) => void;
  /** Ghost text shown in the field when no options are selected. */
  placeholder?: string;
  /**
   * True when more options exist than are in `options` (the option set was
   * capped server-side). Renders an "… and N more" hint and, with `onSearch`,
   * lets the user search the full set.
   */
  truncated?: boolean;
  /** True distinct count behind a truncated option set; drives the "N more" label. */
  total?: number;
  /**
   * Optional async fetch invoked (debounced) as the user types in the option
   * search box. Returns the options matching the query, which are merged into
   * the displayed list so values beyond the head become selectable. When
   * absent, the search box filters the static `options` client-side only.
   */
  onSearch?: (query: string) => Promise<MultiSelectOption[]> | void;
  /**
   * Lets the user commit a value absent from `options` (a free-typed name or a
   * `*` wildcard). The option search box stays visible and an "Add" row appears
   * when the query matches no listed option; committed customs pin to the top so
   * they stay toggleable. Use for MatchItem-style filters (table/login patterns).
   */
  allowCustomValue?: boolean;
  disabled?: boolean;
  className?: string;
};

// MultiFilterField renders a "multi" filter as a tristate Combobox so the bar
// stays one control family with the lookup fields: same shell, inline label,
// typeahead input, and portaled listbox of FilterPill rows.
export function MultiFilterField({
  filter,
  grow,
}: {
  filter: FilterBarMultiFilter;
  grow: boolean;
}) {
  const [draft, setDraft] = useDebouncedMultiDraft(filter.value, filter.onChange);
  // Server-search state: the matches for the active query (they replace the
  // head while searching), plus the in-flight flag. Combobox owns the 250ms
  // debounce; this adapter only resolves the Promise, latest query wins.
  const [searchOptions, setSearchOptions] = useState<MultiSelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeQuery, setActiveQuery] = useState("");
  const latestQuery = useRef("");

  const onSearchProp = filter.onSearch;
  const handleSearch = useCallback(
    (query: string) => {
      latestQuery.current = query;
      setActiveQuery(query);
      if (!query) {
        setSearchOptions([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      Promise.resolve(onSearchProp?.(query))
        .then((opts) => {
          if (latestQuery.current !== query) return;
          setLoading(false);
          setSearchOptions(Array.isArray(opts) ? opts : []);
        })
        .catch(() => {
          if (latestQuery.current !== query) return;
          setLoading(false);
          setSearchOptions([]);
        });
    },
    [onSearchProp],
  );

  // allowCustomValue: any toggled value absent from `options` (a free-typed name
  // or a `*` wildcard) is synthesised as a pinned option so it renders and stays
  // toggleable across reopens.
  const allowCustomValue = Boolean(filter.allowCustomValue);
  const baseOptions = useMemo(() => {
    if (!allowCustomValue) return filter.options;
    const known = new Set(filter.options.map((o) => o.value));
    const pinned = Object.keys(draft)
      .filter((v) => !known.has(v))
      .map((v) => ({ value: v, label: v }));
    return mergeMultiSelectOptions(pinned, filter.options);
  }, [allowCustomValue, filter.options, draft]);

  // Server search active → the matches REPLACE the head, but any head option
  // the user has already toggled (include/exclude) stays pinned so their
  // selection remains visible and changeable. Selected first, then matches.
  // Without a query (or without onSearch) the head set renders and Combobox
  // client-filters it.
  const visibleOptions = useMemo(() => {
    if (!onSearchProp || !activeQuery) return baseOptions;
    const selectedHead = baseOptions.filter((o) => draft[o.value] !== undefined);
    return mergeMultiSelectOptions(selectedHead, searchOptions);
  }, [onSearchProp, activeQuery, baseOptions, searchOptions, draft]);

  const moreCount =
    filter.truncated && filter.total ? Math.max(filter.total - filter.options.length, 0) : 0;
  const footer =
    moreCount > 0 && !activeQuery ? (
      <>
        … and {moreCount.toLocaleString()} more
        {onSearchProp ? " — type to search all" : ""}
      </>
    ) : undefined;

  return (
    <Combobox
      multiple
      tristate
      {...comboboxLabelProps(filter)}
      options={toComboboxOptions(visibleOptions)}
      value={draft}
      onChange={setDraft}
      allowCustomValue={allowCustomValue}
      size="sm"
      className={cn(lookupFieldWidthClass(grow), filter.className)}
      {...(filter.placeholder !== undefined ? { placeholder: filter.placeholder } : {})}
      {...(onSearchProp !== undefined ? { onSearch: handleSearch, loading } : {})}
      {...(filter.disabled !== undefined ? { disabled: filter.disabled } : {})}
      {...(footer !== undefined ? { footer } : {})}
    />
  );
}

function toComboboxOptions(options: MultiSelectOption[]): ComboboxOption[] {
  return options.map((option) => {
    const title = option.title ?? multiSelectOptionText(option);
    return {
      value: option.value,
      // A node label (e.g. an icon + text span) can't render as the combobox's
      // option row or closed summary, so fall back to the option's title text —
      // the human-readable label — instead of the raw value.
      label: typeof option.label === "string" ? option.label : title,
      title,
      ...(option.disabled !== undefined ? { disabled: option.disabled } : {}),
    };
  });
}

export type TriStateMultiSelectProps = {
  /** Trigger label and popover heading. */
  label: string;
  /** Map of option value → include/exclude. Neutral options are absent. */
  value: Record<string, FilterBarMultiFilterMode>;
  onChange: (value: Record<string, FilterBarMultiFilterMode>) => void;
  /** Chip options. When `truncated`, this is only the head set. */
  options: MultiSelectOption[];
  icon?: LabelIconSpec;
  description?: string;
  truncated?: boolean;
  total?: number;
  onSearch?: (query: string) => Promise<MultiSelectOption[]> | void;
  /** Allow committing free-typed / `*`-wildcard values absent from `options`. */
  allowCustomValue?: boolean;
  disabled?: boolean;
  className?: string;
  /** Fill the available width (form field) vs. shrink to content. Default true. */
  grow?: boolean;
};

// TriStateMultiSelect is the standalone include/exclude/neutral multi-select used
// by FilterBar's "multi" kind, exposed for hand-written forms. It renders a
// tristate combobox whose rows cycle neutral → include → exclude. It commits
// changes immediately (autoSubmit:false) since a controlled form owns the value.
export function TriStateMultiSelect({ grow = true, ...rest }: TriStateMultiSelectProps) {
  const filter: FilterBarMultiFilter = { key: rest.label, kind: "multi", ...rest };
  return (
    <FilterBarContext.Provider value={{ autoSubmit: false }}>
      <MultiFilterField filter={filter} grow={grow} />
    </FilterBarContext.Provider>
  );
}

// MultiFilterPanel is the always-open embedded form of the multi filter (the
// FilterBarFilterPanel / DataTable column-popover surface). Unlike the inline
// field it is a panel, not an input, so it keeps the FilterPill row list.
export function MultiFilterPanel({
  filter,
  chrome = "full",
}: {
  filter: FilterBarMultiFilter;
  chrome?: "full" | "embedded";
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
          <Icon icon={UiSearch} className="shrink-0 text-muted-foreground" />
          <input
            type="search"
            aria-label={`Filter ${filter.label} options`}
            className="h-8 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-placeholder"
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
