import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MultiGaugeBar } from "./MultiGaugeBar";

describe("MultiGaugeBar", () => {
  it("shows usage inside the bar, the maximum at its end, and markers on one scale", () => {
    const { container, getByText } = render(
      <MultiGaugeBar
        label="Heap"
        average={40}
        max={100}
        markers={[
          { label: "P95", value: 80 },
          { label: "Max", value: 90 },
        ]}
      />,
    );
    expect(container.querySelector("[data-gauge-fill]")).toHaveStyle({
      width: "40%",
    });
    expect(container.querySelector('[data-gauge-marker="P95"]')).toHaveStyle({
      left: "80%",
    });
    expect(getByText("Avg").parentElement).toHaveTextContent("Avg 40");
    expect(getByText("Avg").closest("[data-gauge-track]")).toBeNull();
    expect(getByText("Heap")).toBeInTheDocument();
    expect(container.querySelector("[data-gauge-usage]")).toHaveTextContent(
      "40",
    );
    expect(
      container
        .querySelector("[data-gauge-usage]")
        ?.closest("[data-gauge-track]"),
    ).not.toBeNull();
    expect(container.querySelector("[data-gauge-max]")).toHaveTextContent(
      "100",
    );
    expect(
      container
        .querySelector("[data-gauge-max]")
        ?.closest("[data-gauge-track]"),
    ).toBeNull();
    expect(container.querySelectorAll("[data-gauge-tick]")).toHaveLength(4);
    expect(
      container.querySelector("[data-gauge-marker] svg"),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-gauge-marker="P95"]'),
    ).toHaveAttribute("data-gauge-shape", "pointer");
    expect(container.querySelector('[data-gauge-marker="P95"]')).toHaveStyle({
      height: "8px",
    });
  });
  it("distinguishes a request range, percentile pointers and a limit on one scale", () => {
    const { container, getByRole } = render(
      <MultiGaugeBar
        label="CPU"
        average={1.24}
        max={4}
        markers={[
          { label: "Request", value: 2, shape: "range" },
          { label: "P90", value: 2, tone: "warning" },
          { label: "P95", value: 2.4, tone: "danger" },
          { label: "Limit", value: 4, shape: "pointer" },
        ]}
      />,
    );
    expect(container.querySelector("[data-gauge-fill]")).toHaveStyle({
      width: "31%",
    });
    expect(
      container.querySelector('[data-gauge-marker="Request"]'),
    ).toHaveStyle({ width: "50%", left: "0%" });
    expect(container.querySelector('[data-gauge-marker="P90"]')).toHaveStyle({
      left: "50%",
    });
    expect(
      container.querySelector('[data-gauge-marker="Limit"]'),
    ).toHaveAttribute("data-gauge-shape", "pointer");
    expect(getByRole("img")).toHaveAccessibleName(
      /CPU.*Average 1.24.*Request 2.*P90 2.*P95 2.4.*Limit 4/,
    );
  });
  it("expands the scale when observations exceed the configured ceiling", () => {
    const { container } = render(
      <MultiGaugeBar
        label="Memory"
        average={6}
        max={4}
        markers={[{ label: "Limit", value: 4, shape: "pointer" }]}
      />,
    );
    expect(container.querySelector("[data-gauge-fill]")).toHaveStyle({
      width: "100%",
    });
    expect(container.querySelector('[data-gauge-marker="Limit"]')).toHaveStyle({
      left: `${(4 / 6) * 100}%`,
    });
    expect(container.querySelector("[data-gauge-max]")).toHaveTextContent("6");
  });
  it("retains zero values without dividing by zero or substituting an average", () => {
    const { container, getByText } = render(
      <MultiGaugeBar
        label="Queue"
        max={0}
        markers={[{ label: "Max", value: 0 }]}
      />,
    );
    expect(getByText("Avg not collected")).toBeInTheDocument();
    expect(container.innerHTML).not.toMatch(/NaN|Infinity/);
  });
  it("keeps coincident pointers at the same value in distinct lanes", () => {
    const { container } = render(
      <MultiGaugeBar
        label="CPU"
        average={50}
        markers={[
          { label: "P90", value: 80 },
          { label: "P95", value: 80 },
        ]}
      />,
    );
    const markers = container.querySelectorAll<HTMLElement>(
      "[data-gauge-marker]",
    );
    expect(markers[0]?.style.left).toBe(markers[1]?.style.left);
    expect(markers[0]?.style.top).not.toBe(markers[1]?.style.top);
  });
  it("renders a compact table cell with usage, units and maximum while retaining accessible marker values", () => {
    const { container, getByRole, queryByText } = render(
      <MultiGaugeBar
        label="CPU"
        unit="cores"
        average={0.12}
        max={2}
        variant="cell"
        markers={[{ label: "P95", value: 0.9 }]}
      />,
    );
    expect(container.querySelector("[data-gauge-usage]")).toHaveTextContent(
      "0.12",
    );
    expect(container.querySelector("[data-gauge-max]")).toHaveTextContent(
      "2 cores",
    );
    expect(container.querySelectorAll("[data-gauge-tick]")).toHaveLength(0);
    expect(queryByText("CPU")).toBeNull();
    expect(getByRole("img")).toHaveAccessibleName(
      /CPU.*cores.*Average 0.12.*P95 0.9/,
    );
  });
  it("renders a thin small track without inline usage text while keeping the fill, markers and accessible values", () => {
    const { container, getByRole } = render(
      <MultiGaugeBar
        label="Heap"
        average={3}
        max={6}
        variant="cell"
        size="sm"
        markers={[{ label: "P95", value: 4.5, tone: "danger" }]}
      />,
    );
    expect(container.querySelector("[data-gauge-track]")).toHaveClass("h-2");
    expect(container.querySelector("[data-gauge-usage]")).toBeNull();
    expect(
      (container.querySelector("[data-gauge-fill]") as HTMLElement).style.width,
    ).toBe("50%");
    expect(
      (container.querySelector('[data-gauge-marker="P95"]') as HTMLElement)
        .style.left,
    ).toBe("75%");
    expect(getByRole("img")).toHaveAccessibleName(/Heap.*Average 3.*P95 4.5/);
  });
  it("rejects invalid observations", () => {
    expect(() =>
      render(<MultiGaugeBar label="Invalid" average={-1} />),
    ).toThrow("non-negative");
  });
});
