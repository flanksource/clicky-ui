import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { JsonSchemaFormError } from "./json-schema-form-error-types";
import type { JsonSchemaObject } from "./json-schema-form-types";

function renderForm(
  schema: JsonSchemaObject,
  value: Record<string, unknown>,
  errors: JsonSchemaFormError[]
) {
  return render(
    <JsonSchemaForm
      schema={schema}
      value={value}
      onChange={vi.fn()}
      errors={errors}
      showPreferencesMenu={false}
    />
  );
}

describe("JsonSchemaForm authoritative errors", () => {
  it("renders every exact field error below the control and suppresses its soft hint", () => {
    renderForm(
      {
        type: "object",
        required: ["name"],
        properties: { name: { type: "string", title: "Name" } },
      },
      { name: "" },
      [
        {
          instancePath: "/name",
          schemaPath: "#/properties/name/minLength",
          keyword: "minLength",
          message: "Enter at least three characters",
        },
        {
          instancePath: "/name",
          schemaPath: "#/required",
          keyword: "required",
          message: "Name is required",
        },
      ]
    );

    const input = screen.getByRole("textbox", { name: /^Name/ });
    const messages = input.nextElementSibling;
    expect(messages).toHaveTextContent("Enter at least three characters");
    expect(messages).toHaveTextContent("Name is required");
    expect(screen.queryByText("Required")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("alert", { name: "Form errors" })
    ).not.toBeInTheDocument();
  });

  it("announces an errored field as invalid and points it at its own message", () => {
    renderForm(
      {
        type: "object",
        required: ["name"],
        properties: { name: { type: "string", title: "Name" } },
      },
      { name: "" },
      [{ instancePath: "/name", message: "Name is required" }]
    );

    const input = screen.getByRole("textbox", { name: /^Name/ });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-required", "true");
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toBe(`${input.id}-error`);
    expect(document.getElementById(describedBy!)).toHaveTextContent(
      "Name is required"
    );
  });

  it("announces a locally-derived Required hint through aria-invalid and aria-describedby", () => {
    renderForm(
      {
        type: "object",
        required: ["name"],
        properties: { name: { type: "string", title: "Name" } },
      },
      { name: "" },
      []
    );

    const input = screen.getByRole("textbox", { name: /^Name/ });
    expect(input).toHaveAttribute("aria-invalid", "true");
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toBe(`${input.id}-error`);
    expect(document.getElementById(describedBy!)).toHaveTextContent("Required");
  });

  it("leaves a valid field free of aria-invalid while still marking it required", () => {
    renderForm(
      {
        type: "object",
        required: ["name"],
        properties: { name: { type: "string", title: "Name" } },
      },
      { name: "ok" },
      []
    );

    const input = screen.getByRole("textbox", { name: /^Name/ });
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).not.toHaveAttribute("aria-describedby");
    expect(input).toHaveAttribute("aria-required", "true");
  });

  it("matches nested and conditional fields by their JSON Pointer", () => {
    const thenKeyword = ["th", "en"].join("") as "then";
    renderForm(
      {
        type: "object",
        properties: {
          activity: { type: "string", enum: ["SchemeMoneyIn"] },
          input: { type: "object" },
        },
        allOf: [
          {
            if: {
              properties: { activity: { const: "SchemeMoneyIn" } },
              required: ["activity"],
            },
            [thenKeyword]: {
              properties: {
                input: {
                  type: "object",
                  properties: {
                    amount: { type: "string", title: "Amount" },
                  },
                },
              },
            },
          },
        ],
      },
      { activity: "SchemeMoneyIn", input: { amount: "" } },
      [{ instancePath: "/input/amount", message: "Amount does not balance" }]
    );

    const amount = screen.getByRole("textbox", { name: "Amount" });
    expect(amount.nextElementSibling).toHaveTextContent(
      "Amount does not balance"
    );
  });

  it("threads array indices into nested object field pointers", () => {
    renderForm(
      {
        type: "object",
        properties: {
          lines: {
            type: "array",
            items: {
              type: "object",
              properties: {
                account: { type: "string", title: "Account" },
              },
            },
          },
        },
      },
      { lines: [{ account: "" }] },
      [{ instancePath: "/lines/0/account", message: "Select an account" }]
    );

    // Object items collapse to summary rows by default, so the row reports the
    // error it is hiding and the message itself waits inside.
    expect(screen.getByTitle("1 error")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { expanded: false }));

    const account = screen.getByRole("textbox", { name: "Account" });
    expect(account.nextElementSibling).toHaveTextContent("Select an account");
  });

  it("escapes slash and tilde tokens while descending through maps", () => {
    renderForm(
      {
        type: "object",
        properties: {
          dimensions: {
            type: "object",
            additionalProperties: {
              type: "object",
              properties: {
                "name~code": { type: "string", title: "Dimension code" },
              },
            },
          },
        },
      },
      {
        dimensions: {
          "asset/category": { "name~code": "" },
        },
      },
      [
        {
          instancePath: "/dimensions/asset~1category/name~0code",
          message: "Choose a valid dimension",
        },
      ]
    );

    const dimension = screen.getByRole("textbox", { name: "Dimension code" });
    expect(dimension.nextElementSibling).toHaveTextContent(
      "Choose a valid dimension"
    );
  });

  it("places discriminator errors below the picker", () => {
    renderForm(
      {
        type: "object",
        "x-discriminator": "type",
        required: ["type"],
        properties: {
          type: {
            type: "string",
            title: "Type",
            enum: ["postgres", "mysql"],
            "x-enum-display": "radio",
          },
          name: { type: "string" },
        },
      },
      {},
      [{ instancePath: "/type", message: "Select a connection type" }]
    );

    const picker = screen.getByRole("radiogroup", { name: "Type" });
    expect(picker.nextElementSibling).toHaveTextContent(
      "Select a connection type"
    );
  });

  it("summarizes root and unknown-path errors without duplicating matched field errors", () => {
    renderForm(
      {
        type: "object",
        properties: {
          name: { type: "string", title: "Name" },
          profile: {
            type: "object",
            properties: { city: { type: "string", title: "City" } },
          },
        },
      },
      { name: "", profile: { city: "" } },
      [
        { instancePath: "/name", message: "Name is invalid" },
        { instancePath: "", message: "The form is inconsistent" },
        {
          instancePath: "/profile/country",
          message: "Country is not supported",
        },
      ]
    );

    const summary = screen.getByRole("alert", { name: "Form errors" });
    expect(
      within(summary).getByText("The form is inconsistent")
    ).toBeInTheDocument();
    expect(
      within(summary).getByText("/profile/country: Country is not supported")
    ).toBeInTheDocument();
    expect(
      within(summary).queryByText("Name is invalid")
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Name" }).nextElementSibling
    ).toHaveTextContent("Name is invalid");
  });
});
