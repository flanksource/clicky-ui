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

  it("fuses the two halves into a seamless control", () => {
    renderSplitButton();
    const primary = screen.getByRole("button", { name: "Save" });
    const chevron = screen.getByRole("button", { name: "Open menu" });

    // Primary keeps only its left rounding; chevron keeps only its right rounding.
    expect(primary.className).toMatch(/rounded-r-none/);
    expect(chevron.className).toMatch(/rounded-l-none/);

    // The chevron half stretches to the primary half's height instead of
    // locking to its own fixed icon-button height, so the seam is flush.
    expect(chevron.className).toMatch(/self-stretch/);
    expect(chevron.className).toMatch(/h-auto/);

    // A single foreground-tinted divider sits between the halves, so the seam
    // reads correctly on every variant (light on dark fills, dark on light fills).
    expect(chevron.className).toMatch(/border-l-current/);
    expect(primary.className).not.toMatch(/border-r/);
  });
});
