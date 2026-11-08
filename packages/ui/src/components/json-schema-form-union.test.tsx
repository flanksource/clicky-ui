import { useState } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
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
    fireEvent.click(screen.getByRole("switch", { name: "Parameter" }));
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

const ownerRef: JsonSchemaProperty = {
  type: "object", additionalProperties: false, required: ["kind", "name"],
  properties: { kind: { title: "Kind", enum: ["policy", "plan"] }, name: { title: "Name", type: "string" } },
};
const fieldAnswer: JsonSchemaProperty = {
  title: "Field Answer", type: "object", unevaluatedProperties: false, required: ["type", "fieldRef"],
  properties: { type: { title: "Type", const: "field" }, fieldRef: { title: "Field reference", ...ownerRef } },
};
const calculationAnswer: JsonSchemaProperty = {
  title: "Calculation Answer", type: "object", unevaluatedProperties: false, required: ["type", "calculation"],
  properties: { type: { title: "Type", const: "calculation" }, calculation: { title: "Calculation", type: "string" } },
};
const dueDate: JsonSchemaProperty = {
  oneOf: [
    { title: "Date answer", description: "A field or a calculation.", oneOf: [fieldAnswer, { allOf: [calculationAnswer], properties: { calculation: { title: "Calculation", type: "string" } } }] },
    { title: "Open questions", type: "object", additionalProperties: false, required: ["open"], properties: { open: { title: "Open", type: "array", items: { type: "string" } } } },
    { title: "Not applicable", type: "object", additionalProperties: false, required: ["notApplicable"], properties: { notApplicable: { title: "Reason", type: "string" } } },
  ],
};

describe("object union controls", () => {
  it("offers nested union branches as one flat choice list labelled by their titles", () => {
    render(<ScalarForm schema={dueDate} initial={undefined} />);
    expect(screen.getAllByRole("combobox", { name: "Parameter format" })).toHaveLength(1);
    const options = within(screen.getByRole("combobox", { name: "Parameter format" })).getAllByRole("option").map((option) => option.textContent);
    expect(options).toEqual(["Field Answer", "Calculation Answer", "Open questions", "Not applicable"]);
  });

  it("keeps the chosen object branch while its required fields are filled in", () => {
    render(<ScalarForm schema={dueDate} initial={undefined} />);
    fireEvent.change(screen.getByRole("combobox", { name: "Parameter format" }), { target: { value: "0" } });
    fireEvent.change(screen.getByRole("textbox", { name: /^Name/ }), { target: { value: "DueDate" } });
    expect(screen.getByRole("combobox", { name: "Parameter format" })).toHaveValue("0");
    expect(screen.getByRole("status")).toHaveTextContent('{"parameter":{"type":"field","fieldRef":{"name":"DueDate"}}}');
  });

  it("selects the branch whose discriminator const and closed keys fit the value", () => {
    render(<ScalarForm schema={dueDate} initial={{ notApplicable: "No premiums" }} />);
    expect(screen.getByRole("combobox", { name: "Parameter format" })).toHaveValue("3");
  });

  it("does not render a satisfied const discriminator as an editable field", () => {
    render(<ScalarForm schema={dueDate} initial={{ type: "field", fieldRef: { kind: "policy", name: "DueDate" } }} />);
    expect(screen.getByRole("combobox", { name: "Parameter format" })).toHaveValue("0");
    expect(screen.queryByRole("textbox", { name: /^Type/ })).not.toBeInTheDocument();
  });
});
