import { describe, expect, it } from "vitest";
import { StackedBarChart } from "./StackedBarChart";
import { numAttr, renderStatic, rootSvg, texts } from "./chart.test-utils";

const CATEGORIES = ["Mon", "Tue"];
const SERIES = [
  { label: "passed", values: [2, 4] },
  { label: "failed", values: [3, 4] },
];

function stackLength(host: HTMLElement, category: string, axis: "width" | "height"): number {
  return Array.from(host.querySelectorAll(`[data-category="${category}"] [data-mark="bar"]`)).reduce(
    (sum, segment) => sum + numAttr(segment, axis),
    0,
  );
}

describe("StackedBarChart", () => {
  it("honours width and height on the svg and its viewBox", () => {
    const svg = rootSvg(renderStatic(<StackedBarChart categories={CATEGORIES} height={160} legend={false} series={SERIES} width={300} />));
    expect([svg.getAttribute("width"), svg.getAttribute("height"), svg.getAttribute("viewBox")]).toEqual([
      "300",
      "160",
      "0 0 300 160",
    ]);
  });

  it.each(["vertical", "horizontal"] as const)("stacks %s columns in proportion to their totals", (orientation) => {
    const host = renderStatic(
      <StackedBarChart categories={CATEGORIES} height={160} orientation={orientation} series={SERIES} width={300} />,
    );
    const axis = orientation === "vertical" ? "height" : "width";
    expect(stackLength(host, "Tue", axis) / stackLength(host, "Mon", axis)).toBeCloseTo(8 / 5, 2);
  });

  it("states each category total and each segment in SVG titles", () => {
    const host = renderStatic(<StackedBarChart categories={CATEGORIES} height={160} series={SERIES} width={300} />);
    expect(texts(host, "[data-category] > title")).toEqual(["Mon: total 5", "Tue: total 8"]);
    expect(texts(host, '[data-category="Mon"] [data-series] > title')).toEqual(["Mon · passed: 2", "Mon · failed: 3"]);
  });

  it("colours series from the categorical tokens with hex fallbacks", () => {
    const host = renderStatic(<StackedBarChart categories={CATEGORIES} height={160} series={SERIES} width={300} />);
    const fills = Array.from(host.querySelectorAll('[data-category="Mon"] [data-mark="bar"]')).map((bar) =>
      bar.getAttribute("fill"),
    );
    expect(fills).toEqual(["var(--chart-1, #0284c7)", "var(--chart-2, #d97706)"]);
  });

  it("shows a legend for two or more series and hides it on request", () => {
    const withLegend = renderStatic(<StackedBarChart categories={CATEGORIES} height={160} series={SERIES} width={300} />);
    expect(texts(withLegend, "li")).toEqual(["passed", "failed"]);
    const without = renderStatic(
      <StackedBarChart categories={CATEGORIES} height={160} legend={false} series={SERIES} width={300} />,
    );
    expect(without.querySelectorAll("li")).toHaveLength(0);
  });

  it("thins crowded category labels so the shown ones never overlap", () => {
    const categories = Array.from({ length: 40 }, (_, i) => `category-${String(i).padStart(2, "0")}`);
    const series = [{ label: "n", values: categories.map((_, i) => i + 1) }];
    const narrow = renderStatic(<StackedBarChart categories={categories} height={160} series={series} width={400} />);
    const shown = Array.from(narrow.querySelectorAll('[data-role="x-label"]')).map((label) => numAttr(label, "x"));
    expect(shown.length).toBeGreaterThan(1);
    expect(shown.length).toBeLessThan(categories.length);
    // 11 characters at an 11px font are at least 55px wide.
    shown.slice(1).forEach((x, i) => expect(x - shown[i]!).toBeGreaterThanOrEqual(55));

    const wide = renderStatic(<StackedBarChart categories={categories} height={160} series={series} width={4000} />);
    expect(wide.querySelectorAll('[data-role="x-label"]')).toHaveLength(categories.length);
  });

  it("renders an explicit empty state when there is nothing to stack", () => {
    const host = renderStatic(<StackedBarChart categories={[]} height={120} series={[]} width={300} />);
    const svg = rootSvg(host);
    expect([numAttr(svg, "width"), numAttr(svg, "height")]).toEqual([300, 120]);
    expect(texts(host, "text")).toEqual(["No data"]);
  });

  it("fails loudly when a series does not align with the categories", () => {
    expect(() =>
      renderStatic(<StackedBarChart categories={CATEGORIES} height={160} series={[{ label: "short", values: [1] }]} width={300} />),
    ).toThrow(/short.*1 values.*2 categories/);
  });
});
