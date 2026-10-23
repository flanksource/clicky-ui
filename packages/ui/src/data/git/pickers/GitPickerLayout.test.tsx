import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { calculateComboboxMenuPosition } from "../../../lib/combobox";
import { GitBranchPicker, GitCommitPicker, GitRepositoryPicker } from "./GitPickers";

describe("Git picker dropdown layout", () => {
  const sha = "a".repeat(40);
  it.each([
    { name: "branch", label: "Branch", render: () => <GitBranchPicker items={[{ name: "feature/rules", sha, subject: "Validate benefits", author: "Alex Example" }]} value="" onChange={vi.fn()} /> },
    { name: "commit", label: "Commit", render: () => <GitCommitPicker items={[{ sha, subject: "Validate benefits", author: "Alex Example" }]} value="" onChange={vi.fn()} /> },
    { name: "repository", label: "Repository", render: () => <GitRepositoryPicker items={[{ name: "rules", fullName: "acme/rules", defaultBranch: "main" }]} value="" onChange={vi.fn()} /> },
  ])("keeps $name metadata inline in a wider menu and searchable", (picker) => {
    render(picker.render());
    const input = screen.getByRole("combobox", { name: picker.label });
    fireEvent.focus(input);
    expect(screen.getByRole("listbox")).toHaveStyle({ minWidth: "720px" });
    const option = screen.getByRole("option");
    expect(option.querySelector('[data-slot="combobox-option-text"]')).toHaveClass("flex");
    expect(option.title).toContain(picker.name === "repository" ? "main" : "Alex Example");
    fireEvent.change(input, { target: { value: picker.name === "repository" ? "main" : sha.slice(0, 7) } });
    expect(screen.getAllByRole("option")).toHaveLength(1);
  });
  it.each([
    { viewportWidth: 1920, left: 500, expected: { left: 500, width: 720 } },
    { viewportWidth: 1024, left: 900, expected: { left: 296, width: 720 } },
    { viewportWidth: 680, left: 500, expected: { left: 8, width: 664 } },
  ])("fits a preferred menu within a $viewportWidth px desktop viewport", ({ viewportWidth, left, expected }) => {
    expect(calculateComboboxMenuPosition({ anchor: { top: 100, bottom: 132, left, width: 224 }, viewportWidth, viewportHeight: 900, mobile: false, preferredWidth: 720 })).toMatchObject({ ...expected, maxWidth: expected.width });
  });
  it("retains viewport-wide mobile menus", () => {
    expect(calculateComboboxMenuPosition({ anchor: { top: 100, bottom: 132, left: 12, width: 224 }, viewportWidth: 390, viewportHeight: 844, mobile: true, preferredWidth: 720 })).toMatchObject({ left: 16, width: 358, maxWidth: 358 });
  });
  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])("rejects invalid preferred widths: %s", (preferredWidth) => {
    expect(() => calculateComboboxMenuPosition({ anchor: { top: 100, bottom: 132, left: 12, width: 224 }, viewportWidth: 390, viewportHeight: 844, mobile: true, preferredWidth })).toThrow("positive finite");
  });
});
