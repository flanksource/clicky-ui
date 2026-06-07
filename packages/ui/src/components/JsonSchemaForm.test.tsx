import { type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type {
  FieldControl,
  JsonSchemaObject,
  PostExtension,
  PreExtension,
} from "./json-schema-form-types";

function lastCall(fn: ReturnType<typeof vi.fn>): unknown {
  return fn.mock.calls[fn.mock.calls.length - 1]?.[0];
}

describe("JsonSchemaForm extension pipeline", () => {
  const schema: JsonSchemaObject = {
    type: "object",
    properties: {
      Name: { type: "string" },
      secret: { type: "string" },
    },
  };

  it("drops a field when a pre-extension returns null", () => {
    const dropSecret: PreExtension = (field) => (field.key === "secret" ? null : field);
    render(
      <JsonSchemaForm schema={schema} value={{ Name: "x", secret: "y" }} onChange={vi.fn()} pre={[dropSecret]} />,
    );
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.queryByText("secret")).not.toBeInTheDocument();
  });

  it("reflects a pre-extension that sets a badge", () => {
    const badge: PreExtension = (field) => ({ ...field, badge: "AsCode" });
    render(<JsonSchemaForm schema={schema} value={{ Name: "x", secret: "y" }} onChange={vi.fn()} pre={[badge]} />);
    expect(screen.getAllByText("AsCode").length).toBeGreaterThan(0);
  });

  it("renders a post-extension's wrapped value node and lets its button mutate the field", () => {
    const onChange = vi.fn();
    const insert: PostExtension = (field: FieldControl, nodes: { label: ReactNode; value: ReactNode }) => ({
      label: nodes.label,
      value: (
        <div>
          {nodes.value}
          <button type="button" onClick={() => field.onChange("{{token}}")}>
            insert {field.key}
          </button>
        </div>
      ),
    });
    render(
      <JsonSchemaForm
        schema={{ type: "object", properties: { Name: { type: "string" } } }}
        value={{ Name: "" }}
        onChange={onChange}
        post={[insert]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "insert Name" }));
    expect(onChange).toHaveBeenCalledWith({ Name: "{{token}}" });
  });
});

describe("JsonSchemaForm number coercion", () => {
  const schema: JsonSchemaObject = { type: "object", properties: { Amount: { type: "number" } } };

  it("coerces a clean numeric string to a Number by default", () => {
    const onChange = vi.fn();
    render(<JsonSchemaForm schema={schema} value={{ Amount: "" }} onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "1755" } });
    expect(onChange).toHaveBeenCalledWith({ Amount: 1755 });
  });

  it("preserves a non-numeric string when a pre-extension disables coercion", () => {
    const onChange = vi.fn();
    const noCoerce: PreExtension = (field) => ({ ...field, coerceNumber: false });
    render(<JsonSchemaForm schema={schema} value={{ Amount: "" }} onChange={onChange} pre={[noCoerce]} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "{{intake.fileId}}" } });
    expect(onChange).toHaveBeenCalledWith({ Amount: "{{intake.fileId}}" });
  });
});

describe("JsonSchemaForm boolean fallback", () => {
  it("renders a checkbox for a boolean value", () => {
    render(
      <JsonSchemaForm
        schema={{ type: "object", properties: { spawned: { type: "boolean" } } }}
        value={{ spawned: true }}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("falls back to a text input when the value is a non-boolean (token)", () => {
    render(
      <JsonSchemaForm
        schema={{ type: "object", properties: { spawned: { type: "boolean" } } }}
        value={{ spawned: "{{flag}}" }}
        onChange={vi.fn()}
      />,
    );
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveValue("{{flag}}");
  });
});

describe("JsonSchemaForm enum custom value", () => {
  it("commits a custom value when allowCustomValue is set", () => {
    const onChange = vi.fn();
    const allowCustom: PreExtension = (field) => ({ ...field, allowCustomValue: true });
    render(
      <JsonSchemaForm
        schema={{ type: "object", properties: { opt: { type: "string", enum: ["APPROVED"] } } }}
        value={{ opt: "" }}
        onChange={onChange}
        pre={[allowCustom]}
      />,
    );
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "{{x}}" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(lastCall(onChange)).toEqual({ opt: "{{x}}" });
  });

  it("still displays a current value outside the option set", () => {
    render(
      <JsonSchemaForm
        schema={{ type: "object", properties: { opt: { type: "string", enum: ["APPROVED"] } } }}
        value={{ opt: "{{scheme.number}}" }}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("combobox")).toHaveValue("{{scheme.number}}");
  });
});

describe("JsonSchemaForm string-map", () => {
  const schema: JsonSchemaObject = {
    type: "object",
    properties: {
      members: { type: "object", additionalProperties: { type: "string" } },
    },
  };

  it("adds a blank field row on Add field", () => {
    const onChange = vi.fn();
    render(<JsonSchemaForm schema={schema} value={{ members: {} }} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /add field/i }));
    expect(onChange).toHaveBeenCalledWith({ members: { "": "" } });
  });

  it("round-trips a key containing a slash", () => {
    const onChange = vi.fn();
    render(
      <JsonSchemaForm schema={schema} value={{ members: { "Approved/Rejected": "Approved" } }} onChange={onChange} />,
    );
    const input = screen.getAllByRole("textbox").find((el) => (el as HTMLInputElement).value === "Approved");
    expect(input).toBeTruthy();
    fireEvent.change(input as HTMLElement, { target: { value: "Rejected" } });
    expect(onChange).toHaveBeenCalledWith({ members: { "Approved/Rejected": "Rejected" } });
  });
});

describe("JsonSchemaForm validation + if/then", () => {
  it("shows a Required hint but does not block editing", () => {
    const onChange = vi.fn();
    render(
      <JsonSchemaForm
        schema={{ type: "object", required: ["Name"], properties: { Name: { type: "string" } } }}
        value={{ Name: "" }}
        onChange={onChange}
      />,
    );
    expect(screen.getByText("Required")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "a" } });
    expect(onChange).toHaveBeenCalledWith({ Name: "a" });
  });

  it("reveals the activity-specific input fields via if/then", () => {
    const schema: JsonSchemaObject = {
      type: "object",
      properties: {
        activity: { type: "string", enum: ["SchemeMoneyIn"] },
        input: { type: "object" },
      },
      allOf: [
        {
          if: { properties: { activity: { const: "SchemeMoneyIn" } }, required: ["activity"] },
          then: {
            properties: {
              input: {
                type: "object",
                additionalProperties: { type: "string" },
                properties: { Amount: { type: "string" } },
              },
            },
          },
        },
      ],
    };
    render(<JsonSchemaForm schema={schema} value={{ activity: "SchemeMoneyIn", input: {} }} onChange={vi.fn()} />);
    expect(screen.getByText("Amount")).toBeInTheDocument();
  });
});

describe("JsonSchemaForm array of objects", () => {
  const schema: JsonSchemaObject = {
    type: "object",
    properties: {
      servers: {
        type: "array",
        items: {
          type: "object",
          properties: { name: { type: "string" }, port: { type: "integer" } },
          required: ["name"],
        },
      },
    },
  };

  it("adds a seeded object item", () => {
    const onChange = vi.fn();
    render(<JsonSchemaForm schema={schema} value={{ servers: [] }} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /add item/i }));
    expect(onChange).toHaveBeenCalledWith({ servers: [{}] });
  });

  it("edits a nested field in an item immutably", () => {
    const onChange = vi.fn();
    render(<JsonSchemaForm schema={schema} value={{ servers: [{ name: "a" }] }} onChange={onChange} />);
    const nameInput = screen.getAllByRole("textbox").find((el) => (el as HTMLInputElement).value === "a");
    fireEvent.change(nameInput as HTMLElement, { target: { value: "b" } });
    expect(onChange).toHaveBeenCalledWith({ servers: [{ name: "b" }] });
  });

  it("removes an item", () => {
    const onChange = vi.fn();
    render(
      <JsonSchemaForm
        schema={schema}
        value={{ servers: [{ name: "a" }, { name: "b" }] }}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Remove item 1" }));
    expect(onChange).toHaveBeenCalledWith({ servers: [{ name: "b" }] });
  });

  it("reorders items via the down control", () => {
    const onChange = vi.fn();
    render(
      <JsonSchemaForm
        schema={schema}
        value={{ servers: [{ name: "a" }, { name: "b" }] }}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Move item 1 down" }));
    expect(onChange).toHaveBeenCalledWith({ servers: [{ name: "b" }, { name: "a" }] });
  });

  it("shows a Required hint on a missing item field at depth", () => {
    render(<JsonSchemaForm schema={schema} value={{ servers: [{ name: "" }] }} onChange={vi.fn()} />);
    expect(screen.getByText("Required")).toBeInTheDocument();
  });
});

describe("JsonSchemaForm nested object", () => {
  const schema: JsonSchemaObject = {
    type: "object",
    properties: {
      db: {
        type: "object",
        properties: { host: { type: "string" }, port: { type: "integer" } },
        required: ["host"],
      },
    },
  };

  it("edits a nested object field immutably", () => {
    const onChange = vi.fn();
    render(<JsonSchemaForm schema={schema} value={{ db: { host: "x", port: 5432 } }} onChange={onChange} />);
    const hostInput = screen.getAllByRole("textbox").find((el) => (el as HTMLInputElement).value === "x");
    fireEvent.change(hostInput as HTMLElement, { target: { value: "y" } });
    expect(onChange).toHaveBeenCalledWith({ db: { host: "y", port: 5432 } });
  });

  it("shows a Required hint on a missing nested field", () => {
    render(<JsonSchemaForm schema={schema} value={{ db: { host: "" } }} onChange={vi.fn()} />);
    expect(screen.getByText("Required")).toBeInTheDocument();
  });
});

describe("JsonSchemaForm deep recursion", () => {
  // array -> object -> nested number array
  const schema: JsonSchemaObject = {
    type: "object",
    properties: {
      services: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            ports: { type: "array", items: { type: "integer" } },
          },
        },
      },
    },
  };

  it("edits a value two levels deep and rebuilds the full nested structure", () => {
    const onChange = vi.fn();
    render(
      <JsonSchemaForm
        schema={schema}
        value={{ services: [{ name: "web", ports: [80] }] }}
        onChange={onChange}
      />,
    );
    const portInput = screen.getAllByRole("textbox").find((el) => (el as HTMLInputElement).value === "80");
    fireEvent.change(portInput as HTMLElement, { target: { value: "8080" } });
    expect(onChange).toHaveBeenCalledWith({ services: [{ name: "web", ports: [8080] }] });
  });
});

describe("JsonSchemaForm extensions at depth", () => {
  const schema: JsonSchemaObject = {
    type: "object",
    properties: {
      db: { type: "object", properties: { host: { type: "string" } } },
    },
  };

  it("applies a pre-extension badge to a nested field", () => {
    const badge: PreExtension = (field) => (field.key === "host" ? { ...field, badge: "Nested" } : field);
    render(<JsonSchemaForm schema={schema} value={{ db: { host: "" } }} onChange={vi.fn()} pre={[badge]} />);
    expect(screen.getByText("Nested")).toBeInTheDocument();
  });

  it("applies a post-extension button to a nested field that mutates via the depth-correct onChange", () => {
    const onChange = vi.fn();
    const insert: PostExtension = (field, nodes) =>
      field.key === "host"
        ? {
            label: nodes.label,
            value: (
              <div>
                {nodes.value}
                <button type="button" onClick={() => field.onChange("{{token}}")}>
                  insert nested
                </button>
              </div>
            ),
          }
        : nodes;
    render(<JsonSchemaForm schema={schema} value={{ db: { host: "" } }} onChange={onChange} post={[insert]} />);
    fireEvent.click(screen.getByRole("button", { name: "insert nested" }));
    expect(onChange).toHaveBeenCalledWith({ db: { host: "{{token}}" } });
  });
});

describe("JsonSchemaForm array item kinds", () => {
  it("keeps the compact tag UI for plain string items", () => {
    const onChange = vi.fn();
    render(
      <JsonSchemaForm
        schema={{ type: "object", properties: { tags: { type: "array", items: { type: "string" } } } }}
        value={{ tags: ["a"] }}
        onChange={onChange}
      />,
    );
    // tag UI has no "Add item" button; it uses a free-text input committed on Enter
    expect(screen.queryByRole("button", { name: /add item/i })).not.toBeInTheDocument();
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "b" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith({ tags: ["a", "b"] });
  });

  it("renders a combobox per item for enum items (not tags)", () => {
    render(
      <JsonSchemaForm
        schema={{
          type: "object",
          properties: { roles: { type: "array", items: { type: "string", enum: ["admin", "viewer"] } } },
        }}
        value={{ roles: ["admin"] }}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add item/i })).toBeInTheDocument();
  });
});
