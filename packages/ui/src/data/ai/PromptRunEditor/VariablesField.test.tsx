import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VariablesField } from "./VariablesField";

describe("VariablesField", () => {
  it("synchronizes replacement values without overwriting an active edit", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <VariablesField value={{ company: "Acme" }} onChange={onChange} />,
    );
    const input = screen.getByRole("textbox", { name: "Variables JSON" });

    rerender(
      <VariablesField value={{ company: "Example" }} onChange={onChange} />,
    );
    expect(input).toHaveValue('{\n  "company": "Example"\n}');

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '{"draft":' } });
    rerender(<VariablesField value={{ server: true }} onChange={onChange} />);
    expect(input).toHaveValue('{"draft":');

    fireEvent.blur(input);
    expect(input).toHaveValue('{\n  "server": true\n}');
    fireEvent.change(input, { target: { value: '{"saved":true}' } });
    expect(onChange).toHaveBeenLastCalledWith({ saved: true });
  });
});
