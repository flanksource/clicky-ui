import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { DimensionField } from "./DimensionField";

describe("DimensionField", () => {
  it("renders a bounded numeric input with a visible unit and emits numbers", () => {
    const onChange = vi.fn();

    render(
      <DimensionField
        label="Width"
        value={90}
        unit="mm"
        min={40}
        max={180}
        step={1}
        required
        onChange={onChange}
      />,
    );

    const input = screen.getByRole("spinbutton", { name: "Width" });
    expect(input).toHaveAttribute("min", "40");
    expect(input).toHaveAttribute("max", "180");
    expect(input).toHaveAttribute("step", "1");
    expect(screen.getByText("mm")).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "120" } });

    expect(onChange).toHaveBeenCalledExactlyOnceWith(120);
  });
});
