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

  it("renders the schema title as the label and exposes the property key as a hover tooltip", () => {
    const titled: JsonSchemaObject = {
      type: "object",
      properties: {
        AutoCancelIndicator: { type: "string", title: "Auto Cancel Indicator" },
      },
    };
    render(<JsonSchemaForm schema={titled} value={{ AutoCancelIndicator: "" }} onChange={vi.fn()} />);
    const label = screen.getByText("Auto Cancel Indicator");
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute("title", "AutoCancelIndicator");
  });

  it("omits the tooltip when the label falls back to the property key", () => {
    render(<JsonSchemaForm schema={schema} value={{ Name: "x", secret: "y" }} onChange={vi.fn()} />);
    expect(screen.getByText("Name")).not.toHaveAttribute("title");
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

  it("renders the object as a headed section, not an inline bordered sub-form", () => {
    const { container } = render(
      <JsonSchemaForm schema={schema} value={{ db: { host: "x", port: 5432 } }} onChange={vi.fn()} />,
    );
    // The object's key ("db") renders as a section header (font-semibold), and
    // its fields surface at the top level — host + port labels are both present.
    const header = [...container.querySelectorAll("div")].find(
      (el) => el.textContent === "db" && el.className.includes("font-semibold"),
    );
    expect(header).toBeTruthy();
    expect(screen.getByText("host")).toBeInTheDocument();
    expect(screen.getByText("port")).toBeInTheDocument();
    // No bordered sub-form box (the previous nesting affordance).
    expect(container.querySelector(".rounded-md.border.border-input.p-2")).toBeNull();
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

describe("JsonSchemaForm date fields", () => {
  const schema: JsonSchemaObject = {
    type: "object",
    properties: { when: { type: "string", format: "date-time" } },
  };

  it("renders a date control and commits the typed value", () => {
    const onChange = vi.fn();
    render(<JsonSchemaForm schema={schema} value={{}} onChange={onChange} />);
    const input = screen.getByLabelText("when");
    fireEvent.change(input, { target: { value: "2026-04-15T12:00" } });
    expect(lastCall(onChange)).toEqual({ when: "2026-04-15T12:00" });
  });

  it("renders the human-readable absolute+relative value when read-only", () => {
    render(
      <JsonSchemaForm
        schema={schema}
        value={{ when: "2026-04-15T12:00:00Z" }}
        onChange={vi.fn()}
        readOnly
      />,
    );
    expect(screen.getByText(/2026/)).toBeInTheDocument();
    expect(screen.getByText(/\(.+\)$/)).toBeInTheDocument();
  });
});

describe("JsonSchemaForm readOnly schema fields", () => {
  const schema: JsonSchemaObject = {
    type: "object",
    properties: {
      ClientGUID: { type: "string", readOnly: true },
      FirstName: { type: "string" },
    },
  };

  it("renders a readOnly field as a value span, not an input", () => {
    const { container } = render(
      <JsonSchemaForm
        schema={schema}
        value={{ ClientGUID: "abc-123", FirstName: "Ada" }}
        onChange={vi.fn()}
      />,
    );
    // The editable field still has an input; the read-only one shows its value
    // as static text with no input control.
    expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("Ada");
    expect(screen.getByText("abc-123")).toBeInTheDocument();
    const readOnlyNode = container.querySelector("[data-jsf-readonly]");
    expect(readOnlyNode).not.toBeNull();
    expect(readOnlyNode?.tagName).toBe("SPAN");
    expect(readOnlyNode?.querySelector("input")).toBeNull();
  });

  it("shows an em-dash for an empty readOnly value", () => {
    render(<JsonSchemaForm schema={schema} value={{ FirstName: "Ada" }} onChange={vi.fn()} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("does not commit changes for a readOnly field (it has no editable control)", () => {
    render(<JsonSchemaForm schema={schema} value={{ ClientGUID: "abc-123" }} onChange={vi.fn()} />);
    // Exactly one editable control exists (FirstName); ClientGUID contributes none.
    expect(screen.getAllByRole("textbox")).toHaveLength(1);
  });

  it("omits readOnly fields entirely under hideReadOnlyFields", () => {
    render(
      <JsonSchemaForm
        schema={schema}
        value={{ ClientGUID: "abc-123", FirstName: "Ada" }}
        onChange={vi.fn()}
        hideReadOnlyFields
      />,
    );
    expect(screen.getByText("FirstName")).toBeInTheDocument();
    expect(screen.queryByText("ClientGUID")).not.toBeInTheDocument();
    expect(screen.queryByText("abc-123")).not.toBeInTheDocument();
  });

  it("lets a pre-extension clear readOnly so the field becomes editable again", () => {
    const makeEditable: PreExtension = (field) =>
      field.key === "ClientGUID" ? { ...field, readOnly: false } : field;
    render(
      <JsonSchemaForm
        schema={schema}
        value={{ ClientGUID: "abc-123", FirstName: "Ada" }}
        onChange={vi.fn()}
        pre={[makeEditable]}
      />,
    );
    // Both fields now editable: two text inputs, no read-only span.
    expect(screen.getAllByRole("textbox")).toHaveLength(2);
    expect(document.querySelector("[data-jsf-readonly]")).toBeNull();
  });

  it("formats a readOnly date value human-readably", () => {
    render(
      <JsonSchemaForm
        schema={{
          type: "object",
          properties: { created: { type: "string", format: "date-time", readOnly: true } },
        }}
        value={{ created: "2026-04-15T12:00:00Z" }}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText(/2026/)).toBeInTheDocument();
    expect(screen.getByText(/\(.+\)$/)).toBeInTheDocument();
  });

  it("renders a readOnly enum as a value span, not a combobox", () => {
    render(
      <JsonSchemaForm
        schema={{
          type: "object",
          properties: { status: { type: "string", enum: ["Active", "Closed"], readOnly: true } },
        }}
        value={{ status: "Active" }}
        onChange={vi.fn()}
      />,
    );
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });
});

describe("JsonSchemaForm label icons", () => {
  it("renders an x-icon node before a field's label", () => {
    const schema: JsonSchemaObject = {
      type: "object",
      properties: { region: { type: "string", "x-icon": "mdi:earth" } },
    };
    const { container } = render(
      <JsonSchemaForm schema={schema} value={{}} onChange={vi.fn()} />,
    );
    // The runtime icon name resolves to the dashed-border placeholder glyph when
    // no fallback provider is registered; its presence inside the label confirms
    // the icon slot rendered.
    const label = container.querySelector("label");
    expect(label?.querySelector('[title="mdi:earth"]')).not.toBeNull();
  });
});

describe("JsonSchemaForm layout", () => {
  const schema: JsonSchemaObject = {
    type: "object",
    properties: { Name: { type: "string" } },
  };

  function inlineGrid(container: HTMLElement): HTMLElement | null {
    return [...container.querySelectorAll<HTMLElement>("div")].find((el) =>
      el.style.gridTemplateColumns.includes("minmax"),
    ) ?? null;
  }

  it("caps inline label and value columns at the 40ch / 400px defaults", () => {
    const { container } = render(
      <JsonSchemaForm schema={schema} value={{ Name: "" }} onChange={vi.fn()} inline />,
    );
    expect(inlineGrid(container)?.style.gridTemplateColumns).toBe(
      "minmax(0, 40ch) minmax(0, 400px)",
    );
  });

  it("honors an explicit layout override and prefers it over the inline alias", () => {
    const { container } = render(
      <JsonSchemaForm
        schema={schema}
        value={{ Name: "" }}
        onChange={vi.fn()}
        inline
        layout={{ mode: "inline", labelMaxWidth: "12rem", valueMaxWidth: "600px" }}
      />,
    );
    expect(inlineGrid(container)?.style.gridTemplateColumns).toBe(
      "minmax(0, 12rem) minmax(0, 600px)",
    );
  });

  it("applies no width caps in the default stacked layout", () => {
    const { container } = render(
      <JsonSchemaForm schema={schema} value={{ Name: "" }} onChange={vi.fn()} />,
    );
    expect(inlineGrid(container)).toBeNull();
  });
});

describe("JsonSchemaForm map key picker (propertyNames)", () => {
  const schema: JsonSchemaObject = {
    type: "object",
    properties: {
      addresses: {
        type: "object",
        propertyNames: { enum: ["Home", "Business"] },
        additionalProperties: { type: "object", properties: { city: { type: "string" } } },
      },
    },
  };

  it("renders the map key as a picker constrained to propertyNames.enum", () => {
    const onChange = vi.fn();
    render(<JsonSchemaForm schema={schema} value={{ addresses: { "": {} } }} onChange={onChange} />);
    const keyBox = screen.getByRole("combobox");
    fireEvent.focus(keyBox);
    fireEvent.click(keyBox);
    const home = screen.getByRole("option", { name: "Home" });
    fireEvent.mouseDown(home);
    expect(lastCall(onChange)).toEqual({ addresses: { Home: {} } });
  });

  it("rejects a key outside the enum (strict, no custom values)", () => {
    const onChange = vi.fn();
    render(<JsonSchemaForm schema={schema} value={{ addresses: { "": {} } }} onChange={onChange} />);
    const keyBox = screen.getByRole("combobox");
    fireEvent.change(keyBox, { target: { value: "Garage" } });
    fireEvent.keyDown(keyBox, { key: "Enter" });
    // allowCustomValue={false}: the typed non-option is discarded, so the empty
    // key is never renamed to "Garage".
    const renamed = onChange.mock.calls.some(
      (c) => JSON.stringify(c[0]) === JSON.stringify({ addresses: { Garage: {} } }),
    );
    expect(renamed).toBe(false);
  });

  it("stacks the key above the value when the entry value is x-layout: stack", () => {
    const stackSchema: JsonSchemaObject = {
      type: "object",
      properties: {
        addresses: {
          type: "object",
          propertyNames: { enum: ["Home", "Business"] },
          additionalProperties: {
            type: "object",
            "x-layout": "stack",
            properties: { line1: { type: "string" }, city: { type: "string" } },
          },
        },
      },
    };
    const { container } = render(
      <JsonSchemaForm
        schema={stackSchema}
        value={{ addresses: { Home: { line1: "1 Maple St", city: "Mbabane" } } }}
        onChange={vi.fn()}
      />,
    );
    // No fixed key-column grid: the key picker is not in a `10rem _ auto` row.
    const keyColumnGrid = [...container.querySelectorAll<HTMLElement>("div")].find((el) =>
      el.className.includes("grid-cols-[10rem"),
    );
    expect(keyColumnGrid).toBeUndefined();
    // Both the key picker and the stacked value fields are present in one unit.
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByDisplayValue("1 Maple St")).toBeInTheDocument();
  });
});

describe("JsonSchemaForm map value form varies by key (patternProperties)", () => {
  const schema: JsonSchemaObject = {
    type: "object",
    properties: {
      dwellings: {
        type: "object",
        propertyNames: { enum: ["House", "Apartment"] },
        additionalProperties: false,
        patternProperties: {
          "^House$": { type: "object", properties: { lotSize: { type: "string", title: "Lot size" } } },
          "^Apartment$": { type: "object", properties: { unit: { type: "string", title: "Unit" } } },
        },
      },
    },
  };

  it("renders the House value form for a House key", () => {
    render(<JsonSchemaForm schema={schema} value={{ dwellings: { House: { lotSize: "600" } } }} onChange={vi.fn()} />);
    expect(screen.getByDisplayValue("600")).toBeInTheDocument();
    expect(screen.getByText("Lot size")).toBeInTheDocument();
    expect(screen.queryByText("Unit")).not.toBeInTheDocument();
  });

  it("renders the Apartment value form for an Apartment key", () => {
    render(<JsonSchemaForm schema={schema} value={{ dwellings: { Apartment: { unit: "4B" } } }} onChange={vi.fn()} />);
    expect(screen.getByDisplayValue("4B")).toBeInTheDocument();
    expect(screen.getByText("Unit")).toBeInTheDocument();
    expect(screen.queryByText("Lot size")).not.toBeInTheDocument();
  });

  it("still offers Add field even though additionalProperties is false (keys are picker-constrained)", () => {
    render(<JsonSchemaForm schema={schema} value={{ dwellings: {} }} onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /add field/i })).toBeInTheDocument();
  });
});

describe("JsonSchemaForm x-layout: table", () => {
  const schema: JsonSchemaObject = {
    type: "object",
    properties: {
      rows: {
        type: "array",
        "x-layout": "table",
        items: {
          type: "object",
          properties: { name: { type: "string" }, port: { type: "integer" } },
        },
      },
    },
  };

  it("renders column headers and one editable row per item", () => {
    const onChange = vi.fn();
    render(
      <JsonSchemaForm schema={schema} value={{ rows: [{ name: "a", port: 80 }] }} onChange={onChange} />,
    );
    expect(screen.getByRole("columnheader", { name: "name" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "port" })).toBeInTheDocument();
    const nameInput = screen.getByDisplayValue("a");
    fireEvent.change(nameInput, { target: { value: "b" } });
    expect(lastCall(onChange)).toEqual({ rows: [{ name: "b", port: 80 }] });
  });

  it("renders full-width (no inline label/value grid) even when the form is inline", () => {
    const inlineGrid = (container: HTMLElement): HTMLElement | null =>
      [...container.querySelectorAll<HTMLElement>("div")].find((el) =>
        el.style.gridTemplateColumns.includes("minmax"),
      ) ?? null;
    const { container } = render(
      <JsonSchemaForm schema={schema} value={{ rows: [{ name: "a", port: 80 }] }} onChange={vi.fn()} inline />,
    );
    // The table is laid out as a headed full-width section, not crammed into the
    // narrow inline value column — so no minmax label/value grid wraps it.
    expect(inlineGrid(container)).toBeNull();
    expect(screen.getByRole("columnheader", { name: "name" })).toBeInTheDocument();
  });
});

describe("JsonSchemaForm x-layout: stack", () => {
  function inlineGrid(container: HTMLElement): HTMLElement | null {
    return [...container.querySelectorAll<HTMLElement>("div")].find((el) =>
      el.style.gridTemplateColumns.includes("minmax"),
    ) ?? null;
  }

  it("forces a stacked subtree even when the form is inline", () => {
    const schema: JsonSchemaObject = {
      type: "object",
      properties: {
        addr: {
          type: "object",
          "x-layout": "stack",
          properties: { city: { type: "string" }, state: { type: "string" } },
        },
      },
    };
    const { container } = render(
      <JsonSchemaForm schema={schema} value={{ addr: { city: "", state: "" } }} onChange={vi.fn()} inline />,
    );
    // The address object's children render stacked (no inline grid), despite the
    // form-level inline mode.
    expect(inlineGrid(container)).toBeNull();
  });
});
