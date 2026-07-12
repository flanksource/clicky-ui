import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { JsonSchemaObject } from "./json-schema-form-types";

const secretSchema: JsonSchemaObject = {
  type: "object",
  properties: {
    apiKey: { type: "string", title: "API key", format: "password" },
    name: { type: "string", title: "Name" },
  },
};

describe("format: password string fields", () => {
  it("renders a masked input with autocomplete disabled", () => {
    const { container } = render(
      <JsonSchemaForm schema={secretSchema} value={{ apiKey: "s3cret", name: "ops" }} onChange={vi.fn()} />,
    );
    const inputs = container.querySelectorAll<HTMLInputElement>("input[data-jsf-input]");
    const byType = Array.from(inputs).map((i) => i.type);
    expect(byType).toContain("password");
    expect(byType).toContain("text");
    const secret = Array.from(inputs).find((i) => i.type === "password")!;
    expect(secret.autocomplete).toBe("new-password");
    expect(secret.value).toBe("s3cret");
  });

  it("masks the value (and its hover title) of a read-only field", () => {
    const readOnlySchema: JsonSchemaObject = {
      type: "object",
      properties: {
        apiKey: { type: "string", title: "API key", format: "password", readOnly: true },
        name: { type: "string", title: "Name", readOnly: true },
      },
    };
    const { container } = render(
      <JsonSchemaForm schema={readOnlySchema} value={{ apiKey: "s3cret", name: "ops" }} onChange={vi.fn()} />,
    );
    const values = Array.from(container.querySelectorAll("[data-jsf-readonly]"));
    const texts = values.map((v) => v.textContent);
    expect(texts).toContain("••••••••");
    expect(texts).not.toContain("s3cret");
    for (const v of values) {
      expect(v.getAttribute("title")).not.toBe("s3cret");
    }
  });
});
