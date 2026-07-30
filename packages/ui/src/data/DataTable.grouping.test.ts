import { describe, expect, it } from "vitest";
import {
  groupRecords,
  isGroupCollapsedByDefault,
  type DataTableGroup,
} from "./DataTable.grouping";

type Row = { id: string; team: string; cost: number };

const ROWS: Row[] = [
  { id: "r1", team: "platform", cost: 30 },
  { id: "r2", team: "billing", cost: 10 },
  { id: "r3", team: "platform", cost: 5 },
  { id: "r4", team: "billing", cost: 40 },
];

const byTeam = (row: Row) => row.team;

function keysAndIds(groups: DataTableGroup<Row>[]) {
  return groups.map((group) => [group.key, group.rows.map((row) => row.id)]);
}

describe("groupRecords", () => {
  it("buckets rows by key in first-appearance order, preserving row order inside each group", () => {
    expect(keysAndIds(groupRecords(ROWS, byTeam))).toEqual([
      ["platform", ["r1", "r3"]],
      ["billing", ["r2", "r4"]],
    ]);
  });

  it("returns no groups for no rows and one group when every row shares a key", () => {
    expect(groupRecords([], byTeam)).toEqual([]);
    expect(keysAndIds(groupRecords(ROWS, () => "all"))).toEqual([
      ["all", ["r1", "r2", "r3", "r4"]],
    ]);
  });

  it("keeps every row exactly once even when the key varies per row", () => {
    const groups = groupRecords(ROWS, (row) => row.id);

    expect(groups).toHaveLength(ROWS.length);
    expect(groups.flatMap((group) => group.rows)).toEqual(ROWS);
  });
});

describe("isGroupCollapsedByDefault", () => {
  const [platform, billing] = groupRecords(ROWS, byTeam);

  it("expands by default, collapses all for true, and consults the predicate otherwise", () => {
    expect(isGroupCollapsedByDefault(platform, undefined)).toBe(false);
    expect(isGroupCollapsedByDefault(platform, true)).toBe(true);
    expect(
      isGroupCollapsedByDefault(platform, (key) => key === "billing"),
    ).toBe(false);
    expect(
      isGroupCollapsedByDefault(billing, (key) => key === "billing"),
    ).toBe(true);
  });

  it("passes the group's own rows to the predicate", () => {
    const totalOver = (limit: number) => (_key: string, rows: Row[]) =>
      rows.reduce((total, row) => total + row.cost, 0) > limit;

    expect(isGroupCollapsedByDefault(platform, totalOver(40))).toBe(false);
    expect(isGroupCollapsedByDefault(billing, totalOver(40))).toBe(true);
  });
});
