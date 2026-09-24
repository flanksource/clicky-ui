import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import { unmatchedFormErrors } from "./json-schema-form-errors";
import type { ExpressionEvaluator, JsonSchemaObject } from "./json-schema-form-types";

const YES = "01";
const NO = "00";
const DEFAULT_RATE = 3;

const schema: JsonSchemaObject = {
  type: "object",
  properties: {
    LoanOverride: {
      type: "string",
      title: "Loan override",
      "x-on-change": [
        {
          when: { const: YES },
          show: ["LoanAmount"],
          require: ["LoanAmount"],
          enable: ["LoanRate"],
          set: { LoanAmount: 1000 },
          else: { hide: ["LoanAmount"], disable: ["LoanRate"], reset: ["LoanAmount", "LoanRate"] },
        },
      ],
    },
    LoanAmount: { type: "number", title: "Loan amount" },
    LoanRate: { type: "number", title: "Loan rate", default: DEFAULT_RATE },
  },
};

function Harness({
  initial,
  onValue,
  evaluate,
  formSchema = schema,
}: {
  initial: Record<string, unknown>;
  onValue?: (value: Record<string, unknown>) => void;
  evaluate?: ExpressionEvaluator;
  formSchema?: JsonSchemaObject;
}) {
  const [value, setValue] = useState<Record<string, unknown>>(initial);
  return (
    <JsonSchemaForm
      schema={formSchema}
      value={value}
      onChange={(next) => {
        onValue?.(next);
        setValue(next);
      }}
      showPreferencesMenu={false}
      {...(evaluate ? { expressionEvaluator: evaluate } : {})}
    />
  );
}

function isMarkedRequired(label: string): boolean {
  return screen.getByText(label).closest("label")?.textContent?.includes("*") ?? false;
}

describe("JsonSchemaForm x-on-change", () => {
  it("derives hidden/disabled state from a loaded value, with no edit", () => {
    render(<Harness initial={{ LoanOverride: NO, LoanRate: 5 }} />);
    expect(screen.queryByText("Loan amount")).toBeNull();
    expect(screen.getByLabelText(/^Loan rate/)).toBeDisabled();
  });

  it("shows, requires and enables on a live edit, committing the set value in the same change", () => {
    const onValue = vi.fn();
    render(<Harness initial={{ LoanOverride: NO }} onValue={onValue} />);

    fireEvent.change(screen.getByLabelText(/^Loan override/), { target: { value: YES } });

    expect(onValue).toHaveBeenLastCalledWith({ LoanOverride: YES, LoanAmount: 1000, LoanRate: DEFAULT_RATE });
    expect(screen.getByLabelText(/^Loan amount/)).toHaveValue("1000");
    expect(isMarkedRequired("Loan amount")).toBe(true);
    expect(screen.getByLabelText(/^Loan rate/)).not.toBeDisabled();
  });

  it("hides again and resets the targets when the guard stops holding", () => {
    const onValue = vi.fn();
    render(<Harness initial={{ LoanOverride: YES, LoanAmount: 50, LoanRate: 9 }} onValue={onValue} />);

    fireEvent.change(screen.getByLabelText(/^Loan override/), { target: { value: NO } });

    expect(onValue).toHaveBeenLastCalledWith({ LoanOverride: NO, LoanRate: DEFAULT_RATE });
    expect(screen.queryByText("Loan amount")).toBeNull();
  });

  it("renders a static x-disabled field as a disabled input, not read-only text", () => {
    const disabledSchema: JsonSchemaObject = {
      type: "object",
      properties: { Code: { type: "string", title: "Code", "x-disabled": true } },
    };
    render(<JsonSchemaForm schema={disabledSchema} value={{ Code: "abc" }} onChange={vi.fn()} showPreferencesMenu={false} />);
    expect(screen.getByLabelText(/^Code/)).toBeDisabled();
    expect(screen.getByLabelText(/^Code/)).toHaveValue("abc");
  });

  it("evaluates when.expr through the host's expressionEvaluator", () => {
    const exprSchema: JsonSchemaObject = {
      type: "object",
      properties: {
        Tier: {
          type: "string",
          title: "Tier",
          "x-on-change": [{ when: { expr: "value startsWith 'gold'" }, show: ["Perk"], else: { hide: ["Perk"] } }],
        },
        Perk: { type: "string", title: "Perk" },
      },
    };
    const evaluate: ExpressionEvaluator = ({ value }) => typeof value === "string" && value.startsWith("gold");
    render(<Harness formSchema={exprSchema} initial={{ Tier: "silver" }} evaluate={evaluate} />);
    expect(screen.queryByText("Perk")).toBeNull();

    fireEvent.change(screen.getByLabelText(/^Tier/), { target: { value: "gold-plus" } });
    expect(screen.getByText("Perk")).toBeInTheDocument();
  });

  it("patches standard keywords onto a sibling while the guard holds, and drops them when it stops", () => {
    const RATE_CEILING = 25;
    const patchSchema: JsonSchemaObject = {
      type: "object",
      properties: {
        Mode: {
          type: "string",
          title: "Mode",
          "x-on-change": [
            {
              when: { const: "locked" },
              patch: {
                Reference: { readOnly: true },
                Rate: { title: "Override rate", minimum: 0, maximum: RATE_CEILING },
              },
            },
          ],
        },
        Reference: { type: "string", title: "Reference" },
        // multipleOf opts the field into a native number input, which carries min/max.
        Rate: { type: "number", title: "Rate", multipleOf: 0.5 },
      },
    };
    render(<Harness formSchema={patchSchema} initial={{ Mode: "open", Reference: "REF-1", Rate: 2 }} />);
    expect(screen.getByLabelText(/^Reference/).tagName).toBe("INPUT");
    expect(screen.queryByText("Override rate")).toBeNull();

    fireEvent.change(screen.getByLabelText(/^Mode/), { target: { value: "locked" } });

    // readOnly swaps the input for value text; the title and bounds follow the patch.
    expect(screen.queryByRole("textbox", { name: /^Reference/ })).toBeNull();
    expect(screen.getByText("REF-1").closest("[data-jsf-readonly]")).not.toBeNull();
    const rate = screen.getByLabelText(/^Override rate/);
    expect(rate).toHaveAttribute("min", "0");
    expect(rate).toHaveAttribute("max", String(RATE_CEILING));

    fireEvent.change(screen.getByLabelText(/^Mode/), { target: { value: "open" } });
    expect(screen.getByLabelText(/^Reference/).tagName).toBe("INPUT");
    expect(screen.getByLabelText(/^Rate/)).not.toHaveAttribute("max");
  });

  it("applies listeners inside a nested object", () => {
    const nested: JsonSchemaObject = {
      type: "object",
      properties: { Loan: { type: "object", title: "Loan", properties: schema.properties! } },
    };
    render(<Harness formSchema={nested} initial={{ Loan: { LoanOverride: NO } }} />);
    expect(screen.queryByText("Loan amount")).toBeNull();

    fireEvent.change(screen.getByLabelText(/^Loan override/), { target: { value: YES } });
    expect(screen.getByLabelText(/^Loan amount/)).toHaveValue("1000");
  });

  it("toggles a table-array group under a sibling object through a path target", () => {
    const stepSchema: JsonSchemaObject = {
      type: "object",
      properties: {
        input: {
          type: "object",
          title: "Input",
          properties: { X: { type: "string", title: "Option" } },
          "x-on-change": [
            { when: { properties: { X: { const: YES } } }, show: ["mf/G"], else: { hide: ["mf/G"] } },
          ],
        },
        mf: {
          type: "object",
          title: "Multi fields",
          properties: {
            G: {
              type: "array",
              title: "Rates group",
              "x-layout": "table",
              items: { type: "object", properties: { Rate: { type: "number", title: "Rate" } } },
            },
          },
        },
      },
    };
    render(<Harness formSchema={stepSchema} initial={{ input: { X: NO }, mf: { G: [{ Rate: 4 }] } }} />);
    expect(screen.queryByRole("table")).toBeNull();

    fireEvent.change(screen.getByLabelText(/^Option/), { target: { value: YES } });
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Rate" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/^Option/), { target: { value: NO } });
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("surfaces an error inside a path-hidden group in the form summary", () => {
    const stepSchema: JsonSchemaObject = {
      type: "object",
      "x-on-load": [{ hide: ["mf/G"] }],
      properties: {
        mf: {
          type: "object",
          properties: {
            G: { type: "array", "x-layout": "table", items: { type: "object", properties: { Rate: { type: "number" } } } },
            H: { type: "array", "x-layout": "table", items: { type: "object", properties: { Rate: { type: "number" } } } },
          },
        },
      },
    };
    const hiddenError = { instancePath: "/mf/G/0/Rate", message: "too large" };
    const shownError = { instancePath: "/mf/H/0/Rate", message: "too small" };
    const unmatched = unmatchedFormErrors({
      schema: stepSchema,
      value: { mf: { G: [{ Rate: 1 }], H: [{ Rate: 1 }] } },
      errors: [hiddenError, shownError],
      viewOnly: false,
      hideReadOnlyFields: false,
      hideEmpty: false,
      pre: [],
    });
    expect(unmatched).toEqual([hiddenError]);
  });

  it("applies a nested object's x-on-load before its fields' x-on-change", () => {
    const loadSchema: JsonSchemaObject = {
      type: "object",
      properties: {
        Loan: {
          type: "object",
          title: "Loan",
          "x-on-load": [{ hide: ["Note", "Rate"] }],
          properties: {
            Kind: { type: "string", title: "Kind", "x-on-change": [{ when: { const: "custom" }, show: ["Rate"] }] },
            Rate: { type: "number", title: "Rate" },
            Note: { type: "string", title: "Note" },
          },
        },
      },
    };
    render(<Harness formSchema={loadSchema} initial={{ Loan: { Kind: "standard" } }} />);
    expect(screen.queryByText("Note")).toBeNull();
    expect(screen.queryByText("Rate")).toBeNull();

    fireEvent.change(screen.getByLabelText(/^Kind/), { target: { value: "custom" } });
    expect(screen.getByLabelText(/^Rate/)).toBeInTheDocument();
    expect(screen.queryByText("Note")).toBeNull();
  });

  it("surfaces an error on a listener-hidden field in the form summary", () => {
    const errors = [{ instancePath: "/LoanAmount", message: "too large" }];
    const unmatched = unmatchedFormErrors({
      schema,
      value: { LoanOverride: NO },
      errors,
      viewOnly: false,
      hideReadOnlyFields: false,
      hideEmpty: false,
      pre: [],
    });
    expect(unmatched).toEqual(errors);
  });
});
