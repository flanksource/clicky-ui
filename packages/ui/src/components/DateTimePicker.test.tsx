import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { DateTimePicker } from "./DateTimePicker";

describe("DateTimePicker", () => {
  it("updates the visible value", () => {
    const onChange = vi.fn();

    render(<DateTimePicker aria-label="Selected time" value="" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("Selected time"), {
      target: { value: "now-6h" },
    });

    expect(onChange).toHaveBeenCalledWith("now-6h");
  });

  it("opens the native picker affordance", () => {
    const { container } = render(
      <DateTimePicker aria-label="Selected time" value="" onChange={vi.fn()} />,
    );

    const picker = container.querySelector('input[type="datetime-local"]') as HTMLInputElement & {
      showPicker?: () => void;
    };
    if (!picker) {
      throw new Error("Expected hidden datetime-local input");
    }
    picker.showPicker = vi.fn();

    fireEvent.click(screen.getByRole("button", { name: /open time picker/i }));

    expect(picker.showPicker).toHaveBeenCalledTimes(1);
  });
});
