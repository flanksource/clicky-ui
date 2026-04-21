import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { DatePicker } from "./DatePicker";

describe("DatePicker", () => {
  it("updates the selected value", () => {
    const onChange = vi.fn();

    render(<DatePicker aria-label="Selected date" value="" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("Selected date"), {
      target: { value: "2026-04-21" },
    });

    expect(onChange).toHaveBeenCalledWith("2026-04-21");
  });

  it("opens the native picker affordance", () => {
    render(<DatePicker aria-label="Selected date" value="" onChange={vi.fn()} />);

    const input = screen.getByLabelText("Selected date") as HTMLInputElement & {
      showPicker?: () => void;
    };
    input.showPicker = vi.fn();

    fireEvent.click(screen.getByRole("button", { name: /open date picker/i }));

    expect(input.showPicker).toHaveBeenCalledTimes(1);
  });
});
