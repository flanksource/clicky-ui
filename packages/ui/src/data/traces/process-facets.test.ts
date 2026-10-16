import { describe, expect, it } from "vitest";
import { armedFacets, diskSeries, facetCountSeries, latestFacetReading } from "./process-facets";
import type { ProcessDescriptor, ProcessSampleRow } from "./types";

const file = (name: string): ProcessDescriptor => ({ fd: "3", type: "REG", name });
const sample = (tick: number, extra: Partial<ProcessSampleRow> = {}, key = "1:0"): ProcessSampleRow => ({
  sampledAt: `2026-10-01T09:00:0${tick}.000Z`,
  tick,
  key,
  pid: 1,
  memoryPercent: 1,
  rssBytes: 1,
  ...extra,
});

describe("armedFacets", () => {
  it("is empty when no sample carries a count", () => {
    expect(armedFacets([sample(1), sample(2)])).toEqual([]);
  });

  it("includes exactly the facets some sample carries a count for, in tab order, even a zero count", () => {
    const samples = [sample(1, { connections: 0 }), sample(2, { openFiles: 3 }, "2:1")];
    expect(armedFacets(samples)).toEqual(["openFiles", "connections"]);
  });

  it("does not treat a stored list without a count as armed", () => {
    expect(armedFacets([sample(1, { portList: [file("x")] })])).toEqual([]);
  });
});

describe("facetCountSeries", () => {
  it("is one process's counts in tick order, whatever order the rows arrive in", () => {
    const samples = [sample(3, { sockets: 5 }), sample(1, { sockets: 1 }), sample(2, { sockets: 2 }), sample(2, { sockets: 9 }, "other:1")];
    expect(facetCountSeries(samples, "1:0", "sockets")).toEqual([1, 2, 5]);
  });

  it("skips ticks that carry no count", () => {
    expect(facetCountSeries([sample(1, { ports: 1 }), sample(2), sample(3, { ports: 0 })], "1:0", "ports")).toEqual([1, 0]);
  });
});

describe("latestFacetReading", () => {
  const early = [file("a")];
  const late = [file("a"), file("b")];

  it("is the list on the latest row that carries one, with that row's time", () => {
    const samples = [
      sample(1, { openFiles: 1, openFileList: early }),
      sample(2, { openFiles: 1 }),
      sample(3, { openFiles: 2, openFileList: late }),
      sample(4, { openFiles: 2 }),
    ];
    expect(latestFacetReading(samples, "1:0", "openFiles")).toEqual({ rows: late, readAt: "2026-10-01T09:00:03.000Z" });
  });

  it("is the first stored list when it never changed", () => {
    const samples = [sample(1, { ports: 1, portList: early }), sample(2, { ports: 1 }), sample(3, { ports: 1 })];
    expect(latestFacetReading(samples, "1:0", "ports")?.readAt).toBe("2026-10-01T09:00:01.000Z");
  });

  it("resolves per process", () => {
    const samples = [sample(1, { sockets: 1, socketList: early }), sample(2, { sockets: 1, socketList: late }, "other:1")];
    expect(latestFacetReading(samples, "1:0", "sockets")?.rows).toBe(early);
  });

  it("ends a non-empty list with an empty one when a later count is zero and no list was stored", () => {
    const samples = [sample(1, { sockets: 1, socketList: early }), sample(2, { sockets: 0 }), sample(3, { sockets: 0 })];
    expect(latestFacetReading(samples, "1:0", "sockets")).toEqual({ rows: [], readAt: "2026-10-01T09:00:02.000Z" });
  });

  it("is an empty list from the first zero count when nothing was ever stored", () => {
    const samples = [sample(1, { sockets: 0 }), sample(2, { sockets: 0 })];
    expect(latestFacetReading(samples, "1:0", "sockets")).toEqual({ rows: [], readAt: "2026-10-01T09:00:01.000Z" });
  });

  it("is undefined when the process has no stored list and no zero count", () => {
    expect(latestFacetReading([sample(1, { sockets: 2 })], "1:0", "sockets")).toBeUndefined();
    expect(latestFacetReading([], "1:0", "sockets")).toBeUndefined();
  });
});

describe("diskSeries", () => {
  it("is one process's cumulative read and write bytes in tick order", () => {
    const samples = [
      sample(2, { diskReadBytes: 20, diskWriteBytes: 4 }),
      sample(1, { diskReadBytes: 10, diskWriteBytes: 1 }),
      sample(1, { diskReadBytes: 99, diskWriteBytes: 99 }, "other:1"),
    ];
    expect(diskSeries(samples, "1:0")).toEqual({ read: [10, 20], write: [1, 4] });
  });

  it("is empty for samples without disk IO", () => {
    expect(diskSeries([sample(1)], "1:0")).toEqual({ read: [], write: [] });
  });
});
