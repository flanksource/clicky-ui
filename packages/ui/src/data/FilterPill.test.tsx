import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { FilterPill, type FilterMode } from "./FilterPill";

function region(name: "exclude" | "neutral" | "include"): HTMLElement {
  const el = document.querySelector(`[data-tristate-region="${name}"]`);
  if (!(el instanceof HTMLElement)) {
    throw new Error(`tri-state region "${name}" not found`);
  }
  return el;
}

function renderSwitch(mode: FilterMode) {
  const onModeChange = vi.fn<(next: FilterMode) => void>();
  render(
    <FilterPill
      label="jest"
      mode={mode}
      title="Jest filter"
      onModeChange={onModeChange}
    />,
  );
  return {
    onModeChange,
    // The toggle's regions are laid out left → middle → right as
    // exclude → neutral(cycle) → include.
    left: region("exclude"),
    middle: region("neutral"),
    right: region("include"),
    toggle: screen.getByRole("button", { name: "Jest filter" }),
  };
}

describe("FilterPill tri-state switch", () => {
  it("sets exclude when the left region is clicked from neutral", () => {
    const { onModeChange, left } = renderSwitch("neutral");
    fireEvent.click(left);
    expect(onModeChange).toHaveBeenCalledWith("exclude");
  });

  it("toggles back to neutral when the left region is clicked while excluded", () => {
    const { onModeChange, left } = renderSwitch("exclude");
    fireEvent.click(left);
    expect(onModeChange).toHaveBeenCalledWith("neutral");
  });

  it("sets include when the right region is clicked from neutral", () => {
    const { onModeChange, right } = renderSwitch("neutral");
    fireEvent.click(right);
    expect(onModeChange).toHaveBeenCalledWith("include");
  });

  it("toggles back to neutral when the right region is clicked while included", () => {
    const { onModeChange, right } = renderSwitch("include");
    fireEvent.click(right);
    expect(onModeChange).toHaveBeenCalledWith("neutral");
  });

  it("rotates the mode when the middle region is clicked", () => {
    const { onModeChange, middle } = renderSwitch("neutral");
    fireEvent.click(middle);
    expect(onModeChange).toHaveBeenCalledWith("include");
  });

  it("continues the rotation from include through the middle region", () => {
    const { onModeChange, middle } = renderSwitch("include");
    fireEvent.click(middle);
    expect(onModeChange).toHaveBeenCalledWith("exclude");
  });

  it("exposes the switch as a single accessible button named by its title", () => {
    const { toggle } = renderSwitch("neutral");
    // Exactly one button — the regions are aria-hidden, so they do not appear
    // as buttons and cannot pollute a hosting element's accessible name.
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(toggle).toHaveAccessibleName("Jest filter");
  });

  it("cycles on keyboard activation of the switch button", () => {
    const { onModeChange, toggle } = renderSwitch("neutral");
    fireEvent.click(toggle);
    expect(onModeChange).toHaveBeenCalledWith("include");
  });
});
