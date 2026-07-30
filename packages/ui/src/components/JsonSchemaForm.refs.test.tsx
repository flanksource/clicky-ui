import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { JsonSchemaObject } from "./json-schema-form-types";

describe("JsonSchemaForm bundled schema references", () => {
  it("renders sections that reference definitions nested inside embedded schema versions", () => {
    const schema = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      type: "object",
      title: "Dimension input",
      additionalProperties: false,
      required: ["sourceAccount"],
      properties: {
        sourceAccount: {
          $ref: "#/$defs/version_company/$defs/companyAccountDimensions",
        },
      },
      $defs: {
        version_company: {
          $schema: "https://json-schema.org/draft/2020-12/schema",
          $defs: {
            companyAccountDimensions: {
              type: "object",
              additionalProperties: false,
              required: ["asset_category"],
              properties: {
                asset_category: {
                  type: "string",
                  title: "Asset category",
                  enum: ["vehicles", "equipment"],
                },
              },
            },
          },
        },
      },
    } as unknown as JsonSchemaObject;

    render(
      <JsonSchemaForm
        schema={schema}
        value={{
          sourceAccount: { asset_category: "vehicles" },
        }}
        onChange={vi.fn()}
        showPreferencesMenu={false}
      />,
    );

    expect(screen.getByRole("combobox", { name: /^Asset category/ })).toBeInTheDocument();
  });
});
