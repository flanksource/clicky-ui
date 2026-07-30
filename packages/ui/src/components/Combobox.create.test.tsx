import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Combobox, type ComboboxOption } from "./Combobox";

const OPTIONS: ComboboxOption[] = [
  { value: "80", label: "http (80)" },
  { value: "443", label: "https (443)" },
];

describe("Combobox custom value transforms", () => {
  it("renders an onNew candidate and commits its onCreate result", () => {
    const onChange = vi.fn();
    render(
      <Combobox
        value=""
        onChange={onChange}
        options={OPTIONS}
        onNew={(value) => ({
          value,
          label: `Use ${value} — not exposed`,
        })}
        onCreate={(option) => `port:${option.value}`}
      />,
    );

    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "9443" } });

    const candidate = screen.getByRole("option", {
      name: "Use 9443 — not exposed",
    });
    fireEvent.mouseDown(candidate);
    fireEvent.click(candidate);

    expect(onChange).toHaveBeenCalledWith("port:9443");
  });

  it("uses onNew to decorate a controlled unmatched value", () => {
    render(
      <Combobox
        value="9443"
        onChange={vi.fn()}
        options={OPTIONS}
        onNew={(value) => ({
          value,
          label: `Use ${value} — not exposed`,
          selectedLabel: value,
          icon: <span title="Port is not exposed by the selected workload">!</span>,
        })}
        onCreate={(option) => option.value}
      />,
    );

    expect(screen.getByRole("combobox")).toHaveValue("9443");
    expect(
      screen.getByTitle("Port is not exposed by the selected workload"),
    ).toBeInTheDocument();
  });

  it("does not commit input rejected by onNew", () => {
    const onChange = vi.fn();
    render(
      <Combobox
        value=""
        onChange={onChange}
        options={OPTIONS}
        onNew={() => null}
        onCreate={(option) => option.value}
      />,
    );

    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "invalid" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onChange).not.toHaveBeenCalled();
    expect(input).toHaveValue("");
  });

  it("does not commit a candidate rejected by onCreate", () => {
    const onChange = vi.fn();
    render(
      <Combobox
        value=""
        onChange={onChange}
        options={OPTIONS}
        onNew={(value) => ({ value, label: `Use ${value}` })}
        onCreate={() => null}
      />,
    );

    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "9443" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onChange).not.toHaveBeenCalled();
    expect(input).toHaveValue("");
  });
});
