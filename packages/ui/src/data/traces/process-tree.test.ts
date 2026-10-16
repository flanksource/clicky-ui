import { describe, expect, it } from "vitest";
import { processNodeRows, processSampleRows } from "./fixtures";
import {
  buildProcessForest,
  cpuSeriesByKey,
  flattenForest,
  formatCpuPercent,
  formatProcessTimestamp,
  processLifetimeMs,
  processSeries,
  pruneExitedProcesses,
  sparklinePoints,
} from "./process-tree";
import type { ProcessNodeRow } from "./types";

const node = (key: string, parentKey?: string, startedAt = "2026-10-01T09:00:00.000Z"): ProcessNodeRow => ({
  ...processNodeRows[0]!,
  key,
  pid: Number(key),
  isRoot: false,
  startedAt,
  ...(parentKey ? { parentKey } : {}),
});

describe("buildProcessForest", () => {
  it("nests processes under their parentKey and roots orphans whose parent was never recorded", () => {
    const forest = buildProcessForest(processNodeRows);
    expect(forest.map((root) => root.row.key)).toEqual(["100:1", "300:299"]);
    expect(forest[0]!.children.map((child) => child.row.key)).toEqual(["101:100"]);
    expect(forest[0]!.children[0]!.children.map((child) => child.row.key)).toEqual(["102:101"]);
    expect(forest[1]!.children).toEqual([]);
  });

  it("orders siblings by start time, then pid", () => {
    const forest = buildProcessForest([
      node("1"),
      node("4", "1", "2026-10-01T09:00:03.000Z"),
      node("3", "1", "2026-10-01T09:00:02.000Z"),
      node("2", "1", "2026-10-01T09:00:02.000Z"),
    ]);
    expect(forest[0]!.children.map((child) => child.row.key)).toEqual(["2", "3", "4"]);
  });

  it("marks a process exited by its status or its exit time", () => {
    const [root] = buildProcessForest([
      { ...node("1"), status: "exited" },
      { ...node("2", "1"), status: "running", exitedAt: "2026-10-01T09:00:05.000Z" },
      node("3", "1"),
    ]);
    expect(root!.exited).toBe(true);
    expect(root!.children.map((child) => child.exited)).toEqual([true, false]);
  });

  it("throws on a key recorded twice", () => {
    expect(() => buildProcessForest([node("1"), node("1")])).toThrow(/key "1" appears twice/);
  });

  it("throws on a parent cycle, which no root reaches", () => {
    expect(() => buildProcessForest([node("1", "2"), node("2", "1")])).toThrow(/cycle/);
    expect(() => buildProcessForest([node("1", "1")])).toThrow(/cycle/);
  });
});

describe("pruneExitedProcesses", () => {
  const exited = (key: string, parentKey?: string): ProcessNodeRow => ({ ...node(key, parentKey), status: "exited" });
  const keys = (forest: ReturnType<typeof buildProcessForest>) => flattenForest(forest).map((n) => n.row.key);

  it("drops an exited leaf but keeps live processes", () => {
    const pruned = pruneExitedProcesses(buildProcessForest([node("1"), exited("2", "1"), node("3", "1")]));
    expect(keys(pruned)).toEqual(["1", "3"]);
  });

  it("keeps an exited ancestor while it still has a live descendant", () => {
    const pruned = pruneExitedProcesses(buildProcessForest([exited("1"), exited("2", "1"), node("3", "2")]));
    expect(keys(pruned)).toEqual(["1", "2", "3"]);
    expect(pruned[0]!.exited).toBe(true);
  });

  it("drops a whole exited subtree with no live descendant", () => {
    const pruned = pruneExitedProcesses(buildProcessForest([node("1"), exited("2", "1"), exited("3", "2")]));
    expect(keys(pruned)).toEqual(["1"]);
  });

  it("returns an empty forest when every process has exited", () => {
    expect(pruneExitedProcesses(buildProcessForest([exited("1"), exited("2", "1")]))).toEqual([]);
  });

  it("does not modify the forest it was given", () => {
    const forest = buildProcessForest([node("1"), exited("2", "1")]);
    pruneExitedProcesses(forest);
    expect(forest[0]!.children).toHaveLength(1);
  });
});

describe("processLifetimeMs", () => {
  it("runs to the exit time when there is one, else to the last time the process was seen", () => {
    const base = node("1");
    expect(processLifetimeMs({ ...base, exitedAt: "2026-10-01T09:00:05.000Z" })).toBe(5000);
    expect(processLifetimeMs({ ...base, lastSeenAt: "2026-10-01T09:00:30.000Z" })).toBe(30000);
  });
});

describe("formatProcessTimestamp", () => {
  it("formats a timestamp as local YYYY-MM-DD HH:MM:SS", () => {
    expect(formatProcessTimestamp(new Date(2026, 9, 1, 9, 5, 7).toISOString())).toBe("2026-10-01 09:05:07");
  });

  it("returns text that is not a date unchanged", () => {
    expect(formatProcessTimestamp("not a time")).toBe("not a time");
  });
});

describe("processSeries", () => {
  it("returns one process's CPU and RSS in tick order", () => {
    const series = processSeries(
      [
        { ...processSampleRows[0]!, key: "a", tick: 2, cpuPercent: 20, rssBytes: 200 },
        { ...processSampleRows[0]!, key: "b", tick: 1, cpuPercent: 7, rssBytes: 70 },
        { ...processSampleRows[0]!, key: "a", tick: 1, cpuPercent: 10, rssBytes: 100 },
      ],
      "a",
    );
    expect(series).toEqual({ cpu: [10, 20], rss: [100, 200] });
  });

  it("leaves unknown CPU samples out of the CPU series but keeps their RSS", () => {
    const series = processSeries(
      [
        { ...processSampleRows[0]!, key: "a", tick: 1, cpuPercent: null, rssBytes: 100 },
        { ...processSampleRows[0]!, key: "a", tick: 2, cpuPercent: 30, rssBytes: 200 },
      ],
      "a",
    );
    expect(series).toEqual({ cpu: [30], rss: [100, 200] });
  });

  it("is empty for a process with no samples", () => {
    expect(processSeries(processSampleRows, "999:1")).toEqual({ cpu: [], rss: [] });
  });
});

describe("formatCpuPercent", () => {
  it.each([
    [null, "\u2014"],
    [undefined, "\u2014"],
    [0, "0.0%"],
    [123.456, "123.5%"],
  ])("formats %s as %s", (value, expected) => {
    expect(formatCpuPercent(value)).toBe(expected);
  });
});

describe("flattenForest", () => {
  it("lists nodes depth-first", () => {
    expect(flattenForest(buildProcessForest(processNodeRows)).map((n) => n.row.key)).toEqual([
      "100:1",
      "101:100",
      "102:101",
      "300:299",
    ]);
  });
});

describe("cpuSeriesByKey", () => {
  it("groups samples by process and orders each series by tick", () => {
    const series = cpuSeriesByKey([
      { ...processSampleRows[0]!, key: "a", tick: 2, cpuPercent: 20 },
      { ...processSampleRows[0]!, key: "b", tick: 1, cpuPercent: 7 },
      { ...processSampleRows[0]!, key: "a", tick: 1, cpuPercent: 10 },
    ]);
    expect(series.get("a")).toEqual([10, 20]);
    expect(series.get("b")).toEqual([7]);
  });
});

describe("sparklinePoints", () => {
  it("scales values into the box, the largest touching the top and zero the bottom", () => {
    expect(sparklinePoints([0, 50, 100], 40, 10)).toBe("0.0,10.0 20.0,5.0 40.0,0.0");
  });

  it("draws a flat zero series along the bottom", () => {
    expect(sparklinePoints([0, 0], 10, 10)).toBe("0.0,10.0 10.0,10.0");
  });

  it("needs two points to draw a line", () => {
    expect(sparklinePoints([5], 40, 10)).toBeUndefined();
  });
});
