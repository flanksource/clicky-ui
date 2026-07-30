import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EffortSelector } from "./ModelSelector";
import { DEFAULT_REASONING_EFFORTS } from "./effort-icons";

describe("EffortSelector", () => {
  it("shows a compact selected label and effort icon only in the closed control", () => {
    render(
      <EffortSelector
        efforts={["low", "medium", "high"]}
        value="medium"
        onChange={vi.fn()}
      />,
    );

    const input = screen.getByRole("combobox", { name: "Reasoning effort" });
    expect(input).toHaveValue("Med");
    expect(input.className).toContain("pl-8");

    fireEvent.focus(input);
    const medium = screen.getByRole("option", { name: "Medium" });
    expect(medium).toHaveTextContent("Medium");
    // The single SVG is Combobox's selection check; no effort glyph is added
    // to the option row.
    expect(medium.querySelectorAll("svg")).toHaveLength(1);
  });

  it("preserves an unknown current effort without assigning a known icon", () => {
    render(
      <EffortSelector efforts={[]} value="ultra-plus" onChange={vi.fn()} />,
    );

    const input = screen.getByRole("combobox", { name: "Reasoning effort" });
    expect(input).toHaveValue("Ultra-plus");
    expect(input.className).not.toContain("pl-8");
    fireEvent.focus(input);
    expect(
      screen.getByRole("option", { name: "Ultra-plus" }),
    ).toBeInTheDocument();
  });

  it("uses expanded names in the menu", () => {
    render(
      <EffortSelector
        efforts={["xhigh", "max", "ultra"]}
        value="xhigh"
        onChange={vi.fn()}
      />,
    );

    const input = screen.getByRole("combobox", { name: "Reasoning effort" });
    expect(input).toHaveValue("XHigh");
    fireEvent.focus(input);
    expect(
      screen.getByRole("option", { name: "Extra high" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Maximum" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Ultra" })).toBeInTheDocument();
  });

  it("exports the complete default effort catalog", () => {
    expect(DEFAULT_REASONING_EFFORTS).toEqual([
      "low",
      "medium",
      "high",
      "xhigh",
      "max",
      "ultra",
    ]);
  });
});
