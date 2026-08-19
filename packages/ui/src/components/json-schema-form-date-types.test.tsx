import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { JsonSchemaObject } from "./json-schema-form-types";

const schema: JsonSchemaObject = {
  type: "object",
  properties: {
    day: { type: "string", title: "Day", format: "date" },
    startedAt: { type: "string", title: "Started at", format: "date-time" },
  },
};

describe("JsonSchemaForm date types", () => {
  it("renders calendar dates separately from date and time values", () => {
    const { container } = render(
      <JsonSchemaForm
        schema={schema}
        value={{ day: "2026-07-01", startedAt: "2026-07-01T14:30:00+03:00" }}
        onChange={vi.fn()}
        showPreferencesMenu={false}
      />,
    );

    expect(screen.getByLabelText("Day")).toHaveAttribute("type", "date");
    expect(screen.getByLabelText("Started at")).toHaveAttribute("type", "text");
    expect(
      container.querySelectorAll('input[type="datetime-local"]'),
    ).toHaveLength(1);
  });
});
