import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { JsonSchemaObject } from "./json-schema-form-types";

const schema: JsonSchemaObject = {
  type: "object",
  properties: { x: { type: "number", "x-number-display": "stepper", minimum: -10, maximum: 100 } },
};

describe("decimal number steppers", () => {
  it("accepts manually entered fractions and steps relative to the fractional value", () => {
    const onChange = vi.fn();
    render(<JsonSchemaForm schema={schema} value={{ x: 80.125 }} onChange={onChange} />);
    const input = screen.getByRole<HTMLInputElement>("spinbutton", { name: "x" });
    expect(input.validity.valid).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Increase x" }));
    expect(onChange).toHaveBeenLastCalledWith({ x: 81.125 });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(onChange).toHaveBeenLastCalledWith({ x: 79.125 });
    fireEvent.change(input, { target: { value: "3.141592" } });
    expect(onChange).toHaveBeenLastCalledWith({ x: 3.141592 });
    expect(input.validity.stepMismatch).toBe(false);
  });

  it("keeps the declared bounds and allows clearing the field", () => {
    const onChange = vi.fn();
    render(<JsonSchemaForm schema={schema} value={{ x: 99.75 }} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Increase x" }));
    expect(onChange).toHaveBeenLastCalledWith({ x: 100 });
    fireEvent.change(screen.getByRole("spinbutton", { name: "x" }), { target: { value: "" } });
    expect(onChange).toHaveBeenLastCalledWith({ x: "" });
  });
});
