import { describe, expect, it } from "vitest";
import {
  defaultCommandFilter,
  filterCommandGroups,
  firstEnabledIndex,
  flattenCommands,
  lastEnabledIndex,
  nextEnabledIndex,
  type CommandGroup,
  type CommandItem,
} from "./CommandPalette.model";

function item(id: string, label: string, extra: Partial<CommandItem> = {}): CommandItem {
  return { id, label, ...extra };
}

function idsOf(groups: CommandGroup[]): string[] {
  return flattenCommands(groups).map((entry) => entry.id);
}

const GROUPS: CommandGroup[] = [
  {
    id: "navigate",
    heading: "Navigate",
    items: [
      item("widgets", "Widgets", { description: "Browse the widget inventory" }),
      item("orders", "Orders", { keywords: ["invoice", "purchase"] }),
    ],
  },
  {
    id: "actions",
    heading: "Actions",
    items: [
      item("new-widget", "New widget"),
      item("archive", "Archive selection", { disabled: true }),
    ],
  },
];

describe("defaultCommandFilter", () => {
  it("ranks a label prefix above a mid-label hit", () => {
    const prefix = defaultCommandFilter(item("a", "Order history"), "order");
    const middle = defaultCommandFilter(item("b", "Recent orders"), "order");

    expect(prefix).toBeGreaterThan(middle);
  });

  it("ranks a label hit above a description hit", () => {
    const label = defaultCommandFilter(item("a", "Widgets"), "widget");
    const description = defaultCommandFilter(
      item("b", "Inventory", { description: "All widgets" }),
      "widget",
    );

    expect(label).toBeGreaterThan(description);
  });

  it("ranks a description hit above a keyword-only hit", () => {
    const description = defaultCommandFilter(
      item("a", "Inventory", { description: "All widgets" }),
      "widget",
    );
    const keyword = defaultCommandFilter(
      item("b", "Inventory", { keywords: ["widget"] }),
      "widget",
    );

    expect(description).toBeGreaterThan(keyword);
  });

  it("scores a non-match at zero", () => {
    expect(defaultCommandFilter(item("a", "Widgets"), "zzz")).toBe(0);
  });

  it("keeps every item for a blank query", () => {
    expect(defaultCommandFilter(item("a", "Widgets"), "   ")).toBeGreaterThan(0);
  });
});

describe("filterCommandGroups", () => {
  it("returns every group untouched for a blank query", () => {
    expect(filterCommandGroups(GROUPS, "")).toEqual(GROUPS);
  });

  it("drops groups whose items all fail to match", () => {
    const result = filterCommandGroups(GROUPS, "widget");

    expect(result.map((group) => group.id)).toEqual(["navigate", "actions"]);
    expect(result[0]?.items.map((entry) => entry.id)).toEqual(["widgets"]);
    expect(result[1]?.items.map((entry) => entry.id)).toEqual(["new-widget"]);
  });

  it("removes a group entirely when nothing in it matches", () => {
    const result = filterCommandGroups(GROUPS, "invoice");

    expect(result.map((group) => group.id)).toEqual(["navigate"]);
    expect(result[0]?.items.map((entry) => entry.id)).toEqual(["orders"]);
  });

  it("preserves group order even when a later group ranks higher", () => {
    const result = filterCommandGroups(GROUPS, "new widget");

    expect(result.map((group) => group.id)).toEqual(["actions"]);
  });

  it("applies a per-group limit after filtering", () => {
    const groups: CommandGroup[] = [
      { id: "g", items: [item("a", "Alpha"), item("b", "Alpha two"), item("c", "Alpha three")], limit: 2 },
    ];

    expect(filterCommandGroups(groups, "alpha")[0]?.items).toHaveLength(2);
  });

  it("passes groups through unfiltered when filter is false", () => {
    const result = filterCommandGroups(GROUPS, "no-such-command", false);

    expect(result).toEqual(GROUPS);
  });

  it("honours a custom scorer", () => {
    const onlyOrders = filterCommandGroups(GROUPS, "anything", (entry) => entry.id === "orders");

    expect(idsOf(onlyOrders)).toEqual(["orders"]);
  });
});

describe("nextEnabledIndex", () => {
  const items = flattenCommands(GROUPS); // widgets, orders, new-widget, archive(disabled)

  it("advances to the next row", () => {
    expect(nextEnabledIndex(items, 0, 1)).toBe(1);
  });

  it("skips a disabled row when moving forward", () => {
    // index 3 is disabled, so forward from 2 wraps past it to 0
    expect(nextEnabledIndex(items, 2, 1)).toBe(0);
  });

  it("skips a disabled row when moving backward", () => {
    expect(nextEnabledIndex(items, 0, -1)).toBe(2);
  });

  it("wraps from the last enabled row to the first", () => {
    expect(nextEnabledIndex(items, 2, 1)).toBe(0);
  });

  it("returns -1 when nothing is selectable", () => {
    expect(nextEnabledIndex([item("x", "X", { disabled: true })], 0, 1)).toBe(-1);
  });

  it("returns -1 for an empty list", () => {
    expect(nextEnabledIndex([], 0, 1)).toBe(-1);
  });
});

describe("firstEnabledIndex / lastEnabledIndex", () => {
  it("finds the first and last selectable rows", () => {
    const items = flattenCommands(GROUPS);

    expect(firstEnabledIndex(items)).toBe(0);
    expect(lastEnabledIndex(items)).toBe(2);
  });

  it("returns -1 when every row is disabled", () => {
    const items = [item("a", "A", { disabled: true }), item("b", "B", { disabled: true })];

    expect(firstEnabledIndex(items)).toBe(-1);
    expect(lastEnabledIndex(items)).toBe(-1);
  });
});
