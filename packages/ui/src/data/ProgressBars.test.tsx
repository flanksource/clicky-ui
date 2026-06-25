import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UiChip } from "../icons";
import { ProgressBars } from "./ProgressBars";

const ONE_CORE = 1000;

describe("ProgressBars", () => {
  it("renders one bar per unit of capacity with a value caption", () => {
    const { container } = render(
      <ProgressBars
        title="CPU"
        icon={UiChip}
        usage={2.3 * ONE_CORE}
        max={4 * ONE_CORE}
      />,
    );

    expect(screen.getByText("2.3 cores")).toBeInTheDocument();
    const bars = container.querySelector("[data-bar-count]");
    expect(bars).toHaveAttribute("data-bar-count", "4");
    expect(bars).toHaveAttribute("data-bar-density", "default");
  });

  it("appends the capacity to the caption when showCapacity is set", () => {
    render(
      <ProgressBars
        variant="cell"
        showCapacity
        title="CPU"
        icon={UiChip}
        usage={2.3 * ONE_CORE}
        max={4 * ONE_CORE}
      />,
    );

    expect(screen.getByText("2.3/4 cores")).toBeInTheDocument();
  });

  it("renders a custom unit (GB) instead of cores", () => {
    const GiB = 1024 ** 3;
    render(
      <ProgressBars
        title="Mem"
        usage={2.5 * GiB}
        max={4 * GiB}
        unit={{ perBar: GiB, label: "GB", barLabel: "GB" }}
      />,
    );

    expect(screen.getByText("2.5 GB")).toBeInTheDocument();
    expect(screen.queryByText(/cores/)).not.toBeInTheDocument();
  });

  it("switches the bars to horizontal without changing the value", () => {
    const { container } = render(
      <ProgressBars
        orientation="horizontal"
        title="CPU"
        usage={2.3 * ONE_CORE}
        max={4 * ONE_CORE}
      />,
    );

    expect(container.querySelector("[data-orientation]")).toHaveAttribute(
      "data-orientation",
      "horizontal",
    );
  });

  it("uses compact bar sizing after four bars", () => {
    const { container } = render(
      <ProgressBars title="CPU" usage={2.3 * ONE_CORE} max={8 * ONE_CORE} />,
    );

    const bars = container.querySelector("[data-bar-density]");
    expect(bars).toHaveAttribute("data-bar-count", "8");
    expect(bars).toHaveAttribute("data-bar-density", "compact");
  });

  it("summarises current/min/max/avg/capacity from the stats prop on hover", async () => {
    const { container } = render(
      <ProgressBars
        variant="cell"
        title="CPU"
        icon={UiChip}
        usage={2.3 * ONE_CORE}
        max={4 * ONE_CORE}
        stats={{ min: 1000, max: 3000, avg: 2075 }}
        hoverFooter="over last 1h"
      />,
    );

    expect(screen.queryByText("Current")).not.toBeInTheDocument();
    fireEvent.mouseEnter(container.firstElementChild as HTMLElement);

    expect(await screen.findByText("Current")).toBeInTheDocument();
    // 1000mc → 1, 3000mc → 3, avg 2075mc → 2.1, capacity 4000mc → 4.
    expect(screen.getByText("1 cores")).toBeInTheDocument();
    expect(screen.getByText("3 cores")).toBeInTheDocument();
    expect(screen.getByText("2.1 cores")).toBeInTheDocument();
    expect(screen.getByText("4 cores")).toBeInTheDocument();
    expect(screen.getByText("over last 1h")).toBeInTheDocument();
  });

  it("does not wrap in a hover card when hoverCard is false", () => {
    const { container } = render(
      <ProgressBars
        variant="cell"
        hoverCard={false}
        title="CPU"
        usage={2.3 * ONE_CORE}
        max={4 * ONE_CORE}
        stats={{ min: 1000, max: 3000, avg: 2075 }}
      />,
    );

    fireEvent.mouseEnter(container.firstElementChild as HTMLElement);
    expect(screen.queryByText("Current")).not.toBeInTheDocument();
  });
});
