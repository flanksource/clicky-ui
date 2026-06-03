import { describe, expect, it } from "vitest";
import { assignAxes, latestOf, mergeSeries, resolveBreakdown, resolveSeries } from "./TimeseriesPanel";

describe("resolveSeries", () => {
  it("normalises a single url into a one-element series", () => {
    const resolved = resolveSeries({ url: "/api/v1/metrics/sqlserver.cpu", title: "CPU" });
    expect(resolved).toHaveLength(1);
    expect(resolved[0].url).toBe("/api/v1/metrics/sqlserver.cpu");
    expect(resolved[0].transform).toBeUndefined();
  });

  it("joins baseUrl with each series id and assigns palette colors", () => {
    const resolved = resolveSeries({
      baseUrl: "/api/v1/metrics/",
      series: [{ id: "sqlserver.iops.read", label: "reads" }, { id: "sqlserver.iops.write" }],
      title: "IOPS",
    });
    expect(resolved.map((s) => s.url)).toEqual([
      "/api/v1/metrics/sqlserver.iops.read",
      "/api/v1/metrics/sqlserver.iops.write",
    ]);
    expect(resolved[0].label).toBe("reads");
    expect(resolved[1].label).toBe("sqlserver.iops.write");
    expect(resolved[0].color).not.toBe(resolved[1].color);
  });

  it("carries each series' instantaneous current value through", () => {
    const resolved = resolveSeries({
      baseUrl: "/m/",
      series: [{ id: "eden", current: 100 }, { id: "old" }],
      title: "Heap",
    });
    expect(resolved[0].current).toBe(100);
    expect(resolved[1].current).toBeUndefined();
  });

  it("resolves unit per-series, falling back to the panel default", () => {
    const resolved = resolveSeries({
      baseUrl: "/m/",
      unit: "short",
      series: [{ id: "process", unit: "percent" }, { id: "load" }],
      title: "CPU",
    });
    expect(resolved[0].unit).toBe("percent"); // series override
    expect(resolved[1].unit).toBe("short"); // panel default
  });

  it("leaves unit undefined when neither series nor panel sets one", () => {
    const resolved = resolveSeries({ url: "/m/x", title: "X" });
    expect(resolved[0].unit).toBeUndefined();
  });
});

describe("mergeSeries", () => {
  const series = resolveSeries({
    baseUrl: "/m/",
    series: [
      { id: "read", label: "reads" },
      { id: "write", label: "writes", transform: (v) => -v },
    ],
    title: "IOPS",
  });

  it("merges by timestamp and negates the mirrored series", () => {
    const rows = mergeSeries(series, [
      [
        { at: "2026-06-02T00:00:00Z", value: 3 },
        { at: "2026-06-02T00:00:05Z", value: 4 },
      ],
      [
        { at: "2026-06-02T00:00:00Z", value: 2 },
        { at: "2026-06-02T00:00:05Z", value: 5 },
      ],
    ]);

    expect(rows).toEqual([
      { at: "2026-06-02T00:00:00Z", read: 3, write: -2 },
      { at: "2026-06-02T00:00:05Z", read: 4, write: -5 },
    ]);
  });

  it("sorts rows ascending and leaves gaps for missing values", () => {
    const rows = mergeSeries(series, [
      [{ at: "2026-06-02T00:00:05Z", value: 4 }],
      [{ at: "2026-06-02T00:00:00Z", value: 2 }],
    ]);

    expect(rows.map((r) => r.at)).toEqual(["2026-06-02T00:00:00Z", "2026-06-02T00:00:05Z"]);
    expect(rows[0].read).toBeUndefined();
    expect(rows[0].write).toBe(-2);
    expect(rows[1].read).toBe(4);
    expect(rows[1].write).toBeUndefined();
  });
});

describe("resolveBreakdown", () => {
  const series = resolveSeries({
    baseUrl: "/m/",
    unit: "bytes",
    series: [
      { id: "eden", label: "Eden", color: "bg-emerald-500", current: 30 },
      { id: "old", label: "Old", color: "bg-rose-500", current: 10 },
    ],
    title: "Heap",
  });

  it("uses an explicit total as the percentage denominator", () => {
    const { items, total } = resolveBreakdown(series, [], 100);
    expect(total).toBe(100);
    expect(items.map((i) => i.percent)).toEqual([30, 10]);
    expect(items.map((i) => i.value)).toEqual([30, 10]);
  });

  it("defaults total to the sum of current values", () => {
    const { items, total } = resolveBreakdown(series, []);
    expect(total).toBe(40);
    expect(items.map((i) => i.percent)).toEqual([75, 25]);
  });

  it("falls back to the latest polled point when a series has no current value", () => {
    const polled = resolveSeries({
      baseUrl: "/m/",
      series: [{ id: "eden", label: "Eden" }],
      title: "Heap",
    });
    const { items } = resolveBreakdown(polled, [
      { at: "2026-06-02T00:00:00Z", eden: 5 },
      { at: "2026-06-02T00:00:05Z", eden: 12 },
    ]);
    expect(items[0].value).toBe(12);
  });

  it("yields zero percentages when the denominator is zero", () => {
    const empty = resolveSeries({
      baseUrl: "/m/",
      series: [{ id: "eden", current: 0 }, { id: "old", current: 0 }],
      title: "Heap",
    });
    const { items, total } = resolveBreakdown(empty, []);
    expect(total).toBe(0);
    expect(items.map((i) => i.percent)).toEqual([0, 0]);
  });
});

describe("assignAxes", () => {
  const mk = (defs: { id: string; unit?: string }[]) =>
    resolveSeries({ baseUrl: "/m/", series: defs, title: "T" });

  it("uses a single left axis when all series share one unit", () => {
    const { axes, axisOfKey } = assignAxes(mk([{ id: "a", unit: "percent" }, { id: "b", unit: "percent" }]));
    expect(axes.map((a) => a.orientation)).toEqual(["left"]);
    expect(axes[0].unit).toBe("percent");
    expect(axisOfKey.get("a")).toBe("left");
    expect(axisOfKey.get("b")).toBe("left");
  });

  it("assigns the first distinct unit left and the second right, in series order", () => {
    const { axes, axisOfKey } = assignAxes(mk([{ id: "a", unit: "percent" }, { id: "b", unit: "bytes" }]));
    expect(axes.map((a) => [a.orientation, a.unit])).toEqual([
      ["left", "percent"],
      ["right", "bytes"],
    ]);
    expect(axisOfKey.get("a")).toBe("left");
    expect(axisOfKey.get("b")).toBe("right");
  });

  it("keeps each unit's series on the same axis regardless of interleaving", () => {
    const { axisOfKey } = assignAxes(
      mk([{ id: "a", unit: "percent" }, { id: "b", unit: "bytes" }, { id: "c", unit: "percent" }]),
    );
    expect(axisOfKey.get("c")).toBe("left");
  });

  it("piles a third distinct unit onto the right axis without adding a third axis", () => {
    const { axes, axisOfKey } = assignAxes(
      mk([{ id: "a", unit: "percent" }, { id: "b", unit: "bytes" }, { id: "c", unit: "ms" }]),
    );
    expect(axes).toHaveLength(2);
    expect(axisOfKey.get("c")).toBe("right");
  });

  it("treats an undefined unit as its own bucket and still assigns it an axis", () => {
    const { axes, axisOfKey } = assignAxes(mk([{ id: "a" }, { id: "b", unit: "bytes" }]));
    expect(axes[0].unit).toBeUndefined();
    expect(axisOfKey.get("a")).toBe("left");
    expect(axisOfKey.get("b")).toBe("right");
  });
});

describe("latestOf", () => {
  it("returns the last numeric value for a key, skipping gaps", () => {
    expect(latestOf([{ at: "t1", a: 5 }, { at: "t2" }, { at: "t3", a: 9 }], "a")).toBe(9);
  });

  it("returns undefined when no numeric value exists", () => {
    expect(latestOf([{ at: "t1" }], "a")).toBeUndefined();
  });
});
