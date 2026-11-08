import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { JsonSchemaProperty } from "./json-schema-form-types";

function Harness({
  schema,
  initial,
  required = false,
}: {
  schema: JsonSchemaProperty;
  initial: unknown;
  required?: boolean;
}) {
  const [value, setValue] = useState({ field: initial });
  return (
    <>
      <JsonSchemaForm
        schema={{
          properties: { field: { title: "Field", ...schema } },
          required: required ? ["field"] : [],
        }}
        value={value}
        onChange={setValue}
        applyDefaults={false}
        persistPreferences={false}
      />
      <output>{JSON.stringify(value)}</output>
    </>
  );
}

describe("nullable fields", () => {
  it.each<JsonSchemaProperty>([
    { type: ["number", "null"] },
    { type: ["string", "null"], enum: ["auto", "manual", null] },
    { type: ["array", "null"], items: { type: "string" } },
    { type: ["object", "null"], properties: { name: { type: "string" } } },
    { type: ["string", "null"], format: "date-time" },
  ])("preserves missing values on opening %j", (schema) => {
    render(<Harness schema={schema} initial={undefined} />);
    expect(screen.getByRole("status")).toHaveTextContent("{}");
    expect(
      screen.queryByRole("combobox", { name: /format/ }),
    ).not.toBeInTheDocument();
  });
  it("resolves nullable fields through bundled references and hides clear in read-only forms", () => {
    const onChange = () => {
      throw new Error("Opening a form must not write");
    };
    const { rerender } = render(
      <JsonSchemaForm
        schema={{
          properties: { name: { $ref: "#/$defs/name" } },
          $defs: { name: { type: ["string", "null"], title: "Name" } },
        }}
        value={{ name: "initial" }}
        onChange={onChange}
        applyDefaults={false}
        persistPreferences={false}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Clear Name to null" }),
    ).toBeInTheDocument();
    rerender(
      <JsonSchemaForm
        schema={{
          properties: { name: { type: ["string", "null"], title: "Name" } },
        }}
        value={{ name: "initial" }}
        onChange={onChange}
        readOnly
        applyDefaults={false}
        persistPreferences={false}
      />,
    );
    expect(
      screen.queryByRole("button", { name: "Clear Name to null" }),
    ).not.toBeInTheDocument();
  });
  it.each<JsonSchemaProperty>([
    { type: ["string", "null"] },
    { anyOf: [{ type: "null" }, { type: "string" }] },
    { oneOf: [{ type: "string" }, { const: null }] },
  ])("renders one text control and clears to actual null for %j", (schema) => {
    render(<Harness schema={schema} initial="initial" required />);
    expect(
      screen.queryByRole("combobox", { name: /format/ }),
    ).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Clear Field to null" }),
    );
    expect(screen.getByRole("textbox", { name: "Field *" })).toHaveValue("");
    expect(screen.getByRole("status")).toHaveTextContent('{"field":null}');
    expect(screen.queryByText("Required")).not.toBeInTheDocument();
  });
  it("preserves a nullable date picker", () => {
    const { container } = render(
      <Harness
        schema={{
          anyOf: [{ type: "string", format: "date" }, { type: "null" }],
        }}
        initial={null}
      />,
    );
    expect(container.querySelector('input[type="date"]')).toBeTruthy();
    expect(
      screen.queryByRole("combobox", { name: /format/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent('{"field":null}');
  });
  it("distinguishes false from null", () => {
    render(<Harness schema={{ type: ["boolean", "null"] }} initial={null} />);
    fireEvent.change(screen.getByRole("combobox", { name: "Field" }), {
      target: { value: "false" },
    });
    expect(screen.getByRole("status")).toHaveTextContent('{"field":false}');
  });
  it("keeps real string variants selectable", () => {
    render(
      <Harness
        schema={{
          anyOf: [
            { type: "string", format: "date", title: "Date" },
            { type: "string", title: "Text" },
            { type: "null" },
          ],
        }}
        initial="plain text"
      />,
    );
    expect(screen.getByRole("combobox", { name: "Field format" })).toHaveValue(
      "1",
    );
    fireEvent.change(screen.getByRole("combobox", { name: "Field format" }), { target: { value: "0" } });
    expect(screen.getByRole("combobox", { name: "Field format" })).toHaveValue("0");
    fireEvent.change(screen.getByRole("combobox", { name: "Field format" }), { target: { value: "1" } });
    expect(screen.getByRole("status")).toHaveTextContent('{"field":"plain text"}');
  });
});
