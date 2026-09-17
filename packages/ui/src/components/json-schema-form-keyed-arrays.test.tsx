import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { JsonSchemaObject } from "./json-schema-form-types";

function keyedSchema(count: number, itemless = false): JsonSchemaObject {
  return {
    type: "object",
    properties: Object.fromEntries(
      ["Person", "Employer", "Trust", "Partner"].slice(0, count).map((key) => [
        key,
        {
          type: "array",
          title: `${key} clients`,
          ...(!itemless && { items: { type: "object", properties: { Name: { type: "string" } } } }),
        },
      ]),
    ),
  };
}

function Harness({ count, initial = {}, itemless = false }: { count: number; initial?: Record<string, unknown>; itemless?: boolean }) {
  const [value, setValue] = useState(initial);
  return (
    <JsonSchemaForm
      schema={keyedSchema(count, itemless)}
      value={value}
      onChange={setValue}
      showPreferencesMenu={false}
    />
  );
}

describe("inferred keyed-array objects", () => {
  it("keeps three array properties in the ordinary form", () => {
    render(<Harness count={3} />);
    expect(screen.queryByRole("combobox", { name: "Add item" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Add item" })).toHaveLength(3);
  });

  it("hides four empty sections and offers their keys in one searchable picker", () => {
    render(<Harness count={4} />);
    expect(screen.queryByRole("button", { name: "Add item" })).not.toBeInTheDocument();
    const picker = screen.getByRole("combobox", { name: "Add item" });
    fireEvent.change(picker, { target: { value: "emp" } });
    expect(screen.getByRole("option", { name: /Employer clients/ })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /Person clients/ })).not.toBeInTheDocument();
    fireEvent.mouseDown(screen.getByRole("option", { name: /Employer clients/ }));
    expect(screen.getByText("Employer clients")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add item" })).toBeInTheDocument();
    expect(screen.queryByText("Person clients")).not.toBeInTheDocument();
  });

  it("retains an existing array section and its own add button", () => {
    render(<Harness count={4} initial={{ Person: [{ Name: "Alice" }] }} />);
    expect(screen.getByText("Person clients")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add item" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Add item" })).toBeInTheDocument();
  });

  it("adds a scalar item when an array schema omits items", () => {
    render(<Harness count={4} itemless />);
    fireEvent.click(screen.getByRole("combobox", { name: "Add item" }));
    fireEvent.mouseDown(screen.getByRole("option", { name: /Person clients/ }));
    expect(screen.getByText("Person clients")).toBeInTheDocument();
  });
});
