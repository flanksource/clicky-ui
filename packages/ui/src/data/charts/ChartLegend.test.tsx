import { describe, expect, it } from "vitest";
import { ChartLegend } from "./ChartLegend";
import { chartColor } from "./chart-palette";
import { renderStatic, texts } from "./chart.test-utils";

const ITEMS = [
  { label: "passed", color: chartColor(0) },
  { label: "failed", color: "#e11d48" },
];

describe("ChartLegend", () => {
  it("lists each item with its label in text ink and its colour on the swatch", () => {
    const host = renderStatic(<ChartLegend items={ITEMS} />);
    expect(texts(host, "li")).toEqual(["passed", "failed"]);
    const swatches = Array.from(host.querySelectorAll<HTMLElement>("li > span[aria-hidden]")).map(
      (swatch) => swatch.style.backgroundColor,
    );
    expect(swatches).toEqual(["var(--chart-1, #0284c7)", "rgb(225, 29, 72)"]);
  });

  it("renders nothing for no items", () => {
    expect(renderStatic(<ChartLegend items={[]} />).innerHTML).toBe("");
  });
});
