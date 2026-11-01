import { describe, expect, it } from "vitest";
import { TrendChart } from "./TrendChart";
import { numAttr, renderStatic, rootSvg, texts } from "./chart.test-utils";

const X = ["2026-08-16", "2026-08-17", "2026-08-18"];
const SERIES = [
  { label: "runs", values: [3, 47, 120] },
  { label: "failures", values: [0, 5, 9] },
];

describe("TrendChart", () => {
  it("honours width and height on the svg and its viewBox", () => {
    const svg = rootSvg(renderStatic(<TrendChart height={180} legend={false} series={SERIES} width={360} x={X} />));
    expect([svg.getAttribute("width"), svg.getAttribute("height"), svg.getAttribute("viewBox")]).toEqual([
      "360",
      "180",
      "0 0 360 180",
    ]);
  });

  it("draws a y axis of nice ticks starting at 0", () => {
    const host = renderStatic(<TrendChart height={180} series={SERIES} width={360} x={X} />);
    expect(texts(host, '[data-role="y-tick"]')).toEqual(["0", "50", "100", "150"]);
  });

  it("formats y ticks with yFormat", () => {
    const host = renderStatic(<TrendChart height={180} series={SERIES} width={360} x={X} yFormat={(n) => `${n}ms`} />);
    expect(texts(host, '[data-role="y-tick"]')).toEqual(["0ms", "50ms", "100ms", "150ms"]);
  });

  it("spaces points evenly and maps them onto the y scale", () => {
    const host = renderStatic(<TrendChart height={180} series={SERIES} width={360} x={X} />);
    const points = (host.querySelector('[data-series="runs"] polyline')?.getAttribute("points") ?? "")
      .split(" ")
      .map((pair) => pair.split(",").map(Number) as [number, number]);
    expect(points).toHaveLength(3);
    const [[x0, y0], [x1, y1], [x2, y2]] = points as [[number, number], [number, number], [number, number]];
    expect(x1 - x0).toBeCloseTo(x2 - x1, 2);
    // y grows downward: (y0 - y1) / (y0 - y2) == (47 - 3) / (120 - 3)
    expect((y0 - y1) / (y0 - y2)).toBeCloseTo(44 / 117, 2);
  });

  it("formats ISO dates on the x axis by default and with xFormat when given", () => {
    const host = renderStatic(<TrendChart height={180} series={SERIES} width={360} x={X} />);
    expect(texts(host, '[data-role="x-label"]')).toEqual(["Aug 16", "Aug 17", "Aug 18"]);
    const custom = renderStatic(<TrendChart height={180} series={SERIES} width={360} x={X} xFormat={(x) => x.slice(8)} />);
    expect(texts(custom, '[data-role="x-label"]')).toEqual(["16", "17", "18"]);
  });

  it("thins crowded x labels", () => {
    const x = Array.from({ length: 60 }, (_, i) => `2026-0${1 + Math.floor(i / 28)}-${String((i % 28) + 1).padStart(2, "0")}`);
    const host = renderStatic(
      <TrendChart height={180} series={[{ label: "n", values: x.map((_, i) => i) }]} width={360} x={x} />,
    );
    const shown = Array.from(host.querySelectorAll('[data-role="x-label"]')).map((label) => numAttr(label, "x"));
    expect(shown.length).toBeGreaterThan(1);
    expect(shown.length).toBeLessThan(x.length);
    // "Jan 28" is 6 characters: at an 11px font at least 30px wide.
    shown.slice(1).forEach((pos, i) => expect(pos - shown[i]!).toBeGreaterThanOrEqual(30));
  });

  it("explains every x position in an SVG title", () => {
    const host = renderStatic(<TrendChart height={180} series={SERIES} width={360} x={X} />);
    expect(texts(host, '[data-role="hover"] > title')).toEqual([
      "Aug 16 — runs: 3 · failures: 0",
      "Aug 17 — runs: 47 · failures: 5",
      "Aug 18 — runs: 120 · failures: 9",
    ]);
  });

  it("fills the area only in the area variant", () => {
    const line = renderStatic(<TrendChart height={180} series={SERIES} width={360} x={X} />);
    expect(line.querySelectorAll('[data-mark="area"]')).toHaveLength(0);
    const area = renderStatic(<TrendChart height={180} series={SERIES} variant="area" width={360} x={X} />);
    expect(area.querySelectorAll('[data-mark="area"]')).toHaveLength(2);
  });

  it("strokes series with categorical tokens that carry hex fallbacks", () => {
    const host = renderStatic(<TrendChart height={180} series={SERIES} width={360} x={X} />);
    expect(Array.from(host.querySelectorAll("polyline")).map((line) => line.getAttribute("stroke"))).toEqual([
      "var(--chart-1, #0284c7)",
      "var(--chart-2, #d97706)",
    ]);
  });

  it("renders a legend for multiple series by default", () => {
    expect(texts(renderStatic(<TrendChart height={180} series={SERIES} width={360} x={X} />), "li")).toEqual([
      "runs",
      "failures",
    ]);
  });

  it("renders an explicit empty state", () => {
    const host = renderStatic(<TrendChart height={180} series={[]} width={360} x={[]} />);
    expect([numAttr(rootSvg(host), "width"), numAttr(rootSvg(host), "height")]).toEqual([360, 180]);
    expect(texts(host, "text")).toEqual(["No data"]);
  });

  it("fails loudly when a series does not align with x", () => {
    expect(() =>
      renderStatic(<TrendChart height={180} series={[{ label: "short", values: [1, 2] }]} width={360} x={X} />),
    ).toThrow(/short.*2 values.*3 x/);
  });
});
