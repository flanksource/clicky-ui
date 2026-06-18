import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UiPass } from "../icons";
import { Gauge } from "./Gauge";

describe("Gauge", () => {
  it("keeps the default card layout", () => {
    const { container } = render(
      <Gauge icon={UiPass} label="Passed" value={92} tone="success" meta="fresh" />,
    );

    const root = container.firstElementChild as HTMLElement | null;
    expect(screen.getByText("Passed")).toBeInTheDocument();
    expect(screen.getByText("92")).toBeInTheDocument();
    expect(root?.className).toMatch(/min-h-28/);
    expect(root?.className).toMatch(/w-\[15\.5rem\]/);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders a compact cell without hiding the icon or value", () => {
    const { container } = render(
      <Gauge
        variant="cell"
        showLabel={false}
        icon={UiPass}
        label="Passed"
        value={92}
        tone="success"
      />,
    );

    const root = container.firstElementChild as HTMLElement | null;
    expect(screen.queryByText("Passed")).not.toBeInTheDocument();
    expect(screen.getByText("92")).toBeInTheDocument();
    expect(root?.className).toMatch(/inline-flex/);
    expect(root?.className).not.toMatch(/min-h-28/);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
