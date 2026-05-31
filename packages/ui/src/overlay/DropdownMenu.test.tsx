import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DropdownMenu } from "./DropdownMenu";

const items = (onSelect = vi.fn()) => [
  { label: "JSON", onSelect },
  { label: "Markdown", onSelect: vi.fn() },
];

describe("DropdownMenu", () => {
  it("is closed until the trigger is clicked", () => {
    render(<DropdownMenu label="Download" items={items()} />);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /download/i }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("invokes onSelect and closes when an item is chosen", () => {
    const onSelect = vi.fn();
    render(<DropdownMenu label="Download" items={items(onSelect)} />);
    fireEvent.click(screen.getByRole("button", { name: /download/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: "JSON" }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("closes on Escape", () => {
    render(<DropdownMenu label="Download" items={items()} />);
    fireEvent.click(screen.getByRole("button", { name: /download/i }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("closes on outside mousedown", () => {
    render(
      <div>
        <DropdownMenu label="Download" items={items()} />
        <button type="button">outside</button>
      </div>,
    );
    fireEvent.click(screen.getByRole("button", { name: /download/i }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByText("outside"));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("does not fire onSelect for a disabled item", () => {
    const onSelect = vi.fn();
    render(
      <DropdownMenu label="Actions" items={[{ label: "Delete", onSelect, disabled: true }]} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /actions/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Delete" }));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("renders custom children with a working close callback", () => {
    render(
      <DropdownMenu
        label="Filters"
        children={(close) => (
          <button type="button" onClick={close}>
            apply
          </button>
        )}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /filters/i }));
    expect(screen.getByText("apply")).toBeInTheDocument();
    fireEvent.click(screen.getByText("apply"));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
