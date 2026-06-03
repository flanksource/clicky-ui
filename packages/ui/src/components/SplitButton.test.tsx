import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { SplitButton } from "./SplitButton";

function renderSplitButton(overrides: Partial<Parameters<typeof SplitButton>[0]> = {}) {
  const onClick = vi.fn();
  const onCopy = vi.fn();
  render(
    <SplitButton
      label="Save"
      onClick={onClick}
      items={[{ label: "Copy", onSelect: onCopy }]}
      {...overrides}
    />,
  );
  return { onClick, onCopy };
}

describe("SplitButton", () => {
  it("fires the primary handler when the primary half is clicked", () => {
    const { onClick, onCopy } = renderSplitButton();
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onCopy).not.toHaveBeenCalled();
  });

  it("does not fire the primary handler when the chevron is clicked", () => {
    const { onClick } = renderSplitButton();
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("opens the menu and fires an item handler, then closes", () => {
    const { onCopy } = renderSplitButton();
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    const item = screen.getByRole("menuitem", { name: "Copy" });
    fireEvent.click(item);
    expect(onCopy).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menuitem", { name: "Copy" })).not.toBeInTheDocument();
  });

  it("forwards the variant class to both halves", () => {
    renderSplitButton({ variant: "destructive" });
    expect(screen.getByRole("button", { name: "Save" }).className).toMatch(/bg-destructive/);
    expect(screen.getByRole("button", { name: "Open menu" }).className).toMatch(/bg-destructive/);
  });

  it("disables the primary half while loading", () => {
    renderSplitButton({ loading: true });
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("disables both halves when disabled", () => {
    renderSplitButton({ disabled: true });
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Open menu" })).toBeDisabled();
  });
});
