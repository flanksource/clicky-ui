import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TriStateToggle } from "./TriStateToggle";
import { nextTriState } from "./tri-state";

describe("nextTriState", () => {
  it("cycles unset → on → off → unset", () => {
    expect(nextTriState(undefined)).toBe(true);
    expect(nextTriState(true)).toBe(false);
    expect(nextTriState(false)).toBeUndefined();
  });
});

describe("TriStateToggle", () => {
  it("reports the unset state as a mixed checkbox, not an unchecked one", () => {
    render(<TriStateToggle value={undefined} label="Intercompany" onChange={() => {}} />);
    const toggle = screen.getByRole("checkbox", { name: "Intercompany" });

    expect(toggle.getAttribute("aria-checked")).toBe("mixed");
    expect(toggle.getAttribute("title")).toBe("Intercompany: Any. Click to cycle.");
  });

  it("advances one state per click", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <TriStateToggle value={undefined} label="Intercompany" onChange={onChange} />,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "Intercompany" }));
    expect(onChange).toHaveBeenLastCalledWith(true);

    rerender(<TriStateToggle value={true} label="Intercompany" onChange={onChange} />);
    expect(screen.getByRole("checkbox", { name: "Intercompany" }).getAttribute("aria-checked")).toBe("true");
    fireEvent.click(screen.getByRole("checkbox", { name: "Intercompany" }));
    expect(onChange).toHaveBeenLastCalledWith(false);

    rerender(<TriStateToggle value={false} label="Intercompany" onChange={onChange} />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Intercompany" }));
    expect(onChange).toHaveBeenLastCalledWith(undefined);
  });

  it("uses caller wording for the states", () => {
    render(
      <TriStateToggle
        value={false}
        label="Fixed asset"
        labels={{ off: "Not a fixed asset" }}
        onChange={() => {}}
      />,
    );

    expect(screen.getByRole("checkbox", { name: "Fixed asset" }).getAttribute("title")).toBe(
      "Fixed asset: Not a fixed asset. Click to cycle.",
    );
  });

  it("lets an external label target the toggle by id", () => {
    const onChange = vi.fn();
    render(
      <>
        <label htmlFor="intercompany-toggle">Intercompany</label>
        <TriStateToggle
          id="intercompany-toggle"
          value={undefined}
          label="Intercompany"
          onChange={onChange}
        />
      </>,
    );

    expect(screen.getByRole("checkbox", { name: "Intercompany" })).toHaveAttribute(
      "id",
      "intercompany-toggle",
    );

    fireEvent.click(screen.getByText("Intercompany"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("does not fire while disabled", () => {
    const onChange = vi.fn();
    render(<TriStateToggle value={undefined} label="Intercompany" disabled onChange={onChange} />);

    fireEvent.click(screen.getByRole("checkbox", { name: "Intercompany" }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
