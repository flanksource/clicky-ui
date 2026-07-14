import { type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
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

  it("renders schema descriptions and x-help as inline helper text", () => {
    render(
      <JsonSchemaForm
        schema={{
          type: "object",
          properties: {
            cwd: {
              type: "string",
              title: "Working directory",
              description: "Default working directory.",
              "x-help": {
                source: "fixtures --help",
                section: "CWD resolution",
                body: "Relative paths resolve from the fixture file.",
              },
            },
          },
        }}
        value={{ cwd: "" }}
        onChange={vi.fn()}
      />,
    );
    expect(
      screen.getByText(
        "Default working directory. Relative paths resolve from the fixture file.",
      ),
    ).toBeInTheDocument();
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

  it("keeps object-section post-extension output from widening the form", () => {
    const longPrompt = "Review user-visible functionality removed by this diff. ".repeat(20).trim();
    const promptPost: PostExtension = (field, nodes) =>
      field.key === "removedPrompt"
        ? {
            label: nodes.label,
            value: (
              <div className="w-full min-w-0 max-w-full overflow-hidden">
                <button
                  type="button"
                  className="flex h-9 w-full min-w-0 max-w-full items-center gap-2 overflow-hidden"
                >
                  <span className="min-w-0 max-w-[40%] flex-none truncate">claude-sonnet-with-long-name</span>
                  <span className="min-w-0 basis-0 flex-1 truncate">{longPrompt}</span>
                </button>
              </div>
            ),
          }
        : nodes;

    const { container } = render(
      <JsonSchemaForm
        schema={{
          type: "object",
          properties: {
            removedPrompt: {
              type: "object",
              title: "Functionality removed prompt",
              description: "Override the built-in prompt.",
              properties: {},
            },
          },
        }}
        value={{ removedPrompt: {} }}
        onChange={vi.fn()}
        post={[promptPost]}
      />,
    );

    const section = screen.getByText("Functionality removed prompt").closest(".col-span-full");
    expect(section).toHaveClass("min-w-0", "max-w-full");
    expect(container.querySelector(".basis-0.flex-1.truncate")).toHaveTextContent(longPrompt);
  });

  it("passes the form's root value to a post-extension so it can read sibling fields", () => {
    const seen: Array<Record<string, unknown> | undefined> = [];
    const readRoot: PostExtension = (field, nodes, ctx) => {
      if (field.key === "url") seen.push(ctx?.rootValue);
      return nodes;
    };
    render(
      <JsonSchemaForm
        schema={{ type: "object", properties: { namespace: { type: "string" }, url: { type: "string" } } }}
        value={{ namespace: "prod", url: "" }}
        onChange={vi.fn()}
        post={[readRoot]}
      />,
    );
    expect(seen.at(-1)).toEqual({ namespace: "prod", url: "" });
  });

  it("lets a post-extension replace the form root value", () => {
    const onChange = vi.fn();
    const replaceRoot: PostExtension = (field, nodes, ctx) =>
      field.key === "url"
        ? {
            ...nodes,
            value: (
              <button
                type="button"
                onClick={() => ctx?.onRootChange?.({ namespace: "prod", url: "/sample" })}
              >
                apply sample
              </button>
            ),
          }
        : nodes;
    render(
      <JsonSchemaForm
        schema={{ type: "object", properties: { namespace: { type: "string" }, url: { type: "string" } } }}
        value={{ namespace: "prod", url: "" }}
        onChange={onChange}
        post={[replaceRoot]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "apply sample" }));
    expect(onChange).toHaveBeenCalledWith({ namespace: "prod", url: "/sample" });
  });

  it("passes the form's root value to a pre-extension", () => {
    const seen: Array<Record<string, unknown> | undefined> = [];
    const readRoot: PreExtension = (field, ctx) => {
      if (field.key === "url") seen.push(ctx.rootValue);
      return field;
    };
    render(
      <JsonSchemaForm
        schema={{ type: "object", properties: { namespace: { type: "string" }, url: { type: "string" } } }}
        value={{ namespace: "staging", url: "x" }}
        onChange={vi.fn()}
        pre={[readRoot]}
      />,
    );
    expect(seen.at(-1)).toEqual({ namespace: "staging", url: "x" });
  });
});

describe("JsonSchemaForm defaults", () => {
  it("selects and commits a nested segmented discriminator default", () => {
    const onChange = vi.fn();
    render(
      <JsonSchemaForm
        schema={{
          type: "object",
          properties: {
            authentication: {
              type: "object",
              properties: {
                authType: {
                  type: "string",
                  title: "Authentication type",
                  enum: ["none", "basic"],
                  default: "none",
                  "x-enum-display": "segmented",
                  "x-enum-labels": { none: "None", basic: "Basic" },
                },
              },
              required: ["authType"],
            },
          },
        }}
        value={{}}
        onChange={onChange}
      />,
    );

    expect(screen.getByRole("radio", { name: /None/ })).toBeChecked();
    expect(onChange).toHaveBeenCalledWith({
      authentication: { authType: "none" },
    });
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

describe("JsonSchemaForm markdown format", () => {
  it("renders format md as an editable markdown field and commits string changes", () => {
    const onChange = vi.fn();
    render(
      <JsonSchemaForm
        schema={{
          type: "object",
          properties: {
            body: { type: "string", title: "Body", format: "md" },
          },
        }}
        value={{ body: "# Hello" }}
        onChange={onChange}
      />,
    );
    const editor = screen.getByLabelText("Body");
    expect(editor).toHaveValue("# Hello");
    fireEvent.change(editor, { target: { value: "## Updated" } });
    expect(onChange).toHaveBeenCalledWith({ body: "## Updated" });
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

  it("renders allOf-composed object fields as a structured form, not a string map", () => {
    const policySchema: JsonSchemaObject = {
      type: "object",
      properties: {
        shape: {
          type: "object",
          allOf: [
            {
              type: "object",
              additionalProperties: false,
              properties: {
                PayoutBankName: { type: "string", title: "Payout bank name" },
                RiskRating: { type: "string", enum: ["Low", "High"] },
              },
              required: ["RiskRating"],
            },
          ],
          unevaluatedProperties: false,
        },
      },
    } as JsonSchemaObject;

    render(
      <JsonSchemaForm
        schema={policySchema}
        value={{ shape: { PayoutBankName: "Standard Bank", RiskRating: "Low" } }}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Payout bank name")).toBeInTheDocument();
    expect(screen.getByText("RiskRating")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /add field/i })).not.toBeInTheDocument();
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

  it("renders requested enum arrays as filter pills with empty array meaning all selected", () => {
    const onChange = vi.fn();
    const schema: JsonSchemaObject = {
      type: "object",
      properties: {
        framework: {
          type: "array",
          title: "Framework",
          "x-array-display": "filter-pills",
          items: { type: "string", enum: ["go test", "vitest"] },
        },
      },
    };
    const { rerender } = render(
      <JsonSchemaForm
        schema={schema}
        value={{ framework: [] }}
        onChange={onChange}
      />,
    );

    expect(screen.getByRole("button", { name: /go test/i })).toHaveClass("bg-primary/10");
    expect(screen.getByRole("button", { name: /vitest/i })).toHaveClass("bg-primary/10");

    fireEvent.click(screen.getByRole("button", { name: /vitest/i }));
    expect(onChange).toHaveBeenLastCalledWith({ framework: ["go test"] });

    rerender(
      <JsonSchemaForm
        schema={schema}
        value={{ framework: ["go test"] }}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /vitest/i }));
    expect(onChange).toHaveBeenLastCalledWith({ framework: [] });
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

  const multi: JsonSchemaObject = {
    type: "object",
    properties: {
      firstName: { type: "string", title: "First Name" },
      lastName: { type: "string", title: "Last Name" },
      email: { type: "string", title: "Email" },
    },
  };

  it("filters displayed fields by the text typed into the menu", () => {
    render(<JsonSchemaForm schema={multi} value={{}} onChange={vi.fn()} persistPreferences={false} />);
    openMenu();
    fireEvent.change(screen.getByLabelText("Filter fields"), { target: { value: "name" } });
    expect(screen.getByText("First Name")).toBeInTheDocument();
    expect(screen.getByText("Last Name")).toBeInTheDocument();
    expect(screen.queryByText("Email")).not.toBeInTheDocument();
  });

  it("matches on the property key when a field has no title", () => {
    const keyed: JsonSchemaObject = {
      type: "object",
      properties: { alpha: { type: "string" }, beta: { type: "string" } },
    };
    render(<JsonSchemaForm schema={keyed} value={{}} onChange={vi.fn()} persistPreferences={false} />);
    openMenu();
    fireEvent.change(screen.getByLabelText("Filter fields"), { target: { value: "alph" } });
    expect(screen.getByText("alpha")).toBeInTheDocument();
    expect(screen.queryByText("beta")).not.toBeInTheDocument();
  });

  it("shows a no-match message when the filter excludes every field", () => {
    render(<JsonSchemaForm schema={multi} value={{}} onChange={vi.fn()} persistPreferences={false} />);
    openMenu();
    fireEvent.change(screen.getByLabelText("Filter fields"), { target: { value: "zzz" } });
    expect(screen.queryByText("First Name")).not.toBeInTheDocument();
    expect(screen.getByText(/No fields match/)).toBeInTheDocument();
  });

  it("restores hidden fields when the filter is cleared", () => {
    render(<JsonSchemaForm schema={multi} value={{}} onChange={vi.fn()} persistPreferences={false} />);
    openMenu();
    fireEvent.change(screen.getByLabelText("Filter fields"), { target: { value: "email" } });
    expect(screen.queryByText("First Name")).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Clear filter"));
    expect(screen.getByText("First Name")).toBeInTheDocument();
  });

  it("marks the trigger active while a filter is applied and is never persisted", () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    render(
      <JsonSchemaForm
        schema={multi}
        value={{}}
        onChange={vi.fn()}
        preferencesStorageKey={KEY}
      />,
    );
    const trigger = screen.getByRole("button", { name: "Form display options" });
    expect(trigger.className).not.toContain("text-primary");
    openMenu();
    fireEvent.change(screen.getByLabelText("Filter fields"), { target: { value: "name" } });
    expect(trigger.className).toContain("text-primary");
    expect(setItem).not.toHaveBeenCalledWith(KEY, expect.stringContaining("fieldFilter"));
  });

  it("filters only top-level fields, leaving nested object children intact", () => {
    const nested: JsonSchemaObject = {
      type: "object",
      properties: {
        profile: {
          type: "object",
          title: "Profile",
          properties: { nickname: { type: "string", title: "Nickname" } },
        },
        email: { type: "string", title: "Email" },
      },
    };
    render(
      <JsonSchemaForm schema={nested} value={{ profile: {} }} onChange={vi.fn()} persistPreferences={false} />,
    );
    openMenu();
    fireEvent.change(screen.getByLabelText("Filter fields"), { target: { value: "profile" } });
    expect(screen.getByText("Profile")).toBeInTheDocument();
    // The matched parent keeps its child even though the child does not match.
    expect(screen.getByText("Nickname")).toBeInTheDocument();
    expect(screen.queryByText("Email")).not.toBeInTheDocument();
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

describe("JsonSchemaForm enum icon grid", () => {
  const schema: JsonSchemaObject = {
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: ["postgres", "mysql"],
        "x-enum-icons": { postgres: "postgres", mysql: "mysql" },
      },
    },
  };

  it("renders a selectable card per option and commits the value on click", () => {
    const onChange = vi.fn();
    render(<JsonSchemaForm schema={schema} value={{ type: "" }} onChange={onChange} />);
    expect(screen.getAllByRole("radio")).toHaveLength(2);
    fireEvent.click(screen.getByRole("radio", { name: /mysql/i }));
    expect(onChange).toHaveBeenCalledWith({ type: "mysql" });
  });

  it("filters the grid by the search query", () => {
    render(<JsonSchemaForm schema={schema} value={{ type: "" }} onChange={vi.fn()} />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "post" } });
    const cards = screen.getAllByRole("radio");
    expect(cards).toHaveLength(1);
    expect(screen.getByRole("radio", { name: /postgres/i })).toBeInTheDocument();
  });
});

describe("JsonSchemaForm discriminator wizard", () => {
  const schema: JsonSchemaObject = {
    type: "object",
    "x-discriminator": "type",
    required: ["type"],
    properties: {
      type: {
        type: "string",
        title: "Type",
        enum: ["postgres", "mysql"],
        "x-enum-icons": { postgres: "postgres", mysql: "mysql" },
      },
      name: { type: "string", title: "Name" },
    },
  };

  it("shows only the type picker until a kind is chosen", () => {
    render(<JsonSchemaForm schema={schema} value={{}} onChange={vi.fn()} />);
    expect(screen.getAllByRole("radio")).toHaveLength(2);
    expect(screen.queryByText("Name")).not.toBeInTheDocument();
  });

  it("commits the chosen kind", () => {
    const onChange = vi.fn();
    render(<JsonSchemaForm schema={schema} value={{}} onChange={onChange} />);
    fireEvent.click(screen.getByRole("radio", { name: /postgres/i }));
    expect(onChange).toHaveBeenCalledWith({ type: "postgres" });
  });

  it("renders the branch fields + a change affordance once a kind is chosen, hiding the picker", () => {
    render(<JsonSchemaForm schema={schema} value={{ type: "postgres" }} onChange={vi.fn()} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /change type/i })).toBeInTheDocument();
  });

  it("clears the kind when the change affordance is clicked", () => {
    const onChange = vi.fn();
    render(<JsonSchemaForm schema={schema} value={{ type: "postgres", name: "x" }} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /change type/i }));
    expect(onChange).toHaveBeenCalledWith({ name: "x" });
  });
});

describe("JsonSchemaForm x-clicky-order", () => {
  it("orders fields by per-property x-clicky-order regardless of document order", () => {
    const schema: JsonSchemaObject = {
      type: "object",
      properties: {
        alpha: { type: "string", title: "Alpha", "x-clicky-order": 2 },
        zeta: { type: "string", title: "Zeta", "x-clicky-order": 0 },
        mid: { type: "string", title: "Mid", "x-clicky-order": 1 },
        tail: { type: "string", title: "Tail" }, // no order → keeps doc order, after
      },
    };
    render(<JsonSchemaForm schema={schema} value={{}} onChange={vi.fn()} />);
    const order = screen
      .getAllByText(/^(Alpha|Zeta|Mid|Tail)$/)
      .map((n) => n.textContent);
    expect(order).toEqual(["Zeta", "Mid", "Alpha", "Tail"]);
  });
});

describe("JsonSchemaForm presentation extensions", () => {
  it("renders x-enum-display: segmented as a radiogroup and commits a selection", () => {
    const schema: JsonSchemaObject = {
      type: "object",
      properties: {
        mode: {
          type: "string",
          title: "Mode",
          enum: ["auto", "manual"],
          "x-enum-display": "segmented",
        },
      },
    };
    const onChange = vi.fn();
    render(
      <JsonSchemaForm
        schema={schema}
        value={{ mode: "auto" }}
        onChange={onChange}
        showPreferencesMenu={false}
      />,
    );
    const group = screen.getByRole("radiogroup", { name: "Mode" });
    expect(within(group).getByRole("radio", { name: "auto" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    fireEvent.click(within(group).getByRole("radio", { name: "manual" }));
    expect(onChange).toHaveBeenCalledWith({ mode: "manual" });
  });

  it("renders x-input-suffix-icon in the input adornment wrapper and reserves padding", () => {
    const schema: JsonSchemaObject = {
      type: "object",
      properties: {
        token: { type: "string", title: "Token", "x-input-suffix-icon": "check" },
      },
    };
    const { container } = render(
      <JsonSchemaForm
        schema={schema}
        value={{ token: "" }}
        onChange={vi.fn()}
        showPreferencesMenu={false}
      />,
    );
    expect(container.querySelector("[data-jsf-control]")).not.toBeNull();
    expect(container.querySelector("input[data-jsf-input]")).toHaveClass("pr-8");
    // The adornment icon is sized to size-4 to match the library's InputField icon.
    expect(container.querySelector("[data-jsf-control] .size-4")).not.toBeNull();
  });

  it("applies object-level x-classes to the fields grid container", () => {
    const schema: JsonSchemaObject = {
      type: "object",
      "x-columns": 2,
      "x-classes": "gap-2 marker-section-classes",
      properties: {
        a: { type: "string", title: "A" },
        b: { type: "string", title: "B" },
      },
    };
    const { container } = render(
      <JsonSchemaForm
        schema={schema}
        value={{}}
        onChange={vi.fn()}
        showPreferencesMenu={false}
      />,
    );
    const grid = container.querySelector(".marker-section-classes");
    expect(grid).not.toBeNull();
    expect(grid).toHaveClass("grid");
    expect(grid).toHaveStyle({ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" });
  });

  it("renders a native number input (step/min/max) when the schema declares multipleOf", () => {
    const schema: JsonSchemaObject = {
      type: "object",
      properties: {
        cost: { type: "number", title: "Cost", minimum: 0, maximum: 5, multipleOf: 0.01 },
      },
    };
    const { container } = render(
      <JsonSchemaForm
        schema={schema}
        value={{ cost: 0.5 }}
        onChange={vi.fn()}
        showPreferencesMenu={false}
      />,
    );
    const input = container.querySelector("input[data-jsf-input]");
    expect(input).toHaveAttribute("type", "number");
    expect(input).toHaveAttribute("step", "0.01");
    expect(input).toHaveAttribute("min", "0");
    expect(input).toHaveAttribute("max", "5");
    expect(input).toHaveValue(0.5);
  });

  it("renders a bounded number as a progress slider with x-number-display: slider", () => {
    const onChange = vi.fn();
    const schema: JsonSchemaObject = {
      type: "object",
      properties: {
        tokens: {
          type: "integer",
          title: "Tokens",
          minimum: 0,
          maximum: 64000,
          multipleOf: 1,
          "x-number-display": "slider",
        },
      },
    };
    const { container } = render(
      <JsonSchemaForm
        schema={schema}
        value={{ tokens: 8000 }}
        onChange={onChange}
        showPreferencesMenu={false}
      />,
    );
    const slider = container.querySelector("input[data-jsf-input]");
    expect(slider).toHaveAttribute("type", "range");
    expect(slider).toHaveAttribute("min", "0");
    expect(slider).toHaveAttribute("max", "64000");
    expect(slider).toHaveAttribute("step", "1");
    expect(slider).toHaveValue("8000");
    // The live value is shown alongside the track (locale-formatted).
    expect(screen.getByText(/8[,.\s]?000/)).toBeInTheDocument();
    fireEvent.change(slider!, { target: { value: "12000" } });
    expect(onChange).toHaveBeenCalledWith({ tokens: 12000 });
  });

  it("falls back to a numeric input when x-number-display: slider lacks a maximum", () => {
    const schema: JsonSchemaObject = {
      type: "object",
      properties: {
        tokens: { type: "integer", title: "Tokens", multipleOf: 1, "x-number-display": "slider" },
      },
    };
    const { container } = render(
      <JsonSchemaForm
        schema={schema}
        value={{ tokens: 8000 }}
        onChange={vi.fn()}
        showPreferencesMenu={false}
      />,
    );
    // No maximum → not a range slider; the native number input (multipleOf) stands.
    expect(container.querySelector("input[data-jsf-input]")).toHaveAttribute("type", "number");
  });

  it("keeps a number field as a token-friendly text input without multipleOf", () => {
    const schema: JsonSchemaObject = {
      type: "object",
      properties: { amount: { type: "number", title: "Amount" } },
    };
    const { container } = render(
      <JsonSchemaForm
        schema={schema}
        value={{ amount: 3 }}
        onChange={vi.fn()}
        showPreferencesMenu={false}
      />,
    );
    expect(container.querySelector("input[data-jsf-input]")).toHaveAttribute("type", "text");
  });

  it("merges x-label-classes / x-input-classes onto the label and input", () => {
    const schema: JsonSchemaObject = {
      type: "object",
      properties: {
        name: {
          type: "string",
          title: "Name",
          "x-label-classes": "text-primary",
          "x-input-classes": "font-mono",
        },
      },
    };
    const { container } = render(
      <JsonSchemaForm
        schema={schema}
        value={{ name: "" }}
        onChange={vi.fn()}
        showPreferencesMenu={false}
      />,
    );
    expect(screen.getByText("Name").closest("label")).toHaveClass("text-primary");
    expect(container.querySelector("input[data-jsf-input]")).toHaveClass("font-mono");
  });

  it("lays fields out in a grid, honouring x-columns and per-field x-col-span", () => {
    const schema: JsonSchemaObject = {
      type: "object",
      "x-columns": 3,
      properties: {
        model: { type: "string", title: "Model", "x-col-span": 2 },
        effort: { type: "string", title: "Effort" },
      },
    };
    render(
      <JsonSchemaForm
        schema={schema}
        value={{}}
        onChange={vi.fn()}
        showPreferencesMenu={false}
      />,
    );
    expect(screen.getByText("Model").closest('[style*="grid-column"]')).toHaveStyle({
      gridColumn: "span 2 / span 2",
    });
    expect(screen.getByText("Effort").closest('[style*="grid-column"]')).toHaveStyle({
      gridColumn: "span 1 / span 1",
    });
  });

  it("keeps a 4-across span-3 row on one line in a 12-column grid (x-columns is not capped below 12)", () => {
    const schema: JsonSchemaObject = {
      type: "object",
      "x-columns": 12,
      properties: {
        cost: { type: "number", title: "Cost", "x-col-span": 3 },
        tokens: { type: "integer", title: "Tokens", "x-col-span": 3 },
        turns: { type: "integer", title: "Turns", "x-col-span": 3 },
        timeout: { type: "string", title: "Timeout", "x-col-span": 3 },
      },
    };
    render(
      <JsonSchemaForm
        schema={schema}
        value={{}}
        onChange={vi.fn()}
        showPreferencesMenu={false}
      />,
    );
    // 4 fields × span-3 == 12 tracks == one row.
    for (const label of ["Cost", "Tokens", "Turns", "Timeout"]) {
      expect(screen.getByText(label).closest('[style*="grid-column"]')).toHaveStyle({
        gridColumn: "span 3 / span 3",
      });
    }
  });

  it("shows/hides conditional fields via an if/then const discriminator", () => {
    const schema: JsonSchemaObject = {
      type: "object",
      properties: {
        backend: {
          type: "string",
          title: "Backend",
          enum: ["claude", "codex"],
        },
      },
      allOf: [
        {
          if: { properties: { backend: { const: "codex" } } },
          // eslint-disable-next-line unicorn/no-thenable -- JSON Schema conditional keyword, not a Promise thenable
          then: { properties: { sandbox: { type: "string", title: "Sandbox" } } },
        },
      ],
    };
    const { rerender } = render(
      <JsonSchemaForm
        schema={schema}
        value={{ backend: "claude" }}
        onChange={vi.fn()}
        showPreferencesMenu={false}
      />,
    );
    expect(screen.queryByText("Sandbox")).not.toBeInTheDocument();
    rerender(
      <JsonSchemaForm
        schema={schema}
        value={{ backend: "codex" }}
        onChange={vi.fn()}
        showPreferencesMenu={false}
      />,
    );
    expect(screen.getByText("Sandbox")).toBeInTheDocument();
  });
});
