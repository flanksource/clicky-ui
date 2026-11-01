import type { FilterState } from "../test-runner/filterState";
import { MultiFilterPanel } from "../../components/filter-bar-multi";
import { FilterBarContext } from "../../components/filter-bar-context";
import type { MultiSelectOption } from "../../components/MultiSelect";

const IMMEDIATE = { autoSubmit: false, compact: false };
export function ProblemFacet({
  label,
  options,
  state,
  onChange,
}: {
  label: string;
  options: MultiSelectOption[];
  state: FilterState<string>;
  onChange: (state: FilterState<string>) => void;
}) {
  return (
    <section aria-label={label}>
      <div className="mb-1 text-xs font-medium text-muted-foreground">
        {label}
      </div>
      <FilterBarContext.Provider value={IMMEDIATE}>
        <MultiFilterPanel
          chrome="embedded"
          filter={{
            key: label,
            kind: "multi",
            label,
            options,
            value: Object.fromEntries(state),
            onChange: (value) => onChange(new Map(Object.entries(value))),
          }}
        />
      </FilterBarContext.Provider>
    </section>
  );
}
