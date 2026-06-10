import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { IconButton } from "./IconButton";
import { UiRefresh } from "../icons";

describe("IconButton", () => {
  it("renders a button with the label as its accessible name", () => {
    render(<IconButton icon={UiRefresh} label="Rerun" />);
    expect(screen.getByRole("button", { name: "Rerun" })).toBeInTheDocument();
  });

  it("fires onClick when pressed", () => {
    const onClick = vi.fn();
    render(<IconButton icon={UiRefresh} label="Rerun" onClick={onClick} />);
    fireEvent.click(screen.getByRole("button", { name: "Rerun" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("has no background or border classes (borderless, hover is on the icon)", () => {
    render(<IconButton icon={UiRefresh} label="Rerun" />);
    const btn = screen.getByRole("button", { name: "Rerun" });
    expect(btn.className).not.toMatch(/\bbg-(?!transparent)/);
    expect(btn.className).not.toMatch(/\bborder(?!-0)/);
    // The color transition lives on the button so the currentColor glyph recolors.
    expect(btn.className).toMatch(/hover:text-foreground/);
  });

  it("is disabled when the disabled prop is set", () => {
    render(<IconButton icon={UiRefresh} label="Rerun" disabled />);
    expect(screen.getByRole("button", { name: "Rerun" })).toBeDisabled();
  });
});
