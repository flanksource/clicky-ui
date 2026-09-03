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

  it("optionally exposes editable minimum and maximum values", () => {
    const onChange = vi.fn();

    render(
      <RangeSlider
        editable
        min={0}
        max={10}
        step={1}
        value={[3, 8]}
        onChange={onChange}
        ariaLabelMin="Minimum severity"
        ariaLabelMax="Maximum severity"
      />,
    );

    fireEvent.change(screen.getByLabelText("Edit minimum severity"), {
      target: { value: "5" },
    });
    expect(onChange).toHaveBeenCalledWith([5, 8]);

    fireEvent.change(screen.getByLabelText("Edit maximum severity"), {
      target: { value: "7" },
    });
    expect(onChange).toHaveBeenCalledWith([3, 7]);
  });

  it("snaps typed editable values onto the step grid", () => {
    const onChange = vi.fn();

    render(
      <RangeSlider
        editable
        min={0}
        max={10}
        step={2}
        value={[2, 8]}
        onChange={onChange}
        ariaLabelMin="Minimum severity"
        ariaLabelMax="Maximum severity"
      />,
    );

    fireEvent.change(screen.getByLabelText("Edit minimum severity"), {
      target: { value: "3" },
    });
    expect(onChange).toHaveBeenCalledWith([4, 8]);

    fireEvent.change(screen.getByLabelText("Edit maximum severity"), {
      target: { value: "9" },
    });
    expect(onChange).toHaveBeenCalledWith([2, 10]);
  });

  it("keeps snapped editable values inside the allowed bounds", () => {
    const onChange = vi.fn();

    render(
      <RangeSlider
        editable
        min={1}
        max={9}
        step={3}
        value={[1, 7]}
        onChange={onChange}
        ariaLabelMin="Minimum severity"
        ariaLabelMax="Maximum severity"
      />,
    );

    fireEvent.change(screen.getByLabelText("Edit minimum severity"), {
      target: { value: "-5" },
    });
    expect(onChange).toHaveBeenCalledWith([1, 7]);

    fireEvent.change(screen.getByLabelText("Edit maximum severity"), {
      target: { value: "42" },
    });
    expect(onChange).toHaveBeenCalledWith([1, 7]);
  });
});
