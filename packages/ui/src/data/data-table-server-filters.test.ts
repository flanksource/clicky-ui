import { describe, expect, it, vi } from "vitest";
import type {
  FilterBarDateRangeFilter,
  FilterBarMultiFilter,
  FilterBarNumberFilter,
  FilterBarTextFilter,
} from "./../components/FilterBar";
import type { DataTableFilterSelection } from "./data-table-filter-values";
import {
  DATA_TABLE_FILTER_LOOKUP_LIMIT,
  serverColumnsToDataTableColumns,
  serverFiltersToFilterBar,
  type DataTableServerColumn,
} from "./data-table-server-filters";

const terms = (name: string): DataTableServerColumn => ({
  name,
  filterKey: name,
  filter: { kind: "terms", lookup: true },
});

/** Collects what the builder wrote back, the way a host's setState would. */
function capture(initial: DataTableFilterSelection = {}) {
  const state = { current: initial };
  const setValues = (update: unknown) => {
    state.current =
      typeof update === "function"
        ? (update as (prev: DataTableFilterSelection) => DataTableFilterSelection)(state.current)
        : (update as DataTableFilterSelection);
  };
  return { state, setValues };
}

describe("serverColumnsToDataTableColumns", () => {
  it("keeps the source's column order", () => {
    const columns = serverColumnsToDataTableColumns([
      { name: "zulu" },
      { name: "alpha" },
      { name: "mike" },
    ]);
    expect(columns.map((column) => column.key)).toEqual(["zulu", "alpha", "mike"]);
  });

  // A raw result set has names no path resolver can read, so every column is
  // addressed by a literal accessor rather than by walking dots.
  it("reads a dotted name as one literal key", () => {
    const [column] = serverColumnsToDataTableColumns<Record<string, unknown>>([
      { name: "payload.user" },
    ]);
    expect(column!.accessor!({ "payload.user": "ada", payload: { user: "nope" } })).toBe("ada");
  });

  it("gives an unnamed column a key of its own", () => {
    const [column] = serverColumnsToDataTableColumns([{ name: "" }]);
    expect(column!.key).toBe("column-0");
  });

  // A described result is filtered by the source; generating a second set of
  // filters from one loaded page would narrow rows the source already returned.
  it("never marks a described column client-filterable", () => {
    const columns = serverColumnsToDataTableColumns([terms("region")]);
    expect(columns[0]!.filterable).toBe(false);
    expect(columns[0]!.filterKey).toBe("region");
  });
});

describe("serverFiltersToFilterBar", () => {
  it("maps each kind to the control that edits it", () => {
    const { setValues } = capture();
    const config = serverFiltersToFilterBar(
      [
        terms("region"),
        { name: "latency", filterKey: "latency", filter: { kind: "range", min: 0, max: 900 } },
        { name: "deleted", filterKey: "deleted", filter: { kind: "boolean" } },
        { name: "message", filterKey: "message", filter: { kind: "text" } },
      ],
      {},
      setValues,
    );
    expect(config.filters.map((filter) => filter.kind)).toEqual([
      "multi",
      "number",
      "tristate",
      "text",
    ]);
  });

  // The bar has one range slot, so a time column is hoisted out of the pill
  // list rather than rendered as a pill that cannot open the range picker.
  it("hoists a time column into the range slot", () => {
    const { setValues } = capture();
    const config = serverFiltersToFilterBar(
      [terms("region"), { name: "created", filterKey: "created", filter: { kind: "time" } }],
      { created: ">=now-1h" },
      setValues,
    );
    expect(config.filters).toHaveLength(1);
    expect(config.timeRange?.from).toBe("now-1h");
  });

  it("writes a value selection back in the wire form", () => {
    const { state, setValues } = capture();
    const config = serverFiltersToFilterBar([terms("region")], {}, setValues);
    (config.filters[0] as FilterBarMultiFilter).onChange({
      "us-east": "include",
      eu: "exclude",
    });
    expect(state.current).toEqual({ region: "us-east,!eu" });
  });

  it("writes bounds with the operators the grammar reads back", () => {
    const { state, setValues } = capture();
    const config = serverFiltersToFilterBar(
      [{ name: "latency", filterKey: "latency", filter: { kind: "range" } }],
      {},
      setValues,
    );
    (config.filters[0] as FilterBarNumberFilter).onChange({ min: "100", max: "500" });
    expect(state.current).toEqual({ latency: ">=100,<=500" });
  });

  it("reads bounds back whichever operator they arrived with", () => {
    const { setValues } = capture();
    const config = serverFiltersToFilterBar(
      [{ name: "latency", filterKey: "latency", filter: { kind: "range" } }],
      { latency: ">100,<500" },
      setValues,
    );
    expect((config.filters[0] as FilterBarNumberFilter).value).toEqual({
      min: "100",
      max: "500",
    });
  });

  // An absent key and a key holding "" would send different query strings for
  // the same "nothing selected".
  it("drops a filter's key once it is cleared", () => {
    const { state, setValues } = capture({ region: "eu" });
    const config = serverFiltersToFilterBar([terms("region")], state.current, setValues);
    (config.filters[0] as FilterBarMultiFilter).onChange({});
    expect(state.current).toEqual({});
  });

  it("asks the loader for a bounded head of the set", async () => {
    const lookupValues = vi.fn().mockResolvedValue({ options: [{ value: "eu", count: 3 }] });
    const { setValues } = capture();
    const config = serverFiltersToFilterBar([terms("region")], {}, setValues, { lookupValues });

    const options = await (config.filters[0] as FilterBarMultiFilter).onSearch!("e");
    expect(lookupValues).toHaveBeenCalledWith({
      filterKey: "region",
      search: "e",
      limit: DATA_TABLE_FILTER_LOOKUP_LIMIT,
    });
    expect(options).toEqual([{ value: "eu", label: "eu", title: "eu · 3" }]);
  });

  it("offers no type-ahead for a filter the source cannot enumerate", () => {
    const lookupValues = vi.fn();
    const { setValues } = capture();
    const config = serverFiltersToFilterBar(
      [{ name: "region", filterKey: "region", filter: { kind: "terms" } }],
      {},
      setValues,
      { lookupValues },
    );
    expect((config.filters[0] as FilterBarMultiFilter).onSearch).toBeUndefined();
  });

  it("applies the caller's decorators", () => {
    const { setValues } = capture();
    const config = serverFiltersToFilterBar([terms("region")], {}, setValues, {
      extensions: [(filter) => ({ ...filter, label: `${filter.label} (scoped)` })],
    });
    expect(config.filters[0]!.label).toBe("Region (scoped)");
  });

  describe("refuses a filter it cannot address", () => {
    it("when the column names no filter key", () => {
      const { setValues } = capture();
      expect(() =>
        serverFiltersToFilterBar([{ name: "region", filter: { kind: "terms" } }], {}, setValues),
      ).toThrow(/no filterKey/);
    });

    it("when two columns claim one filter key", () => {
      const { setValues } = capture();
      expect(() =>
        serverFiltersToFilterBar(
          [terms("region"), { ...terms("area"), filterKey: "region" }],
          {},
          setValues,
        ),
      ).toThrow(/both filter through region/);
    });

  });

  describe("time columns", () => {
    const created = { name: "created", filterKey: "created", filter: { kind: "time" as const } };
    const updated = { name: "updated", filterKey: "updated", filter: { kind: "time" as const } };

    it("gives the bar's range control to the first time column", () => {
      const { setValues } = capture();
      const config = serverFiltersToFilterBar([created], { created: ">=now-24h" }, setValues);
      expect(config.timeRange).toMatchObject({ from: "now-24h", timeEnabled: true });
      expect(config.filters).toHaveLength(0);
    });

    // A raw SELECT commonly returns created_at beside updated_at; refusing the
    // second one used to throw during render and cost the whole bar.
    it("renders a second time column as a date-range filter rather than refusing it", () => {
      const { setValues } = capture();
      const config = serverFiltersToFilterBar(
        [created, updated],
        { updated: ">=2026-01-01,<=2026-02-01" },
        setValues,
      );
      expect(config.timeRange).toBeDefined();
      expect(config.filters).toHaveLength(1);
      expect(config.filters[0]).toMatchObject({
        key: "updated",
        kind: "date-range",
        label: "Updated",
        from: "2026-01-01",
        to: "2026-02-01",
      });
    });

    it("writes a second time column's range back under its own key", () => {
      const { setValues, state } = capture();
      const config = serverFiltersToFilterBar([created, updated], {}, setValues);
      (config.filters[0] as FilterBarDateRangeFilter).onApply("now-7d", "now");
      expect(state.current).toEqual({ updated: ">=now-7d,<=now" });
    });
  });

  // A dropdown that opens empty is a control the user cannot use. This is what
  // a UUID column gets: exact values, typed rather than picked.
  it("renders a terms filter with nothing to enumerate as a typed input", () => {
    const { setValues, state } = capture();
    const config = serverFiltersToFilterBar(
      [{ name: "id", filterKey: "id", filter: { kind: "terms", lookup: false } }],
      {},
      setValues,
    );
    expect(config.filters[0]).toMatchObject({ key: "id", kind: "text", value: "" });
    (config.filters[0] as FilterBarTextFilter).onChange("6ba7b810-9dad-11d1-80b4-00c04fd430c8");
    expect(state.current).toEqual({ id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8" });
  });
});
