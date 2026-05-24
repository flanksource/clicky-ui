import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { DateField } from "./DateField";

describe("DateField", () => {
  it("updates date values", () => {
    const onChange = vi.fn();

    render(<DateField aria-label="Business date" value="" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("Business date"), {
      target: { value: "2026-05-05" },
    });
    expect(onChange).toHaveBeenCalledWith("2026-05-05");
  });

  it("updates datetime values", () => {
    const onChange = vi.fn();

    render(<DateField mode="datetime" aria-label="Started at" value="" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("Started at"), {
      target: { value: "now-1h" },
    });
    expect(onChange).toHaveBeenCalledWith("now-1h");
  });
});
