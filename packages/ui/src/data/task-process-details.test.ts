import { describe, expect, it } from "vitest";
import { buildTaskProcessForest } from "./task-process-details";

describe("buildTaskProcessForest", () => {
  it("nests descendants while retaining orphans and breaking parent cycles", () => {
    const forest = buildTaskProcessForest([
      { pid: 10, ppid: 1, command: "root", isRoot: true, cpuPercent: 1, rssBytes: 2, vmsBytes: 3, openFiles: 4 },
      { pid: 11, ppid: 10, command: "child", cpuPercent: 1, rssBytes: 2, vmsBytes: 3, openFiles: 4 },
      { pid: 20, ppid: 999, command: "orphan", cpuPercent: 1, rssBytes: 2, vmsBytes: 3, openFiles: 4 },
      { pid: 30, ppid: 31, command: "cycle-a", cpuPercent: 1, rssBytes: 2, vmsBytes: 3, openFiles: 4 },
      { pid: 31, ppid: 30, command: "cycle-b", cpuPercent: 1, rssBytes: 2, vmsBytes: 3, openFiles: 4 },
    ]);

    expect(forest.map((node) => node.pid)).toEqual([10, 20, 30]);
    expect(forest[0]?.children?.map((node) => node.pid)).toEqual([11]);
    expect(forest[2]?.children?.map((node) => node.pid)).toEqual([31]);
    expect(forest[2]?.children?.[0]?.children).toEqual([]);
  });
});
