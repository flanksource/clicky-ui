import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import { unmatchedFormErrors } from "./json-schema-form-errors";
import type { JsonSchemaObject, JsonSchemaProperty } from "./json-schema-form-types";

// A read-only object or array is a view, like a read-only form: its subtree
// renders as the form-level `readOnly` renders it (tables as value text,
// scalars as disabled controls, writeOnly values omitted). `x-disabled` is
// not a view: its subtree keeps real, disabled controls.

const NAME = "Ada";
const TOKEN = "s3cret";
const RATE = 4.5;

function accountSchema(account: Partial<JsonSchemaProperty> = {}): JsonSchemaObject {
  return {
    type: "object",
    properties: {
      account: {
        type: "object",
        title: "Account",
        ...account,
        properties: {
          name: { type: "string", title: "Name" },
          token: { type: "string", title: "Token", writeOnly: true },
          rates: {
            type: "array",
            title: "Rates",
            "x-layout": "table",
            items: { type: "object", properties: { rate: { type: "number", title: "Rate" } } },
          },
        },
      },
    },
  };
}

const value = { account: { name: NAME, token: TOKEN, rates: [{ rate: RATE }] } };

function renderAccount(schema: JsonSchemaObject, readOnly = false) {
  return render(<JsonSchemaForm schema={schema} value={value} onChange={vi.fn()} readOnly={readOnly} showPreferencesMenu={false} />);
}

function rateCellHtml(): string {
  const cell = within(screen.getByRole("table")).getAllByRole("cell")[0];
  if (!cell) throw new Error("no rate cell");
  return cell.innerHTML;
}

describe("JsonSchemaForm read-only containers are views", () => {
  it("renders a table under a read-only object as values, exactly like a read-only form, with no add or remove", () => {
    const form = renderAccount(accountSchema(), true);
    const expected = rateCellHtml();
    form.unmount();

    renderAccount(accountSchema({ readOnly: true }));
    expect(rateCellHtml()).toBe(expected);
    expect(screen.getByRole("table").querySelector("[data-jsf-readonly]")?.textContent).toBe(String(RATE));
    expect(screen.queryByRole("button", { name: "Add item" })).toBeNull();
    expect(screen.queryByRole("button", { name: /Remove item/ })).toBeNull();
  });

  it("renders a read-only object's scalars exactly as a read-only form does", () => {
    const form = renderAccount(accountSchema(), true);
    const expected = screen.getByLabelText(/^Name/).outerHTML;
    form.unmount();

    renderAccount(accountSchema({ readOnly: true }));
    const name = screen.getByLabelText(/^Name/);
    expect(name).toBeDisabled();
    expect(name.outerHTML).toBe(expected);
  });

  it("keeps real, disabled controls under an x-disabled object, table cells and writeOnly values included", () => {
    renderAccount(accountSchema({ "x-disabled": true }));
    expect(screen.getByLabelText(/^Name/)).toBeDisabled();
    expect(screen.getByDisplayValue(String(RATE))).toBeDisabled();
    expect(screen.getByRole("table").querySelector("[data-jsf-readonly]")).toBeNull();
    expect(screen.getByDisplayValue(TOKEN)).toBeDisabled();
  });

  it.each<[string, JsonSchemaObject, boolean]>([
    ["a read-only form", accountSchema(), true],
    ["a read-only object", accountSchema({ readOnly: true }), false],
  ])("omits a writeOnly value under %s", (_name, schema, readOnly) => {
    renderAccount(schema, readOnly);
    expect(screen.queryByText("Token")).toBeNull();
    expect(screen.queryByDisplayValue(TOKEN)).toBeNull();
  });

  it("shows a writeOnly value as an input in an editable object", () => {
    renderAccount(accountSchema());
    expect(screen.getByLabelText(/^Token/)).not.toBeDisabled();
  });

  it("omits a writeOnly property of a read-only array's items", () => {
    const schema: JsonSchemaObject = {
      type: "object",
      properties: {
        keys: {
          type: "array",
          title: "Keys",
          readOnly: true,
          "x-array-display": "stacked",
          items: {
            type: "object",
            properties: { label: { type: "string", title: "Label" }, secret: { type: "string", title: "Secret", writeOnly: true } },
          },
        },
      },
    };
    render(<JsonSchemaForm schema={schema} value={{ keys: [{ label: "prod", secret: TOKEN }] }} onChange={vi.fn()} showPreferencesMenu={false} />);
    expect(screen.getByLabelText(/^Label/)).toBeDisabled();
    expect(screen.queryByText("Secret")).toBeNull();
  });
});

describe("unmatchedFormErrors and writeOnly", () => {
  const tokenError = { instancePath: "/account/token", message: "expired" };

  function unmatched(schema: JsonSchemaObject, viewOnly: boolean, errors = [tokenError]) {
    return unmatchedFormErrors({ schema, value, errors, viewOnly, hideReadOnlyFields: false, hideEmpty: false, pre: [] });
  }

  it("matches an error on a writeOnly field an editable form renders", () => {
    expect(unmatched(accountSchema(), false)).toEqual([]);
  });

  it.each<[string, JsonSchemaObject, boolean]>([
    ["a read-only form", accountSchema(), true],
    ["a read-only object", accountSchema({ readOnly: true }), false],
    [
      "a field that is itself readOnly",
      (() => {
        const schema = accountSchema();
        const account = schema.properties!.account!;
        account.properties!.token = { ...account.properties!.token, readOnly: true };
        return schema;
      })(),
      false,
    ],
  ])("surfaces the error on a writeOnly field omitted under %s", (_name, schema, viewOnly) => {
    expect(unmatched(schema, viewOnly)).toEqual([tokenError]);
  });

  it("matches the error under an x-disabled object, which still renders the field", () => {
    expect(unmatched(accountSchema({ "x-disabled": true }), false)).toEqual([]);
  });

  it("surfaces an error in a writeOnly column of a read-only table", () => {
    const schema = accountSchema();
    const rates = schema.properties!.account!.properties!.rates!;
    rates.readOnly = true;
    rates.items!.properties!.rate = { type: "number", writeOnly: true };
    const cellError = { instancePath: "/account/rates/0/rate", message: "too high" };
    expect(unmatched(schema, false, [cellError])).toEqual([cellError]);
  });
});
