import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { JsonSchemaProperty } from "./json-schema-form-types";

const reference: JsonSchemaProperty = {
  title: "Field reference",
  type: "object",
  "x-object-display": "row",
  "x-order": ["kind", "name", "binding"],
  required: ["kind", "name"],
  properties: {
    kind: { title: "Kind", enum: ["plan", "policy"], "x-enum-display": "combobox" },
    name: { title: "Name", type: "string" },
    binding: { title: "Binding", type: "string" },
  },
};

function Harness({ initial }: { initial: Record<string, unknown> }) {
  const [value, setValue] = useState<Record<string, unknown>>({ ref: initial });
  return (
    <>
      <JsonSchemaForm
        schema={{ properties: { ref: reference } }}
        value={value}
        onChange={setValue}
        applyDefaults={false}
        persistPreferences={false}
      />
      <output>{JSON.stringify(value)}</output>
    </>
  );
}

describe('x-object-display: "row"', () => {
  it("renders the object's fields as one row of cells in x-order, not a headed section", () => {
    const { container } = render(<Harness initial={{ kind: "plan", name: "premium" }} />);
    const row = container.querySelector("[data-jsf-object-row]");
    expect(row).not.toBeNull();
    const cells = Array.from(row!.querySelectorAll("[data-jsf-row-cell]")).map((cell) =>
      cell.getAttribute("data-jsf-row-cell"),
    );
    expect(cells).toEqual(["kind", "name", "binding"]);
    expect(screen.getByText("Field reference")).toBeTruthy();
  });

  it("keeps each control labelled for assistive tech and commits edits into the object", () => {
    render(<Harness initial={{ kind: "plan", name: "premium" }} />);
    fireEvent.change(screen.getByLabelText(/^Binding/), { target: { value: "item" } });
    expect(JSON.parse(screen.getByRole("status").textContent ?? "")).toEqual({
      ref: { kind: "plan", name: "premium", binding: "item" },
    });
  });
});
