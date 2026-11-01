import { cn } from "../../lib/utils";
import { Icon } from "../Icon";
import { UiChevronDown } from "../../icons";
import { DropdownMenu } from "../../overlay/DropdownMenu";
import { FilterBarContext } from "../../components/filter-bar-context";
import { MultiFilterPanel } from "../../components/filter-bar-multi";
import { summarizeMultiFilter } from "../../components/filter-bar-field-utils";
import type { MultiSelectOption } from "../../components/MultiSelect";
import type { FilterMode, FilterState } from "./filterState";

// Picks commit straight away: the host, not a form, owns the filter state.
const COMMIT_IMMEDIATELY = { autoSubmit: false, compact: false };

/**
 * A compact, muted menu trigger summarising a tri-state facet ("Status +1 -1")
 * that opens an include / exclude option list. Sized for tree toolbars and headers.
 */
export function FilterFacet({
  label,
  options,
  state,
  onChange,
}: {
  label: string;
  options: MultiSelectOption[];
  state: FilterState<string>;
  onChange: (next: FilterState<string>) => void;
}) {
  const value: Record<string, FilterMode> = Object.fromEntries(state);
  const active = state.size > 0;
  return (
    <DropdownMenu
      align="right"
      menuLabel={label}
      menuClassName="p-2"
      trigger={
        <span
          role="button"
          tabIndex={0}
          className={cn(
            "inline-flex h-6 items-center gap-0.5 rounded px-1.5 text-xs transition-colors",
            active
              ? "bg-muted font-medium text-foreground"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
          )}
        >
          {summarizeMultiFilter(label, value)}
          <Icon icon={UiChevronDown} className="text-[10px] opacity-60" />
        </span>
      }
    >
      {() => (
        <FilterBarContext.Provider value={COMMIT_IMMEDIATELY}>
          <MultiFilterPanel
            chrome="embedded"
            filter={{
              key: label,
              kind: "multi",
              label,
              options,
              value,
              onChange: (v) => onChange(new Map(Object.entries(v))),
            }}
          />
        </FilterBarContext.Provider>
      )}
    </DropdownMenu>
  );
}
