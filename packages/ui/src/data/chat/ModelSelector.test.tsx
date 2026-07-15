import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EffortSelector } from "./ModelSelector";

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

  it("does not show an effort icon for an unsupported selection", () => {
    render(<EffortSelector efforts={[]} value="medium" onChange={vi.fn()} />);

    const input = screen.getByRole("combobox", { name: "Reasoning effort" });
    expect(input.className).not.toContain("pl-8");
  });

  it("uses expanded names in the menu", () => {
    render(
      <EffortSelector
        efforts={["xhigh", "max"]}
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
  });
});
