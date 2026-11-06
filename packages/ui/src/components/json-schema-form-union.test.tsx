import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { JsonSchemaProperty } from "./json-schema-form-types";

const scalarBranches: JsonSchemaProperty[] = [{ type: "string" }, { type: "number" }, { type: "boolean" }];

function ScalarForm({ schema, initial }: { schema: JsonSchemaProperty; initial: unknown }) {
  const [value, setValue] = useState({ parameter: initial });
  return <>
    <JsonSchemaForm schema={{ properties: { parameter: { ...schema, title: "Parameter" } } }} value={value}
      onChange={(next) => setValue({ parameter: next.parameter })} showPreferencesMenu={false} />
    <output>{JSON.stringify(value)}</output>
  </>;
}

describe("scalar union controls", () => {
  it.each<JsonSchemaProperty>([
    { anyOf: scalarBranches },
    { oneOf: scalarBranches },
    { type: ["string", "number", "boolean"] },
  ])("edits strings without a variant selector for %j", (schema) => {
    render(<ScalarForm schema={schema} initial="Credit Note" />);
    expect(screen.queryByRole("combobox", { name: "Parameter format" })).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "Parameter" }), { target: { value: "01" } });
    expect(screen.getByRole("status")).toHaveTextContent('{"parameter":"01"}');
  });

  it("edits numbers as numbers without a variant selector", () => {
    render(<ScalarForm schema={{ anyOf: scalarBranches }} initial={0} />);
    expect(screen.queryByRole("combobox", { name: "Parameter format" })).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "Parameter" }), { target: { value: "12.5" } });
    expect(screen.getByRole("status")).toHaveTextContent('{"parameter":12.5}');
  });

  it("edits booleans as booleans without a variant selector", () => {
    render(<ScalarForm schema={{ anyOf: scalarBranches }} initial={false} />);
    expect(screen.queryByRole("combobox", { name: "Parameter format" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox", { name: "Parameter" }));
    expect(screen.getByRole("status")).toHaveTextContent('{"parameter":true}');
  });

  it("uses the first declared type for an unset value without committing a default", () => {
    render(<ScalarForm schema={{ anyOf: scalarBranches }} initial={undefined} />);
    expect(screen.getByRole("textbox", { name: "Parameter" })).toHaveValue("");
    expect(screen.queryByRole("combobox", { name: "Parameter format" })).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("{}");
  });

  it("keeps explicit choices for named scalar branches", () => {
    render(<ScalarForm schema={{ anyOf: [{ type: "string", title: "Command" }, { type: "boolean", title: "Toggle" }] }} initial="read" />);
    fireEvent.change(screen.getByRole("combobox", { name: "Parameter format" }), { target: { value: "1" } });
    expect(screen.getByRole("status")).toHaveTextContent('{"parameter":false}');
  });
});
