import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { JsonSchemaObject } from "./json-schema-form-types";

// A connection keeps host/port/database in its `properties` map, but they are
// alternatives to the URL, so the form lifts them up beside it.
const schema: JsonSchemaObject = {
  type: "object",
  properties: {
    name: { type: "string", title: "Name", "x-clicky-order": 0 },
    url: { type: "string", title: "URL", "x-clicky-order": 2 },
    username: { type: "string", title: "Username", "x-clicky-order": 4 },
    properties: {
      type: "object",
      title: "Properties",
      "x-clicky-order": 7,
      required: ["host"],
      properties: {
        host: { type: "string", title: "Host", "x-clicky-order": 2.1, "x-clicky-hoist": true },
        port: { type: "string", title: "Port", "x-clicky-order": 2.2, "x-clicky-hoist": true },
        sslmode: { type: "string", title: "SSL mode", "x-clicky-order": 0 },
      },
    },
  },
};

function fieldLabels(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll("input[id]"), (input) => {
    const label = container.querySelector(`label[for="${input.id}"]`);
    return label?.textContent?.replace("*", "").trim() ?? input.id;
  });
}

describe("x-clicky-hoist", () => {
  it("renders a nested field in its parent's grid at its own order", () => {
    const { container } = render(
      <JsonSchemaForm schema={schema} value={{}} onChange={vi.fn()} showPreferencesMenu={false} />,
    );

    expect(fieldLabels(container)).toEqual(["Name", "URL", "Host", "Port", "Username", "SSL mode"]);
    expect(screen.getAllByLabelText(/^Host/)).toHaveLength(1);
    expect(screen.getByText("Properties")).toBeInTheDocument();
  });

  it("writes a hoisted field's edits into the nested object", () => {
    const onChange = vi.fn();
    render(
      <JsonSchemaForm
        schema={schema}
        value={{ properties: { sslmode: "require" } }}
        onChange={onChange}
        showPreferencesMenu={false}
      />,
    );

    fireEvent.change(screen.getByLabelText(/^Host/), { target: { value: "db.example.com" } });

    expect(onChange).toHaveBeenLastCalledWith({
      properties: { sslmode: "require", host: "db.example.com" },
    });
  });

  it("drops the nested section when every field in it is hoisted", () => {
    const hoistedOnly: JsonSchemaObject = {
      type: "object",
      properties: {
        url: { type: "string", title: "URL", "x-clicky-order": 2 },
        properties: {
          type: "object",
          title: "Properties",
          properties: {
            host: { type: "string", title: "Host", "x-clicky-order": 2.1, "x-clicky-hoist": true },
          },
        },
      },
    };
    render(<JsonSchemaForm schema={hoistedOnly} value={{}} onChange={vi.fn()} showPreferencesMenu={false} />);

    expect(screen.getByLabelText(/^Host/)).toBeInTheDocument();
    expect(screen.queryByText("Properties")).toBeNull();
  });
});
