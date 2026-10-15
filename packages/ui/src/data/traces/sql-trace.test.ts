import { describe, expect, it } from "vitest";
import { sqlStatementRows } from "./fixtures";
import { formatStatementDuration, groupStatements } from "./sql-trace";

describe("formatStatementDuration", () => {
  it.each([
    [0.9, "0.9 ms"],
    [2, "2 ms"],
    [12.5, "12.5 ms"],
    [12.04, "12 ms"],
    [250, "250 ms"],
    [1500, "1.5 s"],
  ])("formats %s ms as %s", (ms, expected) => {
    expect(formatStatementDuration(ms)).toBe(expected);
  });
});

describe("groupStatements", () => {
  it("collapses statements sharing a repeatKey into one row, in order of first appearance", () => {
    const rows = groupStatements(sqlStatementRows, { group: true });
    expect(rows.map((row) => [row.op, row.count])).toEqual([
      ["SELECT", 3],
      ["UPDATE", 1],
      ["INSERT", 1],
    ]);
  });

  it("sums the duration of a group and keeps its first start time", () => {
    const [group] = groupStatements(sqlStatementRows, { group: true });
    expect(group!.durationMs).toBeCloseTo(1.8 + 2.4 + 2.1);
    expect(group!.startedAt).toBe("2026-10-01T09:00:00.000Z");
  });

  it("sums the rows a group returned, ignoring statements whose driver could not tell", () => {
    const [group] = groupStatements(sqlStatementRows, { group: true });
    expect(group!.rows).toBe(2);
    const [, , insert] = groupStatements(sqlStatementRows, { group: true });
    expect(insert!.rows).toBe(-1);
  });

  it("keeps every execution of a group for the detail view", () => {
    const [group] = groupStatements(sqlStatementRows, { group: true });
    expect(group!.occurrences.map((o) => o.args)).toEqual([[41], [42], [43]]);
  });

  it("lists every statement when grouping is off", () => {
    const rows = groupStatements(sqlStatementRows, { group: false });
    expect(rows).toHaveLength(sqlStatementRows.length);
    expect(rows.every((row) => row.count === 1)).toBe(true);
  });

  it("never groups statements without a repeatKey", () => {
    const blank = sqlStatementRows.map((row) => ({ ...row, repeatKey: "" }));
    expect(groupStatements(blank, { group: true })).toHaveLength(blank.length);
  });

  it("carries the first error of a group and how many executions failed", () => {
    const failing = [
      { ...sqlStatementRows[0]!, error: "deadlock" },
      { ...sqlStatementRows[1]! },
      { ...sqlStatementRows[2]!, error: "timeout" },
    ];
    const [group] = groupStatements(failing, { group: true });
    expect(group).toMatchObject({ error: "deadlock", failed: 2, count: 3 });
  });

  it("gives every row a stable id", () => {
    const ids = groupStatements(sqlStatementRows, { group: false }).map((row) => row.id);
    expect(new Set(ids).size).toBe(sqlStatementRows.length);
  });
});
