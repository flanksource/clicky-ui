import { describe, expect, it } from "vitest";
import { THREADS } from "../fixtures/threads";
import {
  baseThreadName,
  buildThreadTree,
  countThreadStates,
  dominantState,
  formatContention,
  formatThreadCpu,
  isDiagnosticsAgentThread,
  parseStateSet,
  parseThreadId,
  parseThreadSort,
  serializeStateSet,
  sortThreads,
  threadStackFileName,
  visibleThreads,
  withViewParam,
} from "./threads";

describe("baseThreadName", () => {
  it.each([
    ["http-nio-8080-exec-3", "http-nio-8080-exec"],
    ["pool#12", "pool"],
    ["CompilerThread0", "CompilerThread"],
    ["Gang worker#3 (Parallel GC Threads)", "(Parallel GC Threads)"],
    ["-1", "-1"],
    ["#3", "#3"],
    ["main", "main"],
    ["Reference Handler", "Reference Handler"],
  ])("%s → %s", (name, base) => {
    expect(baseThreadName(name)).toBe(base);
  });
});

describe("dominantState", () => {
  it("returns the most common state and the earliest on a tie", () => {
    expect(dominantState([{ id: 1, name: "a", state: "WAITING" }, { id: 2, name: "b", state: "RUNNABLE" }, { id: 3, name: "c", state: "RUNNABLE" }])).toBe("RUNNABLE");
    expect(dominantState([{ id: 1, name: "a", state: "WAITING" }, { id: 2, name: "b", state: "RUNNABLE" }])).toBe("WAITING");
    expect(dominantState([])).toBeUndefined();
  });
});

describe("buildThreadTree", () => {
  it("groups threads sharing a base name and collapses singletons to a leaf", () => {
    const tree = buildThreadTree(THREADS.filter((thread) => [1, 22, 23, 24, 25].includes(thread.id)));
    expect(
      tree.map((node) => ({ id: node.id, label: node.label, count: node.count, state: node.state, children: node.children?.map((child) => child.thread?.id) })),
    ).toEqual([
      { id: "t-1-main", label: "main", count: undefined, state: "WAITING", children: undefined },
      { id: "g-http-nio-8080-exec", label: "http-nio-8080-exec", count: 4, state: "BLOCKED", children: [22, 23, 24, 25] },
    ]);
  });

  it("keeps the input order of groups and members", () => {
    const tree = buildThreadTree([
      { id: 3, name: "b-2" },
      { id: 1, name: "a" },
      { id: 2, name: "b-1" },
    ]);
    expect(tree.map((node) => node.label)).toEqual(["b", "a"]);
    expect(tree[0]?.children?.map((child) => child.thread?.id)).toEqual([3, 2]);
  });
});

describe("sortThreads", () => {
  const rows = [
    { name: "worker-10", cpuPercent: 1 },
    { name: "worker-9", cpuPercent: 1 },
    { name: "idle", cpuPercent: null },
    { name: "hot", cpuPercent: 50 },
  ];

  it("puts the hottest first, ties by natural name, unsampled last", () => {
    expect(sortThreads(rows, "cpu").map((row) => row.name)).toEqual(["hot", "worker-9", "worker-10", "idle"]);
  });

  it("sorts names with numeric suffixes as numbers", () => {
    expect(sortThreads(rows, "name").map((row) => row.name)).toEqual(["hot", "idle", "worker-9", "worker-10"]);
  });

  it("does not mutate its input", () => {
    const copy = [...rows];
    sortThreads(rows, "cpu");
    expect(rows).toEqual(copy);
  });
});

describe("formatThreadCpu", () => {
  it("formats a sample to one decimal", () => {
    expect(formatThreadCpu({ cpuPercent: 42.54 }, true)).toEqual({ text: "42.5%" });
  });

  it("shows a dash with the reason, never 0%", () => {
    expect(formatThreadCpu({ cpuPercent: 3 }, false)).toMatchObject({ text: "—", title: expect.stringContaining("does not report") });
    expect(formatThreadCpu({ cpuPercent: null }, true)).toMatchObject({ text: "—", title: expect.stringContaining("No CPU sample") });
  });
});

describe("formatContention", () => {
  it("includes the time when it is monitored", () => {
    expect(formatContention(31, 4200)).toBe("31× · 4200 ms");
    expect(formatContention(0, 0)).toBe("0× · 0 ms");
  });

  it("says the time is not monitored when absent", () => {
    expect(formatContention(2, null)).toBe("2× (time not monitored)");
    expect(formatContention(2, undefined)).toBe("2× (time not monitored)");
  });
});

describe("isDiagnosticsAgentThread", () => {
  it.each([
    ["arthas-command-execute", true],
    ["Timer-for-arthas-dashboard", true],
    ["Attach Listener", true],
    ["http-nio-8080-exec-1", false],
    ["main", false],
  ])("%s → %s", (name, expected) => {
    expect(isDiagnosticsAgentThread(name)).toBe(expected);
  });
});

describe("visibleThreads", () => {
  it("hides agent threads by default and restricts to the selected states", () => {
    const names = (threads: typeof THREADS) => threads.map((thread) => thread.id);
    expect(names(visibleThreads(THREADS, { states: new Set(["BLOCKED"]), sort: "name", showAgent: false }))).toEqual([22, 23]);
    const runnable = visibleThreads(THREADS, { states: new Set(["RUNNABLE"]), sort: "cpu", showAgent: false });
    expect(names(runnable)).toEqual([21, 2, 4]);
    expect(names(visibleThreads(THREADS, { states: new Set(["RUNNABLE"]), sort: "cpu", showAgent: true }))).toEqual([21, 51, 11, 2, 4]);
  });
});

describe("countThreadStates", () => {
  it("counts per state", () => {
    expect([...countThreadStates(THREADS)]).toEqual([
      ["WAITING", 3],
      ["RUNNABLE", 5],
      ["BLOCKED", 2],
      ["TIMED_WAITING", 4],
    ]);
  });
});

describe("view state helpers", () => {
  it.each([
    ["22", 22],
    ["0", 0],
    ["abc", null],
    ["-3", null],
    ["2x", null],
    ["", null],
    [undefined, null],
  ])("parseThreadId(%j) → %j", (raw, expected) => {
    expect(parseThreadId(raw)).toBe(expected);
  });

  it("parses the sort, defaulting to cpu", () => {
    expect([parseThreadSort("name"), parseThreadSort("cpu"), parseThreadSort("bogus"), parseThreadSort(undefined)]).toEqual(["name", "cpu", "cpu", "cpu"]);
  });

  it("round-trips the state selection", () => {
    expect(serializeStateSet(parseStateSet("BLOCKED,RUNNABLE"))).toBe("BLOCKED,RUNNABLE");
    expect(parseStateSet(undefined).size).toBe(0);
    expect(parseStateSet("").size).toBe(0);
  });

  it("sets a param and drops it when emptied, keeping the others", () => {
    expect(withViewParam({ q: "x", thread: "3" }, "sort", "name")).toEqual({ q: "x", thread: "3", sort: "name" });
    expect(withViewParam({ q: "x", thread: "3" }, "q", "")).toEqual({ thread: "3" });
    expect(withViewParam({ q: "x" }, "q", "y")).toEqual({ q: "y" });
  });
});

describe("threadStackFileName", () => {
  it.each([
    [{ id: 22, name: "http-nio-8080-exec-2" }, "http-nio-8080-exec-2-22.txt"],
    [{ id: 41, name: "HikariPool-1 housekeeper" }, "hikaripool-1-housekeeper-41.txt"],
    [{ id: 7, name: "***" }, "thread-7.txt"],
  ])("%j → %s", (thread, expected) => {
    expect(threadStackFileName(thread)).toBe(expected);
  });
});
