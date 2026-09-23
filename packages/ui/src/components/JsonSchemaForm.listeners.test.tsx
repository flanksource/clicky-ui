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

  it("surfaces an error on a listener-hidden field in the form summary", () => {
    const errors = [{ instancePath: "/LoanAmount", message: "too large" }];
    const unmatched = unmatchedFormErrors({
      schema,
      value: { LoanOverride: NO },
      errors,
      hideReadOnlyFields: false,
      hideEmpty: false,
      pre: [],
    });
    expect(unmatched).toEqual(errors);
  });
});
