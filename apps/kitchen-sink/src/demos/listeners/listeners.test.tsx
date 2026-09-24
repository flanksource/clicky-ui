/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { JsonSchemaForm } from "@flanksource/clicky-ui";
import { findDemoEntry } from "../../demo-catalog";
import { LISTENER_EXAMPLES } from "./examples";
import { JsonSchemaFormListenersDemo } from "./JsonSchemaFormListenersDemo";
import { javascriptEvaluator, parseSchemaText } from "./listener-editor";

// Monaco cannot run under jsdom; a textarea keeps the editor's value/onChange
// contract so the tests drive real schema edits through the demo.
vi.mock("@flanksource/clicky-ui/monaco", () => ({
  MonacoSchemaEditor: ({ value, onChange }: { value: string; onChange: (next: string) => void }) => (
    <textarea aria-label="Schema JSON" value={value} onChange={(event) => onChange(event.currentTarget.value)} />
  ),
}));

afterEach(cleanup);

async function editSchema(transform: (schema: Record<string, unknown>) => unknown): Promise<void> {
  const editor = (await screen.findByLabelText("Schema JSON")) as HTMLTextAreaElement;
  const next = transform(JSON.parse(editor.value) as Record<string, unknown>);
  fireEvent.change(editor, { target: { value: typeof next === "string" ? next : JSON.stringify(next) } });
}

// What each example must look like on load, written independently of the
// schemas: the listeners derive this state from the initial value alone.
const INITIAL_STATE: Record<string, { hidden: string[]; shown: string[]; disabled: string[] }> = {
  loan: { hidden: ["Loan amount"], shown: ["Loan override"], disabled: ["Loan rate"] },
  "member-class": {
    hidden: ["Current member class group", "Change reason"],
    shown: ["New member class group"],
    disabled: [],
  },
  shipping: { hidden: ["Delivery date", "Pickup store"], shown: ["Street", "City"], disabled: [] },
  expressions: { hidden: ["Approver", "State / province"], shown: ["Coupon"], disabled: ["Discount %"] },
  cascade: { hidden: ["Region", "City"], shown: ["Country"], disabled: [] },
  nested: { hidden: [], shown: ["Shipping street"], disabled: ["Billing street", "Billing city"] },
  patch: { hidden: ["Agreed rate"], shown: ["Amount", "Rate", "API token"], disabled: [] },
  paths: { hidden: ["Loan term rates"], shown: ["Loan terms", "Fees", "Rates"], disabled: [] },
};

function labelled(label: string): HTMLInputElement {
  return screen.getByLabelText(new RegExp(`^${label.replace(/[/%]/g, "\\$&")}`)) as HTMLInputElement;
}

describe("JsonSchemaForm listeners demo", () => {
  it("is registered in the demo catalog", () => {
    expect(findDemoEntry("json-schema-form-listeners")?.component).toBe(JsonSchemaFormListenersDemo);
  });

  it("has an expectation for every example", () => {
    expect(Object.keys(INITIAL_STATE).sort()).toEqual(LISTENER_EXAMPLES.map((example) => example.id).sort());
  });

  it.each(LISTENER_EXAMPLES.map((example) => [example.id, example] as const))(
    "derives the %s example's initial shape from its value",
    (id, example) => {
      const expected = INITIAL_STATE[id]!;
      render(
        <JsonSchemaForm
          schema={example.schema}
          value={example.initialValue}
          onChange={() => {}}
          expressionEvaluator={javascriptEvaluator}
          showPreferencesMenu={false}
        />,
      );
      for (const label of expected.hidden) expect(screen.queryByText(label)).toBeNull();
      for (const label of expected.shown) expect(screen.getByText(label)).toBeTruthy();
      for (const label of expected.disabled) expect(labelled(label).disabled).toBe(true);
    },
  );

  it("patches the signed contract: amount read-only, rate retitled and bounded, token gone", () => {
    render(<JsonSchemaFormListenersDemo />);
    fireEvent.click(screen.getByRole("radio", { name: "patch · readOnly · writeOnly" }));
    expect(labelled("Amount").tagName).toBe("INPUT");

    fireEvent.click(screen.getByRole("radio", { name: /^Signed/ }));

    expect(screen.queryByRole("textbox", { name: /^Amount/ })).toBeNull();
    expect(labelled("Agreed rate").max).toBe("25");
    expect(screen.queryByText("API token")).toBeNull();
  });

  it("reveals the table and its fee column by path, and locks the rate column to value text", () => {
    render(<JsonSchemaFormListenersDemo />);
    fireEvent.click(screen.getByRole("radio", { name: "Paths · x-on-load" }));
    expect(screen.queryByRole("table")).toBeNull();

    fireEvent.click(screen.getByRole("radio", { name: "Override (01)" }));
    const headers = () => within(screen.getByRole("table")).getAllByRole("columnheader").map((th) => th.textContent);
    expect(headers()).toEqual(["Term", "Rate", ""]);

    fireEvent.click(screen.getByRole("radio", { name: "With fees (01)" }));
    expect(headers()).toEqual(["Term", "Rate", "Fee", ""]);
    expect(screen.getByDisplayValue("4.5").tagName).toBe("INPUT");

    fireEvent.click(screen.getByRole("radio", { name: "Locked (01)" }));
    expect(screen.queryByDisplayValue("4.5")).toBeNull();
    expect(screen.getByText("4.5").closest("[data-jsf-readonly]")).not.toBeNull();
  });

  it("switches examples, replacing the form and its value", () => {
    render(<JsonSchemaFormListenersDemo />);
    expect(screen.getByText("Loan override")).toBeTruthy();

    fireEvent.click(screen.getByRole("radio", { name: "Cascading resets" }));

    expect(screen.queryByText("Loan override")).toBeNull();
    expect(screen.getByText("Country")).toBeTruthy();
    expect(within(screen.getByTestId("listener-value")).queryByText(/LoanOverride/)).toBeNull();
  });

  it("re-renders the form live from an edited schema", async () => {
    render(<JsonSchemaFormListenersDemo />);
    await editSchema((schema) => {
      const properties = schema.properties as Record<string, Record<string, unknown>>;
      properties.LoanAmount!.title = "Principal";
      properties.LoanOverride!["x-on-change"] = [{ show: ["LoanAmount"] }];
      return schema;
    });
    expect(screen.getByText("Principal")).toBeTruthy();
  });

  it("keeps the last valid form and reports the parse error for malformed JSON", async () => {
    render(<JsonSchemaFormListenersDemo />);
    await editSchema(() => "{ \"type\": ");
    expect(screen.getByRole("alert").textContent).toMatch(/JSON/);
    expect(screen.getByText("Loan override")).toBeTruthy();
  });

  it("contains a broken listener in the preview until the schema is fixed", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(<JsonSchemaFormListenersDemo />);
    const properties = (schema: Record<string, unknown>) => schema.properties as Record<string, Record<string, unknown>>;

    await editSchema((schema) => {
      properties(schema).LoanOverride!["x-on-change"] = [{ hide: ["Nope"] }];
      return schema;
    });
    expect(screen.getAllByText(/unknown target "Nope"/).length).toBeGreaterThan(0);
    expect(screen.queryByText("Loan override")).toBeNull();

    await editSchema((schema) => {
      properties(schema).LoanOverride!["x-on-change"] = [];
      return schema;
    });
    expect(screen.getByText("Loan override")).toBeTruthy();
  });
});

describe("parseSchemaText", () => {
  it.each([
    ["malformed JSON", "{ \"type\": ", /JSON/],
    ["an array", "[]", /expected a JSON object schema, got array/],
    ["a scalar", "42", /expected a JSON object schema, got number/],
  ])("rejects %s", (_name, text, message) => {
    const parsed = parseSchemaText(text);
    expect("error" in parsed && parsed.error).toMatch(message);
  });

  it("returns the parsed object schema", () => {
    expect(parseSchemaText('{"type":"object","properties":{}}')).toEqual({
      schema: { type: "object", properties: {} },
    });
  });
});

describe("javascriptEvaluator", () => {
  const self = { Total: 400 };

  it("evaluates with value, self and root in scope", () => {
    expect(javascriptEvaluator({ expr: "value === 'STAFF' && self.Total < root.limit", key: "Coupon", value: "STAFF", self, root: { limit: 500 } })).toBe(true);
    expect(javascriptEvaluator({ expr: "self.Total > 1000", key: "Total", value: 400, self, root: self })).toBe(false);
  });

  it("rejects a non-boolean result", () => {
    expect(() => javascriptEvaluator({ expr: "self.Total", key: "Total", value: 400, self, root: self })).toThrow(
      /returned number, expected boolean/,
    );
  });
});
