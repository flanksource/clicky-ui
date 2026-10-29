import { describe, expect, it } from "vitest";
import { gcStatistics, memorySegments, validateWorkloadPanel } from "./model";
import { workloadPanelExample } from "./fixtures";

describe("workload panel calculations", () => {
  it("uses the supplied observation window for GC overhead", () => {
    expect(
      gcStatistics(
        {
          count: 2,
          timeMs: 100,
          p90Ms: 55,
          p95Ms: 60,
          maxMs: 70,
          percentP90: 12,
          percentP95: 15,
        },
        1000,
      ),
    ).toEqual({ averageMs: 50, percentage: 10 });
  });

  it("does not invent a mean when no collections occurred", () => {
    expect(
      gcStatistics(
        {
          count: 0,
          timeMs: 0,
          p90Ms: 0,
          p95Ms: 0,
          maxMs: 0,
          percentP90: 0,
          percentP95: 0,
        },
        1000,
      ),
    ).toEqual({ averageMs: undefined, percentage: 0 });
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects invalid observation window %s",
    (window) => {
      expect(() =>
        validateWorkloadPanel({
          ...workloadPanelExample,
          observationWindowMs: window,
        }),
      ).toThrow("observationWindowMs");
    },
  );

  it("accounts for native memory without counting the heap twice", () => {
    const result = memorySegments({
      memory: workloadPanelExample.memory,
      jvm: workloadPanelExample.jvm,
    });
    expect(
      result.segments.map(({ label, count }) => [label, count / 1024 ** 2]),
    ).toEqual([
      ["Eden", 640],
      ["Survivor", 96],
      ["Old Gen", 1722],
      ["Metaspace", 224],
      ["Code Cache", 116],
      ["Direct Buffers", 384],
      ["Other native", 504],
    ]);
    expect(result.scale).toBe(8192 * 1024 ** 2);
  });

  it("splits the stack into heap regions on the heap limit and non-heap plus native memory on the process limit", () => {
    const heap = memorySegments({
      memory: workloadPanelExample.memory,
      jvm: workloadPanelExample.jvm,
      part: "heap",
    });
    expect(heap.segments.map(({ label }) => label)).toEqual([
      "Eden",
      "Survivor",
      "Old Gen",
    ]);
    expect(heap.usage).toBe(workloadPanelExample.jvm.heap.average);
    expect(heap.scale).toBe(workloadPanelExample.jvm.heap.limit);
    const nonHeap = memorySegments({
      memory: workloadPanelExample.memory,
      jvm: workloadPanelExample.jvm,
      part: "nonHeap",
    });
    expect(
      nonHeap.segments.map(({ label, count }) => [label, count / 1024 ** 2]),
    ).toEqual([
      ["Metaspace", 224],
      ["Code Cache", 116],
      ["Direct Buffers", 384],
      ["Other native", 504],
    ]);
    expect(nonHeap.usage / 1024 ** 2).toBe(224 + 116 + 384 + 504);
    expect(nonHeap.scale).toBe(8192 * 1024 ** 2);
  });

  it("expands the stack scale for usage above its configured limit", () => {
    const result = memorySegments({
      memory: { ...workloadPanelExample.memory, limit: 1024 },
      jvm: workloadPanelExample.jvm,
    });
    expect(result.scale).toBe(workloadPanelExample.memory.average);
  });

  it("rejects inconsistent region accounting", () => {
    expect(() =>
      memorySegments({
        memory: workloadPanelExample.memory,
        jvm: {
          ...workloadPanelExample.jvm,
          regions: { ...workloadPanelExample.jvm.regions, old: 0 },
        },
      }),
    ).toThrow("Heap regions must sum");
    expect(() =>
      memorySegments({
        memory: { ...workloadPanelExample.memory, average: 1024 },
        jvm: workloadPanelExample.jvm,
      }),
    ).toThrow("exceed reported memory");
  });

  it.each([
    { ...workloadPanelExample.jvm.gc, count: 0 },
    { ...workloadPanelExample.jvm.gc, p90Ms: 500 },
    { ...workloadPanelExample.jvm.gc, timeMs: Number.NaN },
    { ...workloadPanelExample.jvm.gc, percentP90: 0.5 },
    { ...workloadPanelExample.jvm.gc, percentP95: 101 },
  ])("rejects inconsistent GC readings", (gc) => {
    expect(() =>
      gcStatistics(gc, workloadPanelExample.observationWindowMs),
    ).toThrow();
  });

  it("rejects invalid observations and impossible thread counts", () => {
    expect(() =>
      validateWorkloadPanel({
        ...workloadPanelExample,
        cpu: { ...workloadPanelExample.cpu, average: -1 },
      }),
    ).toThrow("cpu.average");
    expect(() =>
      validateWorkloadPanel({
        ...workloadPanelExample,
        jvm: {
          ...workloadPanelExample.jvm,
          threads: { ...workloadPanelExample.jvm.threads, blocked: 97 },
        },
      }),
    ).toThrow("Thread counts require");
  });
});
