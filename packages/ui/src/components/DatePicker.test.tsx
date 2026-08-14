import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { DatePicker } from "./DatePicker";

describe("DatePicker", () => {
  it("uses the density control height by default", () => {
    render(<DatePicker aria-label="Selected date" value="" onChange={vi.fn()} />);

    const input = screen.getByLabelText("Selected date");
    expect(input.className).toContain("h-control-h");
    expect(input.className).toContain("px-control-px");
    expect(input.className).toContain("text-sm");
  });

  it("lets inputClassName override the default height", () => {
    render(
      <DatePicker
        aria-label="Selected date"
        value=""
        onChange={vi.fn()}
        inputClassName="h-8"
      />,
    );

    const input = screen.getByLabelText("Selected date");
    expect(input.className).toContain("h-8");
    expect(input.className).not.toContain("h-control-h");
  });

  it("updates the selected value", () => {
    const onChange = vi.fn();

    render(<DatePicker aria-label="Selected date" value="" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("Selected date"), {
      target: { value: "2026-04-21" },
    });

    expect(onChange).toHaveBeenCalledWith("2026-04-21");
  });

  // The adornment slots `DateTimePicker` already offers: a consumer owns the
  // node, the picker only positions it — left of the calendar button, so the
  // two never sit on top of each other.
  it("renders a trailing adornment inside the control, clear of the calendar button", () => {
    render(
      <DatePicker
        aria-label="Selected date"
        value=""
        onChange={vi.fn()}
        suffix={<button type="button">Mark</button>}
      />,
    );

    const adornment = screen.getByRole("button", { name: "Mark" }).parentElement;
    expect(adornment?.className).toContain("right-7");
    expect(adornment?.closest("[data-jsf-control]")).not.toBeNull();
  });

  it("reserves room for a leading adornment so it cannot overlap the date", () => {
    render(
      <DatePicker
        aria-label="Selected date"
        value=""
        onChange={vi.fn()}
        prefix={<span>UTC</span>}
      />,
    );

    expect(screen.getByLabelText("Selected date").className).toContain("pl-8");
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
