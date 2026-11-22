import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import { siblingPrefixPre } from "./json-schema-form-sibling-prefix";
import type { JsonSchemaObject } from "./json-schema-form-types";

// An integration names its system and the route it takes; the route is drawn as
// a dropdown at the start of the system's input rather than as its own row.
const INTEGRATION = {
  type: "object",
  properties: {
    system: { type: "string", title: "System" },
    via: { title: "Via", enum: ["asfile", "jms"], "x-enum-labels": { asfile: "AsFile", jms: "Jms" } },
    transaction: { type: "string", title: "Transaction" },
  },
} as JsonSchemaObject;
const PRE = [siblingPrefixPre({ key: "system", from: "via" })];

function Harness({ schema = INTEGRATION, initial, onChange }: { schema?: JsonSchemaObject; initial: Record<string, unknown>; onChange: (next: Record<string, unknown>) => void }) {
  const [value, setValue] = useState(initial);
  return <JsonSchemaForm schema={schema} value={value} pre={PRE} layout={{ mode: "stacked" }} showPreferencesMenu={false}
    onChange={(next) => { setValue(next); onChange(next); }} />;
}

describe("siblingPrefixPre", () => {
  it("draws the sibling enum as a dropdown inside the field's input and drops its own row", () => {
    render(<Harness initial={{ system: "D365", via: "jms" }} onChange={vi.fn()} />);
    const select = screen.getByRole("combobox", { name: "Via" }) as HTMLSelectElement;
    expect({
      chosen: select.value,
      options: [...select.options].map((option) => option.textContent),
      inSystemInput: select.closest("[data-jsf-control]")?.contains(screen.getByRole("textbox", { name: "System" })),
      viaRows: screen.queryAllByText("Via").length,
    }).toEqual({ chosen: "jms", options: ["AsFile", "Jms"], inSystemInput: true, viaRows: 0 });
  });

  it("writes the chosen value to the sibling, keeping the field's own value", () => {
    const onChange = vi.fn();
    render(<Harness initial={{ system: "D365", via: "jms" }} onChange={onChange} />);
    fireEvent.change(screen.getByRole("combobox", { name: "Via" }), { target: { value: "asfile" } });
    expect(onChange).toHaveBeenLastCalledWith({ system: "D365", via: "asfile" });
  });

  it("leaves both fields alone in an object without the sibling", () => {
    const schema = { type: "object", properties: { system: { type: "string", title: "System" } } } as JsonSchemaObject;
    render(<Harness schema={schema} initial={{ system: "D365" }} onChange={vi.fn()} />);
    expect({ dropdowns: screen.queryAllByRole("combobox").length, system: (screen.getByRole("textbox", { name: "System" }) as HTMLInputElement).value })
      .toEqual({ dropdowns: 0, system: "D365" });
  });
});
