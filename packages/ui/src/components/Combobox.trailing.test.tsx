import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Combobox } from "./Combobox";

const UNIT_OPTIONS = [
  { value: "percent", label: "Percent (0-100)", trailing: <span>42 → 42%</span> },
  { value: "percentunit", label: "Percent (0-1)", trailing: <span>0.42 → 42%</span> },
];

describe("Combobox option trailing content", () => {
  it("pins the trailing node to the right of a single-line option row", () => {
    render(
      <Combobox value="" onChange={vi.fn()} options={UNIT_OPTIONS} allowCustomValue={false} />,
    );

    fireEvent.focus(screen.getByRole("combobox"));

    const row = screen.getByRole("option", { name: /Percent \(0-100\)/ });
    // A trailing-only option stays on one line; `description` is what forces
    // the row to two, and these two must not both be in play.
    expect(row.className).toContain("items-center");
    expect(row.className).not.toContain("items-start");

    const trailing = screen.getByText("42 → 42%").parentElement;
    expect(trailing?.className).toContain("ml-auto");
    expect(trailing?.className).toContain("text-right");
  });

  it("caps the trailing node so a squeezed menu truncates it before the label", () => {
    render(
      <Combobox value="" onChange={vi.fn()} options={UNIT_OPTIONS} allowCustomValue={false} />,
    );

    fireEvent.focus(screen.getByRole("combobox"));

    const trailing = screen.getByText("42 → 42%").parentElement;
    expect(trailing?.className).toContain("max-w-[55%]");
    expect(trailing?.className).toContain("truncate");
    // `shrink-0` here would let the preview starve the label of width in a menu
    // clamped against the viewport edge.
    expect(trailing?.className).not.toContain("shrink-0");
  });

  it("distinguishes options whose labels alone do not", () => {
    render(
      <Combobox value="" onChange={vi.fn()} options={UNIT_OPTIONS} allowCustomValue={false} />,
    );

    fireEvent.focus(screen.getByRole("combobox"));

    expect(screen.getByRole("option", { name: /Percent \(0-100\)/ })).toHaveTextContent("42 → 42%");
    expect(screen.getByRole("option", { name: /Percent \(0-1\)/ })).toHaveTextContent("0.42 → 42%");
  });

  it("leaves the row unchanged when no option declares trailing content", () => {
    render(
      <Combobox
        value=""
        onChange={vi.fn()}
        options={[{ value: "s", label: "short" }]}
        allowCustomValue={false}
      />,
    );

    fireEvent.focus(screen.getByRole("combobox"));

    const row = screen.getByRole("option");
    expect(row.textContent).toBe("short");
    expect(row.querySelector(".ml-auto")).toBeNull();
  });
});
