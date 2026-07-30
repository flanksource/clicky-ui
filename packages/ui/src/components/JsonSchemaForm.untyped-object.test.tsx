import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { JsonSchemaObject } from "./json-schema-form-types";

describe("JsonSchemaForm untyped object composition", () => {
  it("renders controls from an untyped allOf object instead of a generic textbox", () => {
    const schema = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      type: "object",
      required: ["account"],
      properties: {
        account: {
          title: "account dimensions",
          allOf: [
            {
              $ref: "#/$defs/companyAccountDimensions",
            },
            {
              type: "object",
              properties: {
                asset: {
                  type: "string",
                  title: "Asset identifier",
                },
                acquisition_date: {
                  type: "string",
                  format: "date",
                  title: "Acquisition date",
                },
                useful_life: {
                  type: "integer",
                  minimum: 1,
                  title: "Useful life",
                },
              },
            },
          ],
          required: ["asset", "acquisition_date", "useful_life"],
          unevaluatedProperties: false,
        },
      },
      $defs: {
        companyAccountDimensions: {
          type: "object",
          properties: {
            asset_category: {
              type: "string",
              title: "Asset category",
              enum: ["vehicles", "equipment"],
            },
          },
        },
      },
    } as unknown as JsonSchemaObject;

    render(
      <JsonSchemaForm
        schema={schema}
        value={{
          account: {
            asset_category: "equipment",
            asset: "asset-1",
            acquisition_date: "2026-07-28",
            useful_life: 5,
          },
        }}
        onChange={vi.fn()}
        showPreferencesMenu={false}
      />,
    );

    expect(screen.getByRole("combobox", { name: /^Asset category/ })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /^Asset identifier/ })).toHaveValue("asset-1");
    expect(screen.getByLabelText(/^Acquisition date/)).toHaveValue("2026-07-28");
    expect(screen.getByRole("button", { name: "Open time picker" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /^Useful life/ })).toHaveValue("5");
    expect(screen.getByRole("textbox", { name: /^Useful life/ })).toHaveAttribute("inputmode", "decimal");
    expect(screen.queryByRole("textbox", { name: /^account dimensions/ })).not.toBeInTheDocument();
  });
});
