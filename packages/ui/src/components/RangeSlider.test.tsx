import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { RangeSlider } from "./RangeSlider";

describe("RangeSlider", () => {
  it("updates the lower and upper bounds", () => {
    const onChange = vi.fn();

    render(
      <RangeSlider
        min={0}
        max={10}
        step={1}
        value={[2, 8]}
        onChange={onChange}
        ariaLabelMin="Range minimum"
        ariaLabelMax="Range maximum"
      />,
    );

    fireEvent.change(screen.getByLabelText("Range minimum"), {
      target: { value: "4" },
    });
    expect(onChange).toHaveBeenCalledWith([4, 8]);

    fireEvent.change(screen.getByLabelText("Range maximum"), {
      target: { value: "6" },
    });
    expect(onChange).toHaveBeenCalledWith([2, 6]);
  });

  it("prevents the thumbs from crossing", () => {
    const onChange = vi.fn();

    render(
      <RangeSlider
        min={0}
        max={10}
        step={1}
        value={[3, 7]}
        onChange={onChange}
        ariaLabelMin="Range minimum"
        ariaLabelMax="Range maximum"
      />,
    );

    fireEvent.change(screen.getByLabelText("Range minimum"), {
      target: { value: "9" },
    });
    expect(onChange).toHaveBeenCalledWith([7, 7]);
  });
});
