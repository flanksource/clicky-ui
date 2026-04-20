import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Select } from "./select";

describe("Select", () => {
  it("renders provided options", () => {
    render(
      <Select
        options={[
          { value: "a", label: "Alpha" },
          { value: "b", label: "Bravo" },
        ]}
      />,
    );
    expect(screen.getByRole("option", { name: "Alpha" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Bravo" })).toBeInTheDocument();
  });

  it("renders a disabled placeholder when placeholder prop is provided", () => {
    render(<Select placeholder="Pick one" options={[{ value: "x", label: "X" }]} />);
    const placeholder = screen.getByRole("option", { name: "Pick one" }) as HTMLOptionElement;
    expect(placeholder.disabled).toBe(true);
    expect(placeholder.value).toBe("");
  });

  it("fires onChange with the selected value", () => {
    const onChange = vi.fn();
    render(
      <Select
        onChange={onChange}
        options={[
          { value: "a", label: "Alpha" },
          { value: "b", label: "Bravo" },
        ]}
      />,
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "b" } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(screen.getByRole<HTMLSelectElement>("combobox").value).toBe("b");
  });

  it("honors the disabled attribute on individual options", () => {
    render(
      <Select
        options={[
          { value: "a", label: "Alpha" },
          { value: "b", label: "Bravo", disabled: true },
        ]}
      />,
    );
    expect(screen.getByRole<HTMLOptionElement>("option", { name: "Bravo" }).disabled).toBe(true);
  });

  it("renders children when no options prop is passed", () => {
    render(
      <Select>
        <option value="x">Custom X</option>
        <option value="y">Custom Y</option>
      </Select>,
    );
    expect(screen.getByRole("option", { name: "Custom X" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Custom Y" })).toBeInTheDocument();
  });
});
