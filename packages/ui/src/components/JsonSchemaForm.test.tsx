import { type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
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

describe("JsonSchemaForm field suffix slot", () => {
  it("renders a pre-extension's suffix inside the control wrapper for a string field", () => {
    const withSuffix: PreExtension = (field) => ({
      ...field,
      suffix: <button type="button">adorn {field.key}</button>,
    });
    render(
      <JsonSchemaForm
        schema={{ type: "object", properties: { Name: { type: "string" } } }}
        value={{ Name: "" }}
        onChange={vi.fn()}
        pre={[withSuffix]}
      />,
    );
    const suffix = screen.getByRole("button", { name: "adorn Name" });
    const wrapper = suffix.closest("[data-jsf-control]");
    expect(wrapper).not.toBeNull();
    // The control's input is a sibling under the same data-jsf-control wrapper, so
    // a suffix adornment can locate it for caret-aware insertion.
    expect(wrapper?.querySelector("input[data-jsf-input]")).not.toBeNull();
  });

  it("renders the suffix inside an enum (combobox) field's control wrapper", () => {
    const withSuffix: PreExtension = (field) => ({
      ...field,
      suffix: <button type="button">adorn {field.key}</button>,
    });
    render(
      <JsonSchemaForm
        schema={{ type: "object", properties: { role: { type: "string", enum: ["A", "B"] } } }}
        value={{ role: "A" }}
        onChange={vi.fn()}
        pre={[withSuffix]}
      />,
    );
    const suffix = screen.getByRole("button", { name: "adorn role" });
    expect(suffix.closest("[data-jsf-control]")).not.toBeNull();
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

  it("keeps an in-progress decimal as raw text while typing, then coerces on blur", () => {
    const onChange = vi.fn();
    render(<JsonSchemaForm schema={schema} value={{ Amount: "" }} onChange={onChange} />);
    const input = screen.getByRole("textbox");
    // "33." would round-trip to "33" (text changes), so it must NOT coerce —
    // otherwise the user can never type the fractional part of "33.33".
    fireEvent.change(input, { target: { value: "33." } });
    expect(onChange).toHaveBeenLastCalledWith({ Amount: "33." });
    // The completed decimal round-trips cleanly and coerces immediately.
    fireEvent.change(input, { target: { value: "33.33" } });
    expect(onChange).toHaveBeenLastCalledWith({ Amount: 33.33 });
    // Blur finalizes a still-uncoerced trailing-dot value into a Number.
    fireEvent.blur(input, { target: { value: "33." } });
    expect(onChange).toHaveBeenLastCalledWith({ Amount: 33 });
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
    const thenKeyword = ["th", "en"].join("") as "then";
    const schema: JsonSchemaObject = {
      type: "object",
      properties: {
        activity: { type: "string", enum: ["SchemeMoneyIn"] },
        input: { type: "object" },
      },
      allOf: [
        {
          if: { properties: { activity: { const: "SchemeMoneyIn" } }, required: ["activity"] },
          [thenKeyword]: {
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

  it("shrinks the label column to fit (capped at 40ch) and caps the value column at 600px by default", () => {
    const { container } = render(
      <JsonSchemaForm schema={schema} value={{ Name: "" }} onChange={vi.fn()} inline />,
    );
    expect(inlineGrid(container)?.style.gridTemplateColumns).toBe(
      "fit-content(40ch) minmax(0, 600px)",
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
      "fit-content(12rem) minmax(0, 600px)",
    );
  });

  it("caps the stacked label+value pair at 600px instead of an inline grid", () => {
    const { container } = render(
      <JsonSchemaForm schema={schema} value={{ Name: "" }} onChange={vi.fn()} />,
    );
    expect(inlineGrid(container)).toBeNull();
    const capped = [...container.querySelectorAll<HTMLElement>("div")].find(
      (el) => el.style.maxWidth === "600px",
    );
    expect(capped).toBeTruthy();
  });

  it("honors layout.valueMaxWidth in stacked mode", () => {
    const { container } = render(
      <JsonSchemaForm
        schema={schema}
        value={{ Name: "" }}
        onChange={vi.fn()}
        layout={{ mode: "stacked", valueMaxWidth: "40rem" }}
      />,
    );
    const capped = [...container.querySelectorAll<HTMLElement>("div")].find(
      (el) => el.style.maxWidth === "40rem",
    );
    expect(capped).toBeTruthy();
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

  it("renders the table as a full-width section, not an inline label/value row, when the form is inline", () => {
    const { container } = render(
      <JsonSchemaForm schema={schema} value={{ rows: [{ name: "a", port: 80 }] }} onChange={vi.fn()} inline />,
    );
    // The form is inline: its FieldsGrid owns the 2-column track template.
    const fieldsGrid = [...container.querySelectorAll<HTMLElement>("div")].find((el) =>
      el.style.gridTemplateColumns.includes("fit-content"),
    );
    expect(fieldsGrid).toBeTruthy();
    // But the table is a full-width section spanning both columns (col-span-full),
    // not crammed into the narrow value column as a 2-col label/value subgrid row.
    expect(container.querySelector(".col-span-full")).toBeTruthy();
    expect(container.querySelector(".grid-cols-subgrid")).toBeNull();
    expect(screen.getByRole("columnheader", { name: "name" })).toBeInTheDocument();
  });
});

describe("JsonSchemaForm x-layout: stack", () => {
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
    // The top-level form is inline (its FieldsGrid owns the 2-column template)...
    const fieldsGrid = [...container.querySelectorAll<HTMLElement>("div")].find((el) =>
      el.style.gridTemplateColumns.includes("fit-content"),
    );
    expect(fieldsGrid).toBeTruthy();
    // ...but the address object declares x-layout: stack, so its city/state fields
    // render stacked — there is no inline label/value subgrid row anywhere.
    expect(container.querySelector(".grid-cols-subgrid")).toBeNull();
  });

  it("labels a stacked map entry's key picker from propertyNames.title", () => {
    const schema: JsonSchemaObject = {
      type: "object",
      properties: {
        addresses: {
          type: "object",
          propertyNames: { type: "string", title: "Address Role", enum: ["Home", "Business"] },
          additionalProperties: {
            type: "object",
            "x-layout": "stack",
            properties: { city: { type: "string" } },
          },
        },
      },
    };
    render(
      <JsonSchemaForm schema={schema} value={{ addresses: { Business: {} } }} onChange={vi.fn()} />,
    );
    expect(screen.getByText("Address Role")).toBeInTheDocument();
  });
});

describe("JsonSchemaForm preferences menu", () => {
  const schema: JsonSchemaObject = {
    type: "object",
    properties: { Name: { type: "string" } },
  };
  const KEY = "test-form-prefs";

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  function openMenu(): void {
    fireEvent.click(screen.getByRole("button", { name: "Form display options" }));
  }

  function firstInput(container: HTMLElement): HTMLElement {
    const el = container.querySelector<HTMLElement>("input[data-jsf-input]");
    if (!el) throw new Error("no [data-jsf-input] input rendered");
    return el;
  }

  function inlineGrid(container: HTMLElement): HTMLElement | null {
    return (
      [...container.querySelectorAll<HTMLElement>("div")].find((el) =>
        el.style.gridTemplateColumns.includes("minmax"),
      ) ?? null
    );
  }

  it("shows the display-options trigger by default", () => {
    render(<JsonSchemaForm schema={schema} value={{ Name: "" }} onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Form display options" })).toBeInTheDocument();
  });

  it("hides the trigger when showPreferencesMenu is false", () => {
    render(
      <JsonSchemaForm
        schema={schema}
        value={{ Name: "" }}
        onChange={vi.fn()}
        showPreferencesMenu={false}
      />,
    );
    expect(screen.queryByRole("button", { name: "Form display options" })).not.toBeInTheDocument();
  });

  it("selecting xs shrinks the input and persists under the supplied key", () => {
    const { container } = render(
      <JsonSchemaForm
        schema={schema}
        value={{ Name: "" }}
        onChange={vi.fn()}
        preferencesStorageKey={KEY}
      />,
    );
    expect(firstInput(container).className).toContain("h-9");
    openMenu();
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Extra small" }));
    expect(firstInput(container).className).toContain("h-7");
    expect(JSON.parse(localStorage.getItem(KEY) as string)).toEqual({ size: "xs" });
  });

  it("selecting Inline switches to the inline grid and persists", () => {
    const { container } = render(
      <JsonSchemaForm
        schema={schema}
        value={{ Name: "" }}
        onChange={vi.fn()}
        preferencesStorageKey={KEY}
      />,
    );
    expect(inlineGrid(container)).toBeNull();
    openMenu();
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Inline" }));
    expect(inlineGrid(container)).not.toBeNull();
    expect(JSON.parse(localStorage.getItem(KEY) as string)).toEqual({ layoutMode: "inline" });
  });

  it("restores stored preferences on remount", () => {
    localStorage.setItem(KEY, JSON.stringify({ size: "xl" }));
    const { container } = render(
      <JsonSchemaForm
        schema={schema}
        value={{ Name: "" }}
        onChange={vi.fn()}
        preferencesStorageKey={KEY}
      />,
    );
    expect(firstInput(container).className).toContain("h-11");
  });

  it("persistPreferences={false} changes the instance but never touches localStorage", () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const getItem = vi.spyOn(Storage.prototype, "getItem");
    const { container } = render(
      <JsonSchemaForm
        schema={schema}
        value={{ Name: "" }}
        onChange={vi.fn()}
        persistPreferences={false}
        preferencesStorageKey={KEY}
      />,
    );
    openMenu();
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Extra small" }));
    expect(firstInput(container).className).toContain("h-7");
    expect(getItem).not.toHaveBeenCalledWith(KEY);
    expect(setItem).not.toHaveBeenCalledWith(KEY, expect.anything());
  });

  it("falls back to the size prop when stored preferences are invalid", () => {
    localStorage.setItem(KEY, JSON.stringify({ size: "gigantic" }));
    const { container } = render(
      <JsonSchemaForm
        schema={schema}
        value={{ Name: "" }}
        onChange={vi.fn()}
        size="lg"
        preferencesStorageKey={KEY}
      />,
    );
    expect(firstInput(container).className).toContain("h-10");
  });
});

describe("JsonSchemaForm x-order", () => {
  it("renders x-order keys first, the rest in document order", () => {
    const schema: JsonSchemaObject = {
      type: "object",
      // Document order is alphabetical (a Go-map emitter); x-order restores the
      // intended discriminator-first order.
      properties: {
        AddressType: { type: "string" },
        CountryCode: { type: "string" },
        fields: { type: "string" },
      },
      "x-order": ["CountryCode", "AddressType"],
    };
    const { container } = render(<JsonSchemaForm schema={schema} value={{}} onChange={vi.fn()} />);
    const labels = [...container.querySelectorAll("label")].map((el) => el.textContent);
    expect(labels).toEqual(["CountryCode", "AddressType", "fields"]);
  });
});

describe("JsonSchemaForm textarea / percent / display / link controls", () => {
  it("renders a `format: textarea` string as a multi-line textarea that commits raw text", () => {
    const onChange = vi.fn();
    const schema: JsonSchemaObject = {
      type: "object",
      properties: { Notes: { type: "string", format: "textarea" } },
    };
    const { container } = render(<JsonSchemaForm schema={schema} value={{ Notes: "line1" }} onChange={onChange} />);
    const textarea = container.querySelector("textarea");
    expect(textarea).not.toBeNull();
    expect(textarea).toHaveValue("line1");
    fireEvent.change(textarea!, { target: { value: "two\nlines" } });
    expect(onChange).toHaveBeenCalledWith({ Notes: "two\nlines" });
  });

  it("renders a `format: percent` number with a static % unit and still coerces the number", () => {
    const onChange = vi.fn();
    const schema: JsonSchemaObject = {
      type: "object",
      properties: { Commission: { type: "number", format: "percent" } },
    };
    render(<JsonSchemaForm schema={schema} value={{ Commission: 12 }} onChange={onChange} />);
    expect(screen.getByText("%")).toBeInTheDocument();
    const input = screen.getByDisplayValue("12");
    fireEvent.change(input, { target: { value: "15" } });
    expect(onChange).toHaveBeenCalledWith({ Commission: 15 });
  });

  it("renders a display heading (no input) full width from a pre-extension", () => {
    const asHeading: PreExtension = (field) =>
      field.key === "SectionTitle" ? { ...field, kind: "display", displayVariant: "heading" } : field;
    const schema: JsonSchemaObject = {
      type: "object",
      properties: { SectionTitle: { type: "string", title: "Beneficiaries" } },
    };
    const { container } = render(
      <JsonSchemaForm schema={schema} value={{}} onChange={vi.fn()} pre={[asHeading]} />,
    );
    expect(screen.getByText("Beneficiaries")).toBeInTheDocument();
    // A display field collects no value: it has no <input>/<textarea>.
    expect(container.querySelector("input")).toBeNull();
    expect(container.querySelector("textarea")).toBeNull();
  });

  it("renders a display divider as an <hr>", () => {
    const asDivider: PreExtension = (field) =>
      field.key === "Sep" ? { ...field, kind: "display", displayVariant: "divider" } : field;
    const schema: JsonSchemaObject = { type: "object", properties: { Sep: { type: "string" } } };
    const { container } = render(<JsonSchemaForm schema={schema} value={{}} onChange={vi.fn()} pre={[asDivider]} />);
    expect(container.querySelector("hr")).not.toBeNull();
  });

  it("renders a link control as an external anchor using the value as href", () => {
    const asLink: PreExtension = (field) => (field.key === "Portal" ? { ...field, kind: "link" } : field);
    const schema: JsonSchemaObject = { type: "object", properties: { Portal: { type: "string" } } };
    render(
      <JsonSchemaForm schema={schema} value={{ Portal: "https://example.com/x" }} onChange={vi.fn()} pre={[asLink]} />,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://example.com/x");
    expect(link).toHaveAttribute("target", "_blank");
  });
});
