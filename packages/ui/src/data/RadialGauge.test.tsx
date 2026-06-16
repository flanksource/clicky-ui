import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RadialGauge } from "./RadialGauge";

// The value arc is the second <circle>; the first is the track.
function arc(container: HTMLElement): Element {
  const el = container.querySelectorAll("circle")[1];
  if (!el) throw new Error("value arc not found");
  return el;
}

// circumference for the component's default size/thickness (size=28, thickness=3)
const R = (28 - 3) / 2;
const C = 2 * Math.PI * R;

describe("RadialGauge", () => {
  it("leaves the arc empty at zero (offset == circumference)", () => {
    const { container } = render(<RadialGauge value={0} max={100} />);
    expect(Number(arc(container).getAttribute("stroke-dashoffset"))).toBeCloseTo(C, 5);
  });

  it("fills the arc completely at max (offset == 0)", () => {
    const { container } = render(<RadialGauge value={100} max={100} />);
    expect(Number(arc(container).getAttribute("stroke-dashoffset"))).toBeCloseTo(0, 5);
  });

  it("sets offset proportional to value for a partial fill", () => {
    const { container } = render(<RadialGauge value={25} max={100} />);
    // 25% filled => 75% of the circumference remains as offset
    expect(Number(arc(container).getAttribute("stroke-dashoffset"))).toBeCloseTo(C * 0.75, 5);
  });

  it("clamps an over-max value to a full ring", () => {
    const { container } = render(<RadialGauge value={500} max={100} />);
    expect(Number(arc(container).getAttribute("stroke-dashoffset"))).toBeCloseTo(0, 5);
  });

  it("exposes value/max as meter aria attributes", () => {
    const { getByRole } = render(<RadialGauge value={30} max={120} />);
    const meter = getByRole("meter");
    expect(meter.getAttribute("aria-valuenow")).toBe("30");
    expect(meter.getAttribute("aria-valuemax")).toBe("120");
  });

  it("colors the arc by tone", () => {
    const { container } = render(<RadialGauge value={50} tone="danger" />);
    expect(arc(container).getAttribute("class")).toMatch(/text-red-500/);
  });

  it("renders centered content and a side label", () => {
    const { getByText } = render(
      <RadialGauge value={50} center={<span>★</span>} label="Rate Limit" />,
    );
    expect(getByText("★")).toBeInTheDocument();
    expect(getByText("Rate Limit")).toBeInTheDocument();
  });
});
