import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { FormatOptionsDropdown } from "./FormatOptionsDropdown";
import { CLICKY_FORMAT_OPTIONS, type FormatOption } from "./format-options";

describe("FormatOptionsDropdown", () => {
  it("labels the primary button with the active format", () => {
    render(<FormatOptionsDropdown value="yaml" onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /YAML/ })).toBeInTheDocument();
  });

  it("renders every default format in the menu", () => {
    render(<FormatOptionsDropdown value="json" onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Choose format" }));
    const menu = screen.getByRole("menu");
    expect(within(menu).getAllByRole("menuitem")).toHaveLength(CLICKY_FORMAT_OPTIONS.length);
  });

  it("calls onChange with the selected format value", () => {
    const onChange = vi.fn();
    render(<FormatOptionsDropdown value="json" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Choose format" }));
    const menu = screen.getByRole("menu");
    fireEvent.click(within(menu).getByRole("menuitem", { name: /CSV/ }));
    expect(onChange).toHaveBeenCalledWith("csv");
  });

  it("calls onChange with the active value when the primary button is clicked", () => {
    const onChange = vi.fn();
    render(<FormatOptionsDropdown value="markdown" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /Markdown/ }));
    expect(onChange).toHaveBeenCalledWith("markdown");
  });

  it("uses custom options when provided", () => {
    const options: FormatOption[] = [
      { value: "a", label: "Alpha" },
      { value: "b", label: "Beta" },
    ];
    const onChange = vi.fn();
    render(<FormatOptionsDropdown value="a" onChange={onChange} options={options} />);
    fireEvent.click(screen.getByRole("button", { name: "Choose format" }));
    const menu = screen.getByRole("menu");
    expect(within(menu).getAllByRole("menuitem")).toHaveLength(2);
    fireEvent.click(within(menu).getByRole("menuitem", { name: "Beta" }));
    expect(onChange).toHaveBeenCalledWith("b");
  });
});
