import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { vi } from "vitest";
import { Slider } from "./Slider";

describe("Slider", () => {
  it("reports the dragged value", () => {
    const onChange = vi.fn();
    render(<Slider min={0} max={10} value={3} onChange={onChange} ariaLabel="Severity" />);

    fireEvent.change(screen.getByLabelText("Severity"), { target: { value: "7" } });
    expect(onChange).toHaveBeenCalledWith(7);
  });

  it("renders no number field unless editable", () => {
    render(<Slider min={0} max={10} value={3} onChange={vi.fn()} ariaLabel="Severity" />);
    expect(screen.queryByRole("spinbutton")).toBeNull();
  });

  it("shows the current value in an inline number field when editable", () => {
    render(<Slider editable min={0} max={10} value={3} onChange={vi.fn()} ariaLabel="Severity" />);

    const input = screen.getByLabelText("Edit severity") as HTMLInputElement;
    expect(input.value).toBe("3");
    expect(input.closest("[data-slider-row]")).toBe(
      screen.getByLabelText("Severity").closest("[data-slider-row]"),
    );
  });

  it("reports typed values", () => {
    const onChange = vi.fn();
    render(<Slider editable min={0} max={10} value={3} onChange={onChange} ariaLabel="Severity" />);

    fireEvent.change(screen.getByLabelText("Edit severity"), { target: { value: "6" } });
    expect(onChange).toHaveBeenCalledWith(6);
  });

  it.each([
    { typed: "-5", expected: 1 },
    { typed: "42", expected: 9 },
  ])("clamps typed $typed to the bounds ($expected)", ({ typed, expected }) => {
    const onChange = vi.fn();
    render(<Slider editable min={1} max={9} value={5} onChange={onChange} ariaLabel="Severity" />);

    fireEvent.change(screen.getByLabelText("Edit severity"), { target: { value: typed } });
    expect(onChange).toHaveBeenCalledWith(expected);
  });

  it("snaps typed values onto the step grid measured from min", () => {
    const onChange = vi.fn();
    render(
      <Slider editable min={1} max={10} step={3} value={1} onChange={onChange} ariaLabel="Severity" />,
    );

    fireEvent.change(screen.getByLabelText("Edit severity"), { target: { value: "6" } });
    expect(onChange).toHaveBeenCalledWith(7);
  });

  it("keeps the slider and the field in sync, and resets an out-of-range draft on blur", () => {
    function Controlled() {
      const [value, setValue] = useState(20);
      return (
        <Slider editable min={10} max={100} value={value} onChange={setValue} ariaLabel="Threshold" />
      );
    }
    render(<Controlled />);
    const slider = screen.getByLabelText("Threshold") as HTMLInputElement;
    const field = screen.getByLabelText("Edit threshold") as HTMLInputElement;

    fireEvent.change(slider, { target: { value: "60" } });
    expect(field.value).toBe("60");

    fireEvent.change(field, { target: { value: "5" } });
    expect(slider.value).toBe("10");
    expect(field.value).toBe("5");

    fireEvent.blur(field);
    expect(field.value).toBe("10");
  });

  it("does not report a value while the field is cleared", () => {
    const onChange = vi.fn();
    render(<Slider editable min={0} max={10} value={3} onChange={onChange} ariaLabel="Severity" />);

    fireEvent.change(screen.getByLabelText("Edit severity"), { target: { value: "" } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("clamps a controlled value that lies outside the bounds for display", () => {
    render(<Slider editable min={0} max={10} value={99} onChange={vi.fn()} ariaLabel="Severity" />);
    expect((screen.getByLabelText("Severity") as HTMLInputElement).value).toBe("10");
    expect((screen.getByLabelText("Edit severity") as HTMLInputElement).value).toBe("10");
  });
});
