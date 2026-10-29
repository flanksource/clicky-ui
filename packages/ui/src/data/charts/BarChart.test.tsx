import { describe, expect, it } from "vitest";
import { BarChart } from "./BarChart";
import { numAttr, renderStatic, rootSvg, texts } from "./chart.test-utils";

const SERVICES = [
  { label: "s3", value: 200 },
  { label: "iam", value: 100 },
  { label: "ec2", value: 50 },
];

function barLengths(host: HTMLElement, axis: "width" | "height"): number[] {
  return Array.from(host.querySelectorAll('[data-mark="bar"]')).map((bar) => numAttr(bar, axis));
}

describe("BarChart", () => {
  it("honours an explicit width and height in both the attributes and the viewBox", () => {
    const svg = rootSvg(renderStatic(<BarChart data={SERVICES} height={90} width={320} />));
    expect([svg.getAttribute("width"), svg.getAttribute("height"), svg.getAttribute("viewBox")]).toEqual([
      "320",
      "90",
      "0 0 320 90",
    ]);
  });

  it("derives a horizontal height that grows with the row count", () => {
    const three = numAttr(rootSvg(renderStatic(<BarChart data={SERVICES} width={320} />)), "height");
    const six = numAttr(
      rootSvg(renderStatic(<BarChart data={[...SERVICES, ...SERVICES.map((d) => ({ ...d, label: `${d.label}-2` }))]} width={320} />)),
      "height",
    );
    expect(three).toBeGreaterThan(0);
    expect(six).toBeGreaterThan(three * 1.5);
  });

  it("draws horizontal bar lengths proportional to their values", () => {
    const [s3, iam, ec2] = barLengths(renderStatic(<BarChart data={SERVICES} width={320} />), "width");
    expect(s3! / iam!).toBeCloseTo(2, 2);
    expect(iam! / ec2!).toBeCloseTo(2, 2);
  });

  it("draws vertical bar heights proportional to their values", () => {
    const host = renderStatic(<BarChart data={SERVICES} height={160} orientation="vertical" width={320} />);
    const [s3, iam, ec2] = barLengths(host, "height");
    expect(s3! / iam!).toBeCloseTo(2, 2);
    expect(iam! / ec2!).toBeCloseTo(2, 2);
  });

  it("labels each row on the left and its formatted value after the bar", () => {
    const host = renderStatic(<BarChart data={SERVICES} format={(n) => `${n} findings`} width={320} />);
    expect(texts(host, '[data-role="label"]')).toEqual(["s3", "iam", "ec2"]);
    expect(texts(host, '[data-role="value"]')).toEqual(["200 findings", "100 findings", "50 findings"]);
  });

  it("carries each value in an SVG <title> for hover", () => {
    const host = renderStatic(<BarChart data={SERVICES} width={320} />);
    expect(texts(host, "[data-label] > title")).toEqual(["s3: 200", "iam: 100", "ec2: 50"]);
  });

  it("folds rows past maxBars into an Other bar holding the folded sum", () => {
    const data = [
      { label: "a", value: 50 },
      { label: "b", value: 40 },
      { label: "c", value: 30 },
      { label: "d", value: 20 },
      { label: "e", value: 10 },
    ];
    const host = renderStatic(<BarChart data={data} maxBars={3} width={320} />);
    expect(texts(host, '[data-role="label"]')).toEqual(["a", "b", "Other"]);
    expect(texts(host, '[data-label="Other"] > title')).toEqual(["Other (3 more): 60"]);
  });

  it("fills bars from the categorical token with a hex fallback", () => {
    const host = renderStatic(<BarChart data={SERVICES} width={320} />);
    expect(host.querySelector('[data-mark="bar"]')?.getAttribute("fill")).toBe("var(--chart-1, #0284c7)");
  });

  it("honours a per-row colour", () => {
    const host = renderStatic(<BarChart data={[{ label: "x", value: 1, color: "#123456" }]} width={320} />);
    expect(host.querySelector('[data-mark="bar"]')?.getAttribute("fill")).toBe("#123456");
  });

  it("renders an explicit empty state at the requested width", () => {
    const host = renderStatic(<BarChart data={[]} width={320} />);
    expect(numAttr(rootSvg(host), "width")).toBe(320);
    expect(texts(host, "text")).toEqual(["No data"]);
  });

  it.each([
    [{ label: "neg", value: -1 }, /negative/],
    [{ label: "nan", value: Number.NaN }, /finite/],
  ])("fails loudly on %j", (row, message) => {
    expect(() => renderStatic(<BarChart data={[row]} width={320} />)).toThrow(message);
  });
});
