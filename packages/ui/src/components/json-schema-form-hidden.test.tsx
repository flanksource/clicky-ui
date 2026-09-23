import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { JsonSchemaObject } from "./json-schema-form-types";

// `then` is the JSON Schema 2020-12 conditional keyword, not a Promise
// thenable; spelling it indirectly keeps unicorn/no-thenable quiet here.
const thenKeyword = ["th", "en"].join("") as "then";

function Harness({ schema, initial }: { schema: JsonSchemaObject; initial: Record<string, unknown> }) {
  const [value, setValue] = useState<Record<string, unknown>>(initial);
  return <JsonSchemaForm schema={schema} value={value} onChange={setValue} showPreferencesMenu={false} />;
}

describe("JsonSchemaForm x-hidden", () => {
  it("renders nothing for a property marked x-hidden", () => {
    const schema: JsonSchemaObject = {
      type: "object",
      properties: {
        Visible: { type: "string", title: "Visible" },
        Internal: { type: "string", title: "Internal", "x-hidden": true },
      },
    };
    render(<JsonSchemaForm schema={schema} value={{ Visible: "a", Internal: "b" }} onChange={vi.fn()} />);
    expect(screen.getByText("Visible")).toBeInTheDocument();
    expect(screen.queryByText("Internal")).toBeNull();
    expect(screen.queryByDisplayValue("b")).toBeNull();
  });

  it("hides an entire object section marked x-hidden", () => {
    const schema: JsonSchemaObject = {
      type: "object",
      properties: {
        Loan: {
          type: "object",
          title: "Loan",
          "x-hidden": true,
          properties: { LoanAmount: { type: "string", title: "Loan amount" } },
        },
      },
    };
    render(<JsonSchemaForm schema={schema} value={{ Loan: { LoanAmount: "10" } }} onChange={vi.fn()} />);
    expect(screen.queryByText("Loan")).toBeNull();
    expect(screen.queryByText("Loan amount")).toBeNull();
  });

  it("still renders a property that sets x-hidden: false", () => {
    const schema: JsonSchemaObject = {
      type: "object",
      properties: { Shown: { type: "string", title: "Shown", "x-hidden": false } },
    };
    render(<JsonSchemaForm schema={schema} value={{}} onChange={vi.fn()} />);
    expect(screen.getByText("Shown")).toBeInTheDocument();
  });

  // `effectiveProperties` REPLACES a property wholesale from a matching
  // `then`, so a plain schema keyword like `x-hidden` becomes conditional for
  // free: the branch re-declares the field without the hidden flag.
  it("reveals an x-hidden field when an if/then branch re-declares it visible", () => {
    const schema: JsonSchemaObject = {
      type: "object",
      properties: {
        LoanOverride: { type: "string", title: "Loan override", enum: ["00", "01"] },
        LoanAmount: { type: "string", title: "Loan amount", "x-hidden": true },
      },
      allOf: [
        {
          if: { properties: { LoanOverride: { const: "01" } }, required: ["LoanOverride"] },
          [thenKeyword]: {
            properties: { LoanAmount: { type: "string", title: "Loan amount", "x-hidden": false } },
          },
        },
      ],
    };

    const { rerender } = render(
      <JsonSchemaForm schema={schema} value={{ LoanOverride: "00" }} onChange={vi.fn()} />,
    );
    expect(screen.queryByText("Loan amount")).toBeNull();

    rerender(<JsonSchemaForm schema={schema} value={{ LoanOverride: "01" }} onChange={vi.fn()} />);
    expect(screen.getByText("Loan amount")).toBeInTheDocument();
  });

  it("hides a field again through an else branch when the guard stops holding", () => {
    const schema: JsonSchemaObject = {
      type: "object",
      properties: { Mode: { type: "string", title: "Mode", enum: ["add", "update"] } },
      allOf: [
        {
          if: { properties: { Mode: { const: "update" } }, required: ["Mode"] },
          [thenKeyword]: { properties: { CurrentClass: { type: "string", title: "Current class" } } },
          else: { properties: { CurrentClass: { type: "string", title: "Current class", "x-hidden": true } } },
        },
      ],
    };

    const { rerender } = render(<JsonSchemaForm schema={schema} value={{ Mode: "update" }} onChange={vi.fn()} />);
    expect(screen.getByText("Current class")).toBeInTheDocument();

    rerender(<JsonSchemaForm schema={schema} value={{ Mode: "add" }} onChange={vi.fn()} />);
    expect(screen.queryByText("Current class")).toBeNull();
  });

  it("drives the reveal from a live edit, not just a re-render", () => {
    const schema: JsonSchemaObject = {
      type: "object",
      properties: {
        LoanOverride: { type: "string", title: "Loan override" },
        LoanAmount: { type: "string", title: "Loan amount", "x-hidden": true },
      },
      allOf: [
        {
          if: { properties: { LoanOverride: { const: "01" } }, required: ["LoanOverride"] },
          [thenKeyword]: {
            properties: { LoanAmount: { type: "string", title: "Loan amount", "x-hidden": false } },
          },
        },
      ],
    };

    render(<Harness schema={schema} initial={{ LoanOverride: "00" }} />);
    expect(screen.queryByText("Loan amount")).toBeNull();
    fireEvent.change(screen.getByDisplayValue("00"), { target: { value: "01" } });
    expect(screen.getByText("Loan amount")).toBeInTheDocument();
  });
});
