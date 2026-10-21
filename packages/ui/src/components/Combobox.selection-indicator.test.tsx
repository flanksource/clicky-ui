import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Combobox } from "./Combobox";

const OPTIONS = [{ value: "main", label: "main", icon: <span data-testid="author-avatar">AM</span> }];

describe("Combobox selection indicator placement", () => {
  it("starts a single-select row with its avatar and keeps the selected marker at the end", () => {
    const onChange = vi.fn();
    render(<Combobox value="main" onChange={onChange} options={OPTIONS} />);
    fireEvent.focus(screen.getByRole("combobox"));
    const row = screen.getByRole("option", { name: /main/ });
    expect(row.firstElementChild).toBe(within(row).getByTestId("author-avatar"));
    expect(row.lastElementChild).toHaveAttribute("data-slot", "combobox-selection-indicator");
    expect(row).toHaveAttribute("aria-selected", "true");
    fireEvent.mouseDown(row);
    expect(onChange).toHaveBeenCalledWith("main");
  });

  it("keeps the leading selection marker for a multiple-select row", () => {
    render(<Combobox multiple value={["main"]} onChange={vi.fn()} options={OPTIONS} />);
    fireEvent.focus(screen.getByRole("combobox"));
    expect(screen.getByRole("option", { name: /main/ }).firstElementChild)
      .toHaveAttribute("data-slot", "combobox-selection-indicator");
  });
});
