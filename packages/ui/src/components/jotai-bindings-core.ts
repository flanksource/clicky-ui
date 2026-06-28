import { useCallback, useEffect, useMemo, useReducer } from "react";
import { useStore, type WritableAtom } from "jotai";
import type {
  FilterBarBooleanFilter,
  FilterBarEnumFilter,
  FilterBarFilter,
  FilterBarLookupFilter,
  FilterBarLookupMultiFilter,
  FilterBarMultiFilter,
  FilterBarNestedMultiFilter,
  FilterBarNumberFilter,
  FilterBarProps,
  FilterBarRangeProps,
  FilterBarSearchProps,
  FilterBarSelectMultiFilter,
  FilterBarTextFilter,
} from "./FilterBar";
import type { JsonSchemaFormProps } from "./json-schema-form-types";

export type JotaiWritableAtom<Value> = WritableAtom<Value, [Value], unknown>;
export type JotaiJsonSchemaFormAtom = JotaiWritableAtom<Record<string, unknown>>;

export type JotaiJsonSchemaFormProps = Omit<JsonSchemaFormProps, "value" | "onChange"> & {
  atom: JotaiJsonSchemaFormAtom;
  onChange?: JsonSchemaFormProps["onChange"];
};

export type JotaiFilterBarSearchProps = Omit<FilterBarSearchProps, "value" | "onChange"> & {
  atom: JotaiWritableAtom<string>;
  onChange?: FilterBarSearchProps["onChange"];
};

export type JotaiFilterBarRangeValue = {
  from?: string;
  to?: string;
};

export type JotaiFilterBarRangeProps = Omit<FilterBarRangeProps, "from" | "to" | "onApply"> & {
  atom: JotaiWritableAtom<JotaiFilterBarRangeValue>;
  onApply?: FilterBarRangeProps["onApply"];
};

type AtomizedFilter<TFilter extends FilterBarFilter> = Omit<TFilter, "value" | "onChange"> & {
  atom: JotaiWritableAtom<TFilter["value"]>;
  onChange?: TFilter["onChange"];
};

export type JotaiFilterBarTextFilter = AtomizedFilter<FilterBarTextFilter>;
export type JotaiFilterBarLookupFilter = AtomizedFilter<FilterBarLookupFilter>;
export type JotaiFilterBarLookupMultiFilter = AtomizedFilter<FilterBarLookupMultiFilter>;
export type JotaiFilterBarMultiFilter = AtomizedFilter<FilterBarMultiFilter>;
export type JotaiFilterBarNestedMultiFilter = AtomizedFilter<FilterBarNestedMultiFilter>;
export type JotaiFilterBarSelectMultiFilter = AtomizedFilter<FilterBarSelectMultiFilter>;
export type JotaiFilterBarNumberFilter = AtomizedFilter<FilterBarNumberFilter>;
export type JotaiFilterBarEnumFilter = AtomizedFilter<FilterBarEnumFilter>;
export type JotaiFilterBarBooleanFilter = AtomizedFilter<FilterBarBooleanFilter>;

export type JotaiFilterBarFilter =
  | JotaiFilterBarTextFilter
  | JotaiFilterBarLookupFilter
  | JotaiFilterBarLookupMultiFilter
  | JotaiFilterBarMultiFilter
  | JotaiFilterBarNestedMultiFilter
  | JotaiFilterBarSelectMultiFilter
  | JotaiFilterBarNumberFilter
  | JotaiFilterBarEnumFilter
  | JotaiFilterBarBooleanFilter;

export type JotaiFilterBarProps = Omit<
  FilterBarProps,
  "search" | "filters" | "timeRange" | "dateRange"
> & {
  search?: JotaiFilterBarSearchProps;
  filters?: JotaiFilterBarFilter[];
  timeRange?: JotaiFilterBarRangeProps;
  dateRange?: JotaiFilterBarRangeProps;
};

type AnyJotaiAtom = JotaiWritableAtom<unknown>;

function useAtomSubscriptions(atoms: AnyJotaiAtom[]) {
  const store = useStore();
  const [, forceRender] = useReducer((count: number) => count + 1, 0);
  const uniqueAtoms = useMemo(() => Array.from(new Set(atoms)), [atoms]);

  useEffect(() => {
    if (uniqueAtoms.length === 0) return undefined;
    const unsubscribers = uniqueAtoms.map((atom) => store.sub(atom, forceRender));
    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [store, uniqueAtoms]);
}

function useAtomValueSetter<Value>(atom: JotaiWritableAtom<Value>) {
  const store = useStore();
  const value = store.get(atom);
  const setValue = useCallback(
    (next: Value) => {
      store.set(atom, next);
    },
    [atom, store],
  );
  return [value, setValue] as const;
}

export function useJotaiJsonSchemaFormProps(
  atom: JotaiJsonSchemaFormAtom,
  onChange?: JsonSchemaFormProps["onChange"],
): Pick<JsonSchemaFormProps, "value" | "onChange"> {
  const atoms = useMemo(() => [atom as AnyJotaiAtom], [atom]);
  useAtomSubscriptions(atoms);
  const [value, setValue] = useAtomValueSetter(atom);

  return useMemo(
    () => ({
      value,
      onChange: (next: Record<string, unknown>) => {
        setValue(next);
        onChange?.(next);
      },
    }),
    [onChange, setValue, value],
  );
}

function useJotaiFilterBarAtoms({
  search,
  filters,
  timeRange,
  dateRange,
}: {
  search?: JotaiFilterBarSearchProps | undefined;
  filters?: JotaiFilterBarFilter[] | undefined;
  timeRange?: JotaiFilterBarRangeProps | undefined;
  dateRange?: JotaiFilterBarRangeProps | undefined;
}) {
  const atoms = useMemo(() => {
    const next: AnyJotaiAtom[] = [];
    if (search) next.push(search.atom as AnyJotaiAtom);
    filters?.forEach((filter) => next.push(filter.atom as AnyJotaiAtom));
    if (timeRange) next.push(timeRange.atom as AnyJotaiAtom);
    if (dateRange) next.push(dateRange.atom as AnyJotaiAtom);
    return next;
  }, [dateRange, filters, search, timeRange]);
  useAtomSubscriptions(atoms);
}

function useJotaiSearch(search: JotaiFilterBarSearchProps | undefined): FilterBarSearchProps | undefined {
  const store = useStore();
  if (!search) return undefined;
  const { atom, onChange, ...rest } = search;
  return {
    ...rest,
    value: store.get(atom),
    onChange: (next: string) => {
      store.set(atom, next);
      onChange?.(next);
    },
  };
}

function useJotaiRange(range: JotaiFilterBarRangeProps | undefined): FilterBarRangeProps | undefined {
  const store = useStore();
  if (!range) return undefined;
  const { atom, onApply, ...rest } = range;
  const value = store.get(atom);
  return {
    ...rest,
    ...(value.from !== undefined ? { from: value.from } : {}),
    ...(value.to !== undefined ? { to: value.to } : {}),
    onApply: (from: string, to: string) => {
      store.set(atom, { from, to });
      onApply?.(from, to);
    },
  };
}

function useJotaiFilters(filters: JotaiFilterBarFilter[] | undefined): FilterBarFilter[] | undefined {
  const store = useStore();
  if (!filters) return undefined;
  return filters.map((filter) => bindJotaiFilter(store, filter));
}

function bindJotaiFilter(store: ReturnType<typeof useStore>, filter: JotaiFilterBarFilter): FilterBarFilter {
  switch (filter.kind) {
    case "text": {
      const { atom, onChange, ...rest } = filter;
      return {
        ...rest,
        value: store.get(atom),
        onChange: (next: string) => {
          store.set(atom, next);
          onChange?.(next);
        },
      };
    }
    case "lookup": {
      const { atom, onChange, ...rest } = filter;
      return {
        ...rest,
        value: store.get(atom),
        onChange: (next: string) => {
          store.set(atom, next);
          onChange?.(next);
        },
      };
    }
    case "lookup-multi":
    case "select-multi": {
      const { atom, onChange, ...rest } = filter;
      return {
        ...rest,
        value: store.get(atom),
        onChange: (next: string[]) => {
          store.set(atom, next);
          onChange?.(next);
        },
      } as FilterBarFilter;
    }
    case "multi":
    case "nested-multi": {
      const { atom, onChange, ...rest } = filter;
      return {
        ...rest,
        value: store.get(atom),
        onChange: (next: FilterBarMultiFilter["value"]) => {
          store.set(atom, next);
          onChange?.(next);
        },
      } as FilterBarFilter;
    }
    case "number": {
      const { atom, onChange, ...rest } = filter;
      return {
        ...rest,
        value: store.get(atom),
        onChange: (next: FilterBarNumberFilter["value"]) => {
          store.set(atom, next);
          onChange?.(next);
        },
      };
    }
    case "enum": {
      const { atom, onChange, ...rest } = filter;
      return {
        ...rest,
        value: store.get(atom),
        onChange: (next: string) => {
          store.set(atom, next);
          onChange?.(next);
        },
      };
    }
    case "boolean": {
      const { atom, onChange, ...rest } = filter;
      return {
        ...rest,
        value: store.get(atom),
        onChange: (next: boolean) => {
          store.set(atom, next);
          onChange?.(next);
        },
      };
    }
  }
}

export function useJotaiFilterBarProps({
  search,
  filters,
  timeRange,
  dateRange,
  ...props
}: JotaiFilterBarProps): FilterBarProps {
  useJotaiFilterBarAtoms({ search, filters, timeRange, dateRange });
  const controlledSearch = useJotaiSearch(search);
  const controlledFilters = useJotaiFilters(filters);
  const controlledTimeRange = useJotaiRange(timeRange);
  const controlledDateRange = useJotaiRange(dateRange);

  return {
    ...props,
    ...(controlledSearch ? { search: controlledSearch } : {}),
    ...(controlledFilters ? { filters: controlledFilters } : {}),
    ...(controlledTimeRange ? { timeRange: controlledTimeRange } : {}),
    ...(controlledDateRange ? { dateRange: controlledDateRange } : {}),
  };
}
