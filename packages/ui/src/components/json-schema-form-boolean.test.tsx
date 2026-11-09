import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";

const schema = { properties: { enabled: { type: "boolean" as const, title: "Enabled" } } };

describe("boolean form switches", () => {
  it.each([true, false])("toggles a %s value without changing its boolean type", initial => {
    function Form() {
      const [value, setValue] = useState<Record<string, unknown>>({ enabled: initial });
      return <><JsonSchemaForm schema={schema} value={value} onChange={setValue} applyDefaults={false} persistPreferences={false} /><output>{JSON.stringify(value)}</output></>;
    }
    render(<Form />);
    const toggle = screen.getByRole("switch", { name: "Enabled" });
    expect(toggle).toHaveAttribute("aria-checked", String(initial));
    fireEvent.click(toggle);
    expect(screen.getByRole("status")).toHaveTextContent(JSON.stringify({ enabled: !initial }));
    fireEvent.click(screen.getByLabelText("Enabled"));
    expect(screen.getByRole("status")).toHaveTextContent(JSON.stringify({ enabled: initial }));
  });

  it("connects required and invalid field hints to the switch", () => {
    render(<JsonSchemaForm schema={{ ...schema, required: ["enabled"] }} value={{ enabled: false }} onChange={vi.fn()} errors={[{ instancePath: "/enabled", message: "Enable this option" }]} applyDefaults={false} persistPreferences={false} />);
    const toggle = screen.getByRole("switch", { name: /Enabled/ });
    expect(toggle).toHaveAttribute("aria-required", "true");
    expect(toggle).toHaveAttribute("aria-invalid", "true");
    expect(document.getElementById(toggle.getAttribute("aria-describedby")!)).toHaveTextContent("Enable this option");
  });

  it("keeps disabled booleans noninteractive", () => {
    const onChange = vi.fn();
    render(<JsonSchemaForm schema={{ properties: { enabled: { ...schema.properties.enabled, "x-disabled": true } } }} value={{ enabled: true }} onChange={onChange} applyDefaults={false} persistPreferences={false} />);
    const toggle = screen.getByRole("switch", { name: "Enabled" });
    expect(toggle).toBeDisabled();
    fireEvent.click(toggle);
    expect(onChange).not.toHaveBeenCalled();
  });
});
