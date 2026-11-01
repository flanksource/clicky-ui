import { describe, expect, it } from "vitest";
import { Sparkline } from "./Sparkline";
import { numAttr, renderStatic, rootSvg, texts } from "./chart.test-utils";

const TREND = [42, 38, 45, 51, 47, 63];

describe("Sparkline", () => {
  it("honours width and height on the svg and its viewBox", () => {
    const svg = rootSvg(renderStatic(<Sparkline height={32} values={TREND} width={120} />));
    expect([svg.getAttribute("width"), svg.getAttribute("height"), svg.getAttribute("viewBox")]).toEqual([
      "120",
      "32",
      "0 0 120 32",
    ]);
  });

  it("plots one point per value, inside the box, with the maximum highest", () => {
    const host = renderStatic(<Sparkline height={32} values={TREND} width={120} />);
    const points = (host.querySelector("polyline")?.getAttribute("points") ?? "")
      .split(" ")
      .map((pair) => pair.split(",").map(Number) as [number, number]);
    expect(points).toHaveLength(TREND.length);
    points.forEach(([x, y]) => {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(120);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(32);
    });
    const highest = points.reduce((best, point, index) => (point[1] < points[best]![1] ? index : best), 0);
    expect(highest).toBe(TREND.indexOf(Math.max(...TREND)));
  });

  it("marks the latest point", () => {
    const host = renderStatic(<Sparkline height={32} values={TREND} width={120} />);
    const marker = host.querySelector("circle");
    const last = (host.querySelector("polyline")?.getAttribute("points") ?? "").split(" ").at(-1);
    expect(marker && `${numAttr(marker, "cx")},${numAttr(marker, "cy")}`).toBe(last);
  });

  it("defaults to the first categorical token with a hex fallback, and honours color", () => {
    expect(renderStatic(<Sparkline height={32} values={TREND} width={120} />).querySelector("polyline")?.getAttribute("stroke")).toBe(
      "var(--chart-1, #0284c7)",
    );
    expect(
      renderStatic(<Sparkline color="#123456" height={32} values={TREND} width={120} />)
        .querySelector("polyline")
        ?.getAttribute("stroke"),
    ).toBe("#123456");
  });

  it("summarises the range in an SVG title", () => {
    expect(texts(renderStatic(<Sparkline height={32} values={TREND} width={120} />), "svg > title")).toEqual([
      "42 → 63 (min 38, max 63)",
    ]);
  });

  it("renders an explicit empty state", () => {
    const host = renderStatic(<Sparkline height={32} values={[]} width={120} />);
    expect([numAttr(rootSvg(host), "width"), numAttr(rootSvg(host), "height")]).toEqual([120, 32]);
    expect(texts(host, "text")).toEqual(["No data"]);
  });

  it("draws a single value as a lone marker", () => {
    const host = renderStatic(<Sparkline height={32} values={[7]} width={120} />);
    expect(host.querySelectorAll("polyline")).toHaveLength(0);
    expect(host.querySelectorAll("circle")).toHaveLength(1);
  });
});
